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

  if (user.plan_id) {
    const { data: plan } = await sb
      .from("pricing_plans")
      .select("name, project_limit")
      .eq("id", user.plan_id)
      .single();

    if (plan) {
      planName = plan.name ?? null;
      planLimit = plan.project_limit;
    }
  }

  let effectiveLimit = user.project_limit ?? planLimit ?? 2;
  if (planLimit != null) {
    effectiveLimit = Math.max(effectiveLimit, planLimit);
  }

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
