import { requireAuth } from "~/server/utils/auth";
import { useSupabaseAdmin } from "~/server/utils/supabase";
import { hasDeletedAtColumn } from "../utils";

const VALID_STATES = [
  "ACTIVE", "WARNING", "READONLY", "LIMITED",
  "LOCKED", "EXPIRED", "SLEEP", "SELF_DESTRUCT",
];

export default defineEventHandler(async (event: any) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { state, message, gracePeriod } = body ?? {};
  const sb = useSupabaseAdmin();

  if (state && !VALID_STATES.includes(state)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid state. Must be one of: ${VALID_STATES.join(", ")}`,
    });
  }

  // Verify ownership first
  const hideDeleted = await hasDeletedAtColumn();

  let ownershipQuery = sb
    .from("projects")
    .select("id, project_key")
    .eq("id", id)
    .eq("user_id", user.id);

  if (hideDeleted) {
    ownershipQuery = ownershipQuery.is("deleted_at", null);
  }

  const { data: existing, error: fetchErr } = await ownershipQuery.single();

  if (fetchErr || !existing) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  // Build partial update
  const patch: Record<string, unknown> = {};
  if (state !== undefined) patch.state = state;
  if (message !== undefined) patch.message = message;
  if (gracePeriod !== undefined) patch.grace_period = Number(gracePeriod);

  if (Object.keys(patch).length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Nothing to update" });
  }

  const { data: updated, error: updateErr } = await sb
    .from("projects")
    .update(patch)
    .eq("id", id)
    .select("id, name, project_key, public_token, state, message, grace_period, updated_at")
    .single();

  if (updateErr || !updated) {
    throw createError({ statusCode: 500, statusMessage: updateErr?.message ?? "Update failed" });
  }

  // ── Broadcast via Supabase Realtime ──────────────────────────────────────
  // The client SDK subscribes to the channel named after project_key.
  // We use the admin client's realtime broadcast (server-side send).
  try {
    const channel = sb.channel(`project:${updated.project_key}`);
    await channel.send({
      type: "broadcast",
      event: "state",
      payload: {
        state: updated.state,
        message: updated.message ?? "",
      },
    });
    // Unsubscribe immediately — we only needed a one-shot send
    await sb.removeChannel(channel);
  } catch (err) {
    // Non-fatal: the DB was already updated; clients will pick it up on reconnect
    console.warn("[DeadFuse] Realtime broadcast failed:", err);
  }

  return updated;
});