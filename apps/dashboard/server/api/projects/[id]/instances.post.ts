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

  if (event.method === "POST") {
    const body = await readBody(event);
    const { env, label } = body ?? {};

    const validEnvs = ["dev", "qa", "staging", "prod", "custom"];
    if (!label?.trim()) {
      throw createError({ statusCode: 400, statusMessage: "Label is required." });
    }
    if (!validEnvs.includes(env)) {
      throw createError({ statusCode: 400, statusMessage: `env must be one of: ${validEnvs.join(", ")}` });
    }

    const token = randomBytes(24).toString("hex");

    const { data: instance, error: insertErr } = await sb
      .from("project_instances")
      .insert({
        project_id: projectId,
        env,
        label:      label.trim(),
        token,
        deployed:   false,
      })
      .select("id, env, label, token, deployed, uptime_ping, sdk_ping, alert, created_at, updated_at")
      .single();

    if (insertErr || !instance) {
      throw createError({ statusCode: 500, statusMessage: insertErr?.message ?? "Failed to create instance." });
    }
    return instance;
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});