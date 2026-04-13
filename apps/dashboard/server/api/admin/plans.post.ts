import { requireAdmin } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const sb = useSupabaseAdmin();
  const body = await readBody(event);
  const name = String(body?.name || "").trim();
  const slug = String(body?.slug || "").trim().toLowerCase();
  const description = body?.description ? String(body.description).trim() : null;
  const project_limit = Number(body?.project_limit ?? 0);
  const default_expiry_days = body?.default_expiry_days != null ? Number(body.default_expiry_days) : null;

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Plan name is required." });
  }
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Plan slug is required." });
  }
  if (!Number.isInteger(project_limit) || project_limit <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Project limit must be a positive whole number." });
  }

  const { data, error } = await sb
    .from("pricing_plans")
    .insert({ name, slug, description, project_limit, default_expiry_days })
    .select("id, slug, name, description, project_limit, default_expiry_days")
    .single();

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: error?.message ?? "Failed to create pricing plan." });
  }

  return data;
});
