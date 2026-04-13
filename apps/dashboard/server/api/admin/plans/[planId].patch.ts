import { requireAdmin } from "../../../utils/auth";
import { useSupabaseAdmin } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const sb = useSupabaseAdmin();
  const { planId } = event.context.params as { planId: string };
  const body = await readBody(event);
  const name = body?.name ? String(body.name).trim() : undefined;
  const slug = body?.slug ? String(body.slug).trim().toLowerCase() : undefined;
  const description = body?.description != null ? String(body.description).trim() : undefined;
  const project_limit = body?.project_limit != null ? Number(body.project_limit) : undefined;
  const default_expiry_days = body?.default_expiry_days != null ? Number(body.default_expiry_days) : undefined;

  if (!planId) {
    throw createError({ statusCode: 400, statusMessage: "Missing pricing plan id." });
  }

  const { data: existingPlan, error: existingPlanError } = await sb
    .from("pricing_plans")
    .select("project_limit")
    .eq("id", planId)
    .single();

  if (existingPlanError || !existingPlan) {
    throw createError({ statusCode: 404, statusMessage: "Pricing plan not found." });
  }

  const oldPlanLimit = existingPlan.project_limit;

  const updatePayload: Record<string, any> = {};
  if (name !== undefined) updatePayload.name = name;
  if (slug !== undefined) updatePayload.slug = slug;
  if (description !== undefined) updatePayload.description = description;
  if (project_limit !== undefined) {
    if (!Number.isInteger(project_limit) || project_limit <= 0) {
      throw createError({ statusCode: 400, statusMessage: "Project limit must be a positive whole number." });
    }
    updatePayload.project_limit = project_limit;
  }
  if (default_expiry_days !== undefined) {
    updatePayload.default_expiry_days = Number.isNaN(default_expiry_days) ? null : default_expiry_days;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw createError({ statusCode: 400, statusMessage: "No updates were provided." });
  }

  const { data, error } = await sb
    .from("pricing_plans")
    .update(updatePayload)
    .eq("id", planId)
    .select("id, slug, name, description, project_limit, default_expiry_days")
    .single();

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: error?.message ?? "Failed to update pricing plan." });
  }

  if (project_limit !== undefined && typeof oldPlanLimit === "number" && project_limit !== oldPlanLimit) {
    const { error: syncError } = await sb
      .from("users")
      .update({ project_limit })
      .eq("plan_id", planId);

    if (syncError) {
      throw createError({ statusCode: 500, statusMessage: syncError?.message ?? "Failed to sync user limits after pricing plan update." });
    }
  }

  return data;
});
