import { requireAdmin } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const sb = useSupabaseAdmin();

  const { data, error } = await sb
    .from("pricing_plans")
    .select("id, slug, name, description, project_limit, default_expiry_days")
    .order("created_at", { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message ?? "Failed to load pricing plans." });
  }

  return data || [];
});
