import { Pool } from "pg";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { hashPassword, signToken } from "../../utils/auth";

const ENV_PATH = resolve(process.cwd(), ".env");

function parseEnv(): Record<string, string> {
  if (!existsSync(ENV_PATH)) return {};
  const lines = readFileSync(ENV_PATH, "utf-8").split("\n");
  const env: Record<string, string> = {};
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key?.trim()) env[key.trim()] = rest.join("=").trim();
  }
  return env;
}

function writeEnv(values: Record<string, string>): void {
  const existing = parseEnv();
  const merged = { ...existing, ...values };
  const content = Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  writeFileSync(ENV_PATH, content + "\n", "utf-8");
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { databaseUrl, jwtSecret, email, password, appUrl } = body ?? {};

  if (!databaseUrl || !jwtSecret || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: "All fields are required" });
  }

  // Test DB connection
  let pool: Pool | null = null;
  try {
    pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
    const client = await pool.connect();
    client.release();
  } catch (err: any) {
    throw createError({ statusCode: 400, statusMessage: `Database connection failed: ${err.message}` });
  }

  // Run migrations
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        project_key TEXT UNIQUE NOT NULL,
        public_token TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'ACTIVE',
        message TEXT DEFAULT '',
        grace_period INTEGER DEFAULT 3,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language 'plpgsql';
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `Migration failed: ${err.message}` });
  }

  // Create admin user
  const passwordHash = await hashPassword(password);
  try {
    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash",
      [email.toLowerCase().trim(), passwordHash]
    );
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `User creation failed: ${err.message}` });
  }

  await pool.end();

  // Save .env
  writeEnv({
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    APP_URL: appUrl || "http://localhost:3000",
    WS_PATH: "/fuse",
    PORT: "3000",
  });

  // Auto-login
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET = jwtSecret;

  const userRow = await (async () => {
    const p = new Pool({ connectionString: databaseUrl });
    const r = await p.query("SELECT id, email FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    await p.end();
    return r.rows[0];
  })();

  const token = signToken({ userId: userRow.id, email: userRow.email });

  setCookie(event, "df_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { ok: true, message: "Setup complete. Restart the server to apply environment changes." };
});
