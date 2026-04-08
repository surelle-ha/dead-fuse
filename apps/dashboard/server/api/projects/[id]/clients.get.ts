import { queryOne } from "~/server/utils/db";
import { requireAuth } from "~/server/utils/auth";
import { projectSockets } from "../[id]/state.post";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");

  // Verify ownership
  const project = await queryOne(
    "SELECT project_key FROM projects WHERE id = $1 AND user_id = $2",
    [id, auth.userId]
  );

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  const sockets = projectSockets.get(project.project_key);
  const connected = sockets ? sockets.size : 0;

  return { connected };
});