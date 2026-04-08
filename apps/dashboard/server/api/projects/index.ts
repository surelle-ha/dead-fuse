import { query } from "../../utils/db";
import { requireAuth } from "../../utils/auth";
import { randomBytes } from "crypto";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);

  if (event.method === "GET") {
    const projects = await query(
      "SELECT id, name, project_key, public_token, state, message, grace_period, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC",
      [auth.userId]
    );
    return projects;
  }

  if (event.method === "POST") {
    const body = await readBody(event);
    const { name, gracePeriod = 3 } = body ?? {};

    if (!name?.trim()) {
      throw createError({ statusCode: 400, statusMessage: "Project name is required" });
    }

    const projectKey = randomBytes(8).toString("hex");
    const publicToken = randomBytes(24).toString("hex");

    const rows = await query(
      `INSERT INTO projects (user_id, name, project_key, public_token, grace_period)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, project_key, public_token, state, message, grace_period, created_at, updated_at`,
      [auth.userId, name.trim(), projectKey, publicToken, gracePeriod]
    );

    return rows[0];
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});
