import { hashPassword, signToken, type JWTPayload } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
  }

  const body = await readBody(event);
  const { email, password } = body ?? {};

  if (!email?.trim() || !password?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid email format",
    });
  }

  const sb = useSupabaseAdmin();

  // Check if user exists
  const { data: existingUser, error: fetchErr } = await sb
    .from("users")
    .select("id, email, password_hash")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (fetchErr && fetchErr.code !== "PGRST116") {
    // PGRST116 = no rows returned (user doesn't exist)
    throw createError({
      statusCode: 500,
      statusMessage: "Database error",
    });
  }

  if (!existingUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  if (!existingUser.password_hash) {
    throw createError({
      statusCode: 401,
      statusMessage: "This account uses GitHub login. Please sign in with GitHub.",
    });
  }

  // Verify password
  const { comparePassword } = await import("../../utils/auth");
  const isPasswordValid = await comparePassword(password, existingUser.password_hash);

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  // Create JWT token
  const payload: JWTPayload = {
    id: existingUser.id,
    email: existingUser.email,
  };

  const token = signToken(payload);

  // Set secure HTTP-only cookie
  setCookie(event, "df_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return {
    success: true,
    message: "Login successful",
  };
});
