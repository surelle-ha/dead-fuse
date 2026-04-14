import { requireAuth } from "~/server/utils/auth";
import { useSupabaseAdmin } from "~/server/utils/supabase";
import { hasDeletedAtColumn } from "./utils";

const hasActivePlan = (planId?: string | null, expiresAt?: string | null) =>
  Boolean(planId && (!expiresAt || new Date(expiresAt).getTime() > Date.now()));

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");
  const sb = useSupabaseAdmin();
  const hideDeleted = await hasDeletedAtColumn();

  let result;

  if (hideDeleted) {
    result = await sb
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", auth.id)
      .is("deleted_at", null);
  } else {
    result = await sb
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.id);
  }

  const { error } = result;

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  const { data: user, error: userErr } = await sb
    .from("users")
    .select("plan_id, plan_expires_at")
    .eq("id", auth.id)
    .single();

  if (!user || userErr) {
    return { success: true };
  }

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

  let activeCountQuery = sb
    .from("projects")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", auth.id)
    .eq("status", "active");

  if (hideDeleted) {
    activeCountQuery = activeCountQuery.is("deleted_at", null);
  }

  const { count: activeCount, error: activeErr } = await activeCountQuery;
  if (activeErr) {
    return { success: true };
  }

  const availableSlots = effectivePlanLimit - (activeCount ?? 0);

  if (availableSlots > 0) {
    let suspendedProjectsQuery = sb
      .from("projects")
      .select("id")
      .eq("user_id", auth.id)
      .eq("status", "suspended")
      .order("updated_at", { ascending: false })
      .limit(availableSlots);

    if (hideDeleted) {
      suspendedProjectsQuery = suspendedProjectsQuery.is("deleted_at", null);
    }

    const suspendedProjectsResult = await suspendedProjectsQuery as any;
    const suspendedProjects = suspendedProjectsResult?.data as Array<{ id: string }> | null;
    const suspendedIds = suspendedProjects?.map((project) => project.id) ?? [];

    if (suspendedIds.length > 0) {
      const { error: reactivateErr } = await sb
        .from("projects")
        .update({ status: "active", state: "ACTIVE" })
        .in("id", suspendedIds);

      if (reactivateErr) {
        console.warn("[DeadFuse] Could not reactivate suspended projects after deletion:", reactivateErr.message);
      }
    }
  }

  let totalProjectsQuery = sb
    .from("projects")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", auth.id);

  if (hideDeleted) {
    totalProjectsQuery = totalProjectsQuery.is("deleted_at", null);
  }

  const { count: totalProjects, error: totalErr } = await totalProjectsQuery;
  if (!totalErr && (totalProjects ?? 0) <= effectivePlanLimit) {
    const { error: resolveErr } = await sb
      .from("plan_downgrade_elections")
      .update({ resolved_at: new Date().toISOString() })
      .eq("user_id", auth.id)
      .is("resolved_at", null);

    if (resolveErr) {
      console.warn("[DeadFuse] Could not resolve downgrade election after deletion:", resolveErr.message);
    }
  }

  return { success: true };
});