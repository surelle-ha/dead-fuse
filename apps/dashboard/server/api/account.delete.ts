import { requireAuth } from "../utils/auth";
import { useSupabaseAdmin } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const sb   = useSupabaseAdmin();

  // Delete all projects owned by this user (cascade deletes via FK)
  const { error: projErr } = await sb
    .from("projects")
    .delete()
    .eq("user_id", auth.id);

  if (projErr) {
    throw createError({ statusCode: 500, statusMessage: projErr.message });
  }

  // Delete the user record
  const { error: userErr } = await sb
    .from("users")
    .delete()
    .eq("id", auth.id);

  if (userErr) {
    throw createError({ statusCode: 500, statusMessage: userErr.message });
  }

  // Clear session cookie
  deleteCookie(event, "df_token");

  return { success: true };
});