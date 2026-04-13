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

  // Validate password length
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 8 characters",
    });
  }

  const sb = useSupabaseAdmin();

  // Check if user already exists
  const { data: existingUser, error: fetchErr } = await sb
    .from("users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (fetchErr && fetchErr.code !== "PGRST116") {
    // PGRST116 = no rows returned (expected)
    throw createError({
      statusCode: 500,
      statusMessage: "Database error",
    });
  }

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "User already exists",
    });
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user role
  const { count, error: adminCountError } = await sb
    .from("users")
    .select("id", { head: true, count: "exact" })
    .eq("role", "admin");

  const existingAdmins = Number(count) || 0;
  const role = existingAdmins === 0 ? "admin" : "user";

  const { data: freePlan } = await sb
    .from("pricing_plans")
    .select("id, project_limit")
    .eq("slug", "free")
    .single();

  // Create user
  const { data: newUser, error: insertErr } = await sb
    .from("users")
    .insert({
      email: email.trim().toLowerCase(),
      password_hash: passwordHash,
      role,
      plan_id: freePlan?.id ?? null,
      project_limit: freePlan?.project_limit ?? 2,
    })
    .select("id, email")
    .single();

  if (insertErr || !newUser) {
    throw createError({
      statusCode: 500,
      statusMessage: insertErr?.message ?? "Failed to create user",
    });
  }

  // Create JWT token
  const payload: JWTPayload = {
    id: newUser.id,
    email: newUser.email,
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
    message: "Account created successfully",
  };
});
