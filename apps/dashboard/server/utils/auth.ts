import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return jwt.verify(token, secret) as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(event: any): JWTPayload {
  const token = getCookie(event, "df_token") || getHeader(event, "authorization")?.replace("Bearer ", "");
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  try {
    return verifyToken(token);
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" });
  }
}

function getCookie(event: any, name: string): string | undefined {
  const cookieHeader = event.node?.req?.headers?.cookie || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function getHeader(event: any, name: string): string | undefined {
  return event.node?.req?.headers?.[name];
}
