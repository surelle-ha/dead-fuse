// apps/dashboard/server/api/admin/users/[userId]/plan.post.ts (UPDATED)
//
// When an admin assigns a plan whose limit is LOWER than the user's current
// active project count, excess active projects are immediately suspended.
// The user will see the PlanDowngradeModal on their next visit and can choose
// which projects to retain (swap suspended ↔ active within the limit).

import { requireAdmin } from "../../../../utils/auth";
import { useSupabaseAdmin } from "../../../../utils/supabase";
import { hasDeletedAtColumn } from "../../../projects/utils";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const sb = useSupabaseAdmin();
  const { userId } = event.context.params as { userId: string };
  const body = await readBody(event);
  const planId = body?.planId ? String(body.planId) : null;
  let projectLimit = body?.projectLimit != null ? Number(body.projectLimit) : null;
  const expiresAt = body?.expiresAt ? new Date(String(body.expiresAt)) : null;

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing target user id." });
  }

  if (planId) {
    const { data: plan, error: planError } = await sb
      .from("pricing_plans")
      .select("project_limit")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      throw createError({ statusCode: 404, statusMessage: "Pricing plan not found." });
    }

    if (projectLimit == null) {
      projectLimit = plan.project_limit;
    }
  }

  if (projectLimit == null || !Number.isInteger(projectLimit) || projectLimit <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Project limit must be a positive whole number." });
  }

  const updatePayload = {
    plan_id: planId,
    plan_expires_at:
      expiresAt instanceof Date && !Number.isNaN(expiresAt.getTime())
        ? expiresAt.toISOString()
        : null,
    project_limit: projectLimit,
  };

  const { data: updatedUser, error: updateError } = await sb
    .from("users")
    .update(updatePayload)
    .eq("id", userId)
    .select("id, email, role, project_limit, plan_id, plan_expires_at")
    .single();

  if (updateError || !updatedUser) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError?.message ?? "Failed to update user plan.",
    });
  }

  // ── Slot enforcement: suspend excess projects ─────────────────────────────
  // Fetch all active (non-deleted, non-suspended) projects ordered by updated_at
  // desc so the most recently touched ones are retained first.
  const hideDeleted = await hasDeletedAtColumn();
  let activeProjectsQuery = sb
    .from("projects")
    .select("id, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (hideDeleted) {
    activeProjectsQuery = activeProjectsQuery.is("deleted_at", null);
  }

  const activeProjectsResult = await activeProjectsQuery.order("updated_at", { ascending: false }) as any;
  const activeProjects = activeProjectsResult?.data as Array<{ id: string; status: string }> | null;
  const projErr = activeProjectsResult?.error;

  if (projErr) {
    // Non-fatal — return the user update but log the issue
    console.warn("[DeadFuse] Could not enforce slot limit on plan change:", projErr.message);
    return updatedUser;
  }

  const currentActiveCount = (activeProjects ?? []).length;

  const resolvePendingElection = async () => {
    const { error: resolveErr } = await sb
      .from("plan_downgrade_elections")
      .update({ resolved_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("resolved_at", null);

    if (resolveErr) {
      console.warn("[DeadFuse] Could not resolve pending downgrade election:", resolveErr.message);
    }
  };

  if (currentActiveCount > projectLimit) {
    // Keep the first `projectLimit` (most recently updated), suspend the rest
    const toSuspend = (activeProjects ?? [])
      .slice(projectLimit)
      .map((p) => p.id);

    if (toSuspend.length > 0) {
      const { error: suspendErr } = await sb
        .from("projects")
        .update({ status: "suspended" })
        .in("id", toSuspend);

      if (suspendErr) {
        console.warn("[DeadFuse] Failed to suspend excess projects:", suspendErr.message);
      }
    }

    await resolvePendingElection();

    const electionPayload = {
      user_id: userId,
      new_plan_id: planId,
      new_plan_limit: projectLimit,
      expires_at: updatePayload.plan_expires_at,
    };

    const { error: electionErr } = await sb
      .from("plan_downgrade_elections")
      .insert(electionPayload);

    if (electionErr) {
      console.warn("[DeadFuse] Failed to record pending downgrade election:", electionErr.message);
    }

    return {
      ...updatedUser,
      _suspendedCount: toSuspend.length,
      _message: `${toSuspend.length} project(s) suspended due to plan downgrade. User can re-elect on next login.`,
    };
  }

  // If we're upgrading (more slots), re-activate previously suspended projects up to new limit
  if (currentActiveCount < projectLimit) {
    const slotsAvailable = projectLimit - currentActiveCount;

    let suspendedProjectsQuery = sb
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "suspended")
      .order("updated_at", { ascending: false })
      .limit(slotsAvailable);

    if (hideDeleted) {
      suspendedProjectsQuery = suspendedProjectsQuery.is("deleted_at", null);
    }

    const suspendedProjectsResult = await suspendedProjectsQuery as any;
    const suspendedProjects = suspendedProjectsResult?.data as Array<{ id: string }> | null;
    const suspendedErr = suspendedProjectsResult?.error;

    if (suspendedErr) {
      console.warn("[DeadFuse] Could not reactivate suspended projects on plan upgrade:", suspendedErr.message);
      await resolvePendingElection();
      return updatedUser;
    }

    if (suspendedProjects && suspendedProjects.length > 0) {
      const toReactivate = suspendedProjects.map((p) => p.id);
      await sb
        .from("projects")
        .update({ status: "active", state: "ACTIVE" })
        .in("id", toReactivate);

      await resolvePendingElection();

      return {
        ...updatedUser,
        _reactivatedCount: toReactivate.length,
        _message: `${toReactivate.length} previously suspended project(s) re-activated.`,
      };
    }
  }

  await resolvePendingElection();
  return updatedUser;
});