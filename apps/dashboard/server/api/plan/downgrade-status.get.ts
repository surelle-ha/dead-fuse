// apps/dashboard/server/api/plan/downgrade-status.get.ts
//
// Returns whether the current user has an unresolved downgrade election
// (i.e. they hold more active projects than their current plan allows).
// Called on every /api/auth/me fetch so the dashboard can gate access.

import { requireAuth } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";
import { hasDeletedAtColumn } from "../projects/utils";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const sb = useSupabaseAdmin();

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
  const hideDeleted = await hasDeletedAtColumn();

  const { data: pendingElection, error: electionErr } = await sb
    .from("plan_downgrade_elections")
    .select("id")
    .eq("user_id", auth.id)
    .is("resolved_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (electionErr) {
    throw createError({ statusCode: 500, statusMessage: electionErr.message });
  }

  // Count all non-deleted projects (not just active) to detect over-limit
  let countQuery = sb
    .from("projects")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", auth.id);

  if (hideDeleted) {
    countQuery = countQuery.is("deleted_at", null);
  }

  const { count: totalProjects, error: countErr } = await countQuery;
  if (countErr) {
    throw createError({ statusCode: 500, statusMessage: countErr.message });
  }

  const totalProjectsCount = totalProjects ?? 0;
  const electionId = pendingElection?.id ?? null;
  const overLimit = Boolean(electionId);

  return {
    overLimit,
    electionId,
    activeCount: totalProjectsCount,
    planLimit: effectivePlanLimit,
    excess: overLimit ? totalProjectsCount - effectivePlanLimit : 0,
  };
});