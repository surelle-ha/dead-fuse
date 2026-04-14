import { requireAuth } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const payload = requireAuth(event);
  const sb = useSupabaseAdmin();

  const { data: user, error } = await sb
    .from("users")
    .select("id, email, role, plan_id, plan_expires_at, project_limit")
    .eq("id", payload.id)
    .single();

  if (error || !user) {
    throw createError({ statusCode: 404, statusMessage: "User not found." });
  }

  let planName: string | null = null;
  let planLimit: number | null = null;
  let resolvedPlanId: string | null = null;

  const hasActivePlan = (planId?: string | null, expiresAt?: string | null) =>
    Boolean(planId && (!expiresAt || new Date(expiresAt).getTime() > Date.now()));

  if (hasActivePlan(user.plan_id, user.plan_expires_at)) {
    const { data: plan } = await sb
      .from("pricing_plans")
      .select("id, name, project_limit")
      .eq("id", user.plan_id)
      .single();

    if (plan) {
      resolvedPlanId = plan.id;
      planName = plan.name ?? null;
      planLimit = plan.project_limit;
    }
  }

  if (!resolvedPlanId) {
    const { data: freePlan } = await sb
      .from("pricing_plans")
      .select("id, name, project_limit")
      .eq("slug", "free")
      .single();

    if (freePlan) {
      planName = freePlan.name ?? planName;
      planLimit = planLimit ?? freePlan.project_limit;
    }
  }

  let effectiveLimit = planLimit ?? 2;

  return {
    userId: user.id,
    email: user.email,
    role: user.role ?? 'user',
    planId: user.plan_id,
    planExpiresAt: user.plan_expires_at,
    planName,
    projectLimit: effectiveLimit,
  };
});
