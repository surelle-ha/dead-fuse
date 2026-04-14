// apps/dashboard/server/api/plan/downgrade-elect.post.ts
//
// Body: { retainIds: string[] }
//   retainIds — project IDs (up to planLimit) the user wants to keep ACTIVE.
//   Any currently-active project NOT in this list gets status = 'suspended'.
//   Any currently-suspended project IN this list gets status = 'active'.
//
// The SDK on suspended projects is not killed, but the project is reset to
// ACTIVE state when reactivated. "Suspended" means:
//   • The project card is greyed/disabled in the dashboard UI
//   • The user cannot change its state or settings until they re-elect it
//   • The remote SDK app is reactivated as ACTIVE rather than preserving its
//     previous SDK state
//
// When the user upgrades again (or is given more slots) suspended projects are
// restored as ACTIVE.

import { requireAuth } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";
import { hasDeletedAtColumn } from "../projects/utils";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const sb = useSupabaseAdmin();
  const body = await readBody(event);
  const retainIds: string[] = Array.isArray(body?.retainIds) ? body.retainIds : [];

  // Get user's effective plan limit
  const { data: user, error: userErr } = await sb
    .from("users")
    .select("project_limit, plan_id, plan_expires_at")
    .eq("id", auth.id)
    .single();

  if (userErr || !user) {
    throw createError({ statusCode: 404, statusMessage: "User not found." });
  }

  const hasActivePlan = (planId?: string | null, expiresAt?: string | null) =>
    Boolean(planId && (!expiresAt || new Date(expiresAt).getTime() > Date.now()));

  let planLimit: number | null = null;
  if (hasActivePlan(user.plan_id, user.plan_expires_at)) {
    const { data: plan } = await sb
      .from("pricing_plans")
      .select("project_limit")
      .eq("id", user.plan_id)
      .single();
    if (plan) planLimit = plan.project_limit;
  }

  if (planLimit == null) {
    const { data: freePlan } = await sb
      .from("pricing_plans")
      .select("project_limit")
      .eq("slug", "free")
      .single();
    planLimit = freePlan?.project_limit ?? 2;
  }

  const effectivePlanLimit = planLimit ?? 2;

  if (retainIds.length > effectivePlanLimit) {
    throw createError({
      statusCode: 400,
      statusMessage: `You can only retain up to ${effectivePlanLimit} project(s) on your current plan.`,
    });
  }

  const hideDeleted = await hasDeletedAtColumn();
  let projectsQuery = sb
    .from("projects")
    .select("id, status")
    .eq("user_id", auth.id);

  if (hideDeleted) {
    projectsQuery = projectsQuery.is("deleted_at", null);
  }

  const { data: allProjects, error: projErr } = await projectsQuery;

  if (projErr || !allProjects) {
    throw createError({ statusCode: 500, statusMessage: "Failed to load projects." });
  }

  const retainSet = new Set(retainIds);
  const projectsList = allProjects as Array<{ id: string; status: string }>;

  // Projects to activate (in retainIds but currently suspended)
  const toActivate = projectsList
    .filter((p) => retainSet.has(p.id) && p.status === "suspended")
    .map((p) => p.id);

  // Projects to suspend (not in retainIds and currently active)
  const toSuspend = projectsList
    .filter((p) => !retainSet.has(p.id) && p.status === "active")
    .map((p) => p.id);

  const updates: any[] = [];

  if (toActivate.length > 0) {
    updates.push(
      sb.from("projects").update({ status: "active", state: "ACTIVE" }).in("id", toActivate)
    );
  }

  if (toSuspend.length > 0) {
    updates.push(
      sb.from("projects").update({ status: "suspended" }).in("id", toSuspend)
    );
  }

  const results = await Promise.all(updates);
  for (const r of results) {
    if (r.error) {
      throw createError({ statusCode: 500, statusMessage: r.error.message });
    }
  }

  const { error: resolveErr } = await sb
    .from("plan_downgrade_elections")
    .update({ resolved_at: new Date().toISOString() })
    .eq("user_id", auth.id)
    .is("resolved_at", null);

  if (resolveErr) {
    throw createError({ statusCode: 500, statusMessage: resolveErr.message });
  }

  return {
    success: true,
    activated: toActivate.length,
    suspended: toSuspend.length,
  };
});