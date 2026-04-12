import { requireAuth, comparePassword, hashPassword } from "../utils/auth";
import { useSupabaseAdmin } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const body = await readBody(event);
  const { currentPassword, newPassword } = body ?? {};

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: "Both current and new password are required." });
  }
  if (newPassword.length < 8) {
    throw createError({ statusCode: 400, statusMessage: "New password must be at least 8 characters." });
  }

  const sb = useSupabaseAdmin();

  // Fetch current hash
  const { data: user, error: fetchErr } = await sb
    .from("users")
    .select("password_hash")
    .eq("id", auth.id)
    .single();

  if (fetchErr || !user) {
    throw createError({ statusCode: 404, statusMessage: "User not found." });
  }
  if (!user.password_hash) {
    throw createError({ statusCode: 400, statusMessage: "This account uses GitHub login — password change is not available." });
  }

  const valid = await comparePassword(currentPassword, user.password_hash);
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: "Current password is incorrect." });
  }

  const newHash = await hashPassword(newPassword);
  const { error: updateErr } = await sb
    .from("users")
    .update({ password_hash: newHash })
    .eq("id", auth.id);

  if (updateErr) {
    throw createError({ statusCode: 500, statusMessage: updateErr.message });
  }

  return { success: true };
});