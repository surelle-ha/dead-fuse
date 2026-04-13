import { requireAdmin } from "../../../utils/auth";
import { useSupabaseAdmin } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const sb = useSupabaseAdmin();
  const { planId } = event.context.params as { planId: string };

  if (!planId) {
    throw createError({ statusCode: 400, statusMessage: "Missing pricing plan id." });
  }

  const { error } = await sb
    .from("pricing_plans")
    .delete()
    .eq("id", planId);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message ?? "Failed to delete pricing plan." });
  }

  return { success: true };
});
