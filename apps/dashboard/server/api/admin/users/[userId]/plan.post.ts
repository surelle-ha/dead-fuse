import { requireAdmin } from "../../../../utils/auth";
import { useSupabaseAdmin } from "../../../../utils/supabase";

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
    plan_expires_at: expiresAt instanceof Date && !Number.isNaN(expiresAt.getTime()) ? expiresAt.toISOString() : null,
    project_limit: projectLimit,
  };

  const { data: updatedUser, error: updateError } = await sb
    .from("users")
    .update(updatePayload)
    .eq("id", userId)
    .select("id, email, role, project_limit, plan_id, plan_expires_at")
    .single();

  if (updateError || !updatedUser) {
    throw createError({ statusCode: 500, statusMessage: updateError?.message ?? "Failed to update user plan." });
  }

  return updatedUser;
});
