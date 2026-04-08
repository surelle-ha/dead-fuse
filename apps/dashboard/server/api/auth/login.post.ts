import { queryOne } from "../../utils/db";
import { comparePassword, signToken } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body ?? {};

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: "Email and password required" });
  }

  const user = await queryOne<{ id: string; email: string; password_hash: string }>(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email.toLowerCase().trim()]
  );

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }

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
