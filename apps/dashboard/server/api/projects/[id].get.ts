import { queryOne } from "../../utils/db";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");

  const project = await queryOne(
    "SELECT id, name, project_key, public_token, state, message, grace_period, created_at, updated_at FROM projects WHERE id = $1 AND user_id = $2",
    [id, auth.userId]
  );

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  return project;
});
