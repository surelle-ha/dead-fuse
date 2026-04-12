import { requireAuth } from "~/server/utils/auth";
import { useSupabaseAdmin } from "~/server/utils/supabase";
import { randomBytes } from "crypto";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const projectId = getRouterParam(event, "id");
  const sb = useSupabaseAdmin();

  // Verify project ownership first
  const { data: project, error: projErr } = await sb
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", auth.id)
    .single();

  if (projErr || !project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found." });
  }

  // ── GET — list instances ──────────────────────────────────────
  if (event.method === "GET") {
    const { data, error } = await sb
      .from("project_instances")
      .select("id, env, label, token, deployed, uptime_ping, sdk_ping, alert, created_at, updated_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
    return data ?? [];
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});