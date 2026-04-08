import { queryOne, query } from "~/server/utils/db";
import { requireAuth } from "~/server/utils/auth";

const VALID_STATES = ["ACTIVE", "WARNING", "READONLY", "LIMITED", "LOCKED", "EXPIRED", "SLEEP", "SELF_DESTRUCT"];

// In-memory WebSocket registry: projectId -> Set<WebSocket peers>
// This is imported by the ws handler too
export const projectSockets = new Map<string, Set<any>>();

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  const { state, message, gracePeriod } = body ?? {};

  if (state && !VALID_STATES.includes(state)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid state. Must be one of: ${VALID_STATES.join(", ")}` });
  }

  // Verify ownership
  const existing = await queryOne(
    "SELECT id, project_key FROM projects WHERE id = $1 AND user_id = $2",
    [id, auth.userId]
  );

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  // Build update dynamically
  const updates: string[] = [];
  const values: any[] = [];
  let paramIdx = 1;

  if (state !== undefined) {
    updates.push(`state = $${paramIdx++}`);
    values.push(state);
  }
  if (message !== undefined) {
    updates.push(`message = $${paramIdx++}`);
    values.push(message);
  }
  if (gracePeriod !== undefined) {
    updates.push(`grace_period = $${paramIdx++}`);
    values.push(Number(gracePeriod));
  }

  if (updates.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Nothing to update" });
  }

  values.push(id);
  const rows = await query(
    `UPDATE projects SET ${updates.join(", ")} WHERE id = $${paramIdx} RETURNING id, name, project_key, public_token, state, message, grace_period, updated_at`,
    values
  );

  const updated = rows[0];

  // Broadcast to connected WebSocket clients for this project
  const sockets = projectSockets.get(updated.project_key);
  if (sockets && sockets.size > 0) {
    const payload = JSON.stringify({
      state: updated.state,
      message: updated.message ?? "",
    });
    for (const peer of sockets) {
      try {
        peer.send(payload);
      } catch {
        // peer disconnected
      }
    }
  }

  return updated;
});
