import { requireAuth } from "../utils/auth";
import { useSupabaseAdmin } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const body = await readBody(event);
  const { email } = body ?? {};

  if (!email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Email is required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid email format." });
  }

  const sb = useSupabaseAdmin();

  // Check if email is taken by another user
  const { data: existing } = await sb
    .from("users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .neq("id", auth.id)
    .single();

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "Email is already in use." });
  }

  const { error } = await sb
    .from("users")
    .update({ email: email.trim().toLowerCase() })
    .eq("id", auth.id);

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true, email: email.trim().toLowerCase() };
});