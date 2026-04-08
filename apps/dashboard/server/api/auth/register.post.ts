import { queryOne, query } from "../../utils/db";
import { hashPassword, signToken } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body ?? {};

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: "Email and password required" });
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: "Password must be at least 8 characters" });
  }

  const existing = await queryOne("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "Email already registered" });
  }

  const passwordHash = await hashPassword(password);
  const rows = await query<{ id: string; email: string }>(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
    [email.toLowerCase().trim(), passwordHash]
  );
  const user = rows[0];

  const token = signToken({ userId: user.id, email: user.email });

  setCookie(event, "df_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { ok: true, email: user.email };
});
