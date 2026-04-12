import { requireAuth } from "~/server/utils/auth";
import { useSupabaseAdmin } from "~/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const auth       = requireAuth(event);
  const projectId  = getRouterParam(event, "id");
  const instanceId = getRouterParam(event, "instanceId");
  const sb         = useSupabaseAdmin();

  // Verify project ownership
  const { data: project, error: projErr } = await sb
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", auth.id)
    .single();

  if (projErr || !project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found." });
  }

  // ── PATCH — update instance (deployed toggle, label, env) ────
  if (event.method === "PATCH") {
    const body = await readBody(event);
    const patch: Record<string, unknown> = {};

    if (body.label     !== undefined) patch.label    = String(body.label).trim();
    if (body.env       !== undefined) patch.env      = body.env;
    if (body.deployed  !== undefined) patch.deployed = Boolean(body.deployed);
    if (body.alert     !== undefined) patch.alert    = Boolean(body.alert);
    if (body.uptimePing !== undefined) patch.uptime_ping = Boolean(body.uptimePing);
    if (body.sdkPing   !== undefined) patch.sdk_ping = Boolean(body.sdkPing);

    if (!Object.keys(patch).length) {
      throw createError({ statusCode: 400, statusMessage: "Nothing to update." });
    }

    const { data, error } = await sb
      .from("project_instances")
      .update(patch)
      .eq("id", instanceId)
      .eq("project_id", projectId)
      .select("id, env, label, token, deployed, uptime_ping, sdk_ping, alert, updated_at")
      .single();

    if (error || !data) {
      throw createError({ statusCode: 500, statusMessage: error?.message ?? "Update failed." });
    }
    return data;
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});