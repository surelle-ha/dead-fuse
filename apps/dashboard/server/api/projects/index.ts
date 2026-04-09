import { requireAuth } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";
import { randomBytes } from "crypto";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const sb = useSupabaseAdmin();

  if (event.method === "GET") {
    const { data: projects, error } = await sb
      .from("projects")
      .select("id, name, project_key, public_token, state, message, grace_period, created_at, updated_at")
      .eq("user_id", auth.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }

    return projects || [];
  }

  if (event.method === "POST") {
    const body = await readBody(event);
    const { name, gracePeriod = 3 } = body ?? {};

    if (!name?.trim()) {
      throw createError({ statusCode: 400, statusMessage: "Project name is required" });
    }

    const projectKey = randomBytes(8).toString("hex");
    const publicToken = randomBytes(24).toString("hex");

    const { data: newProject, error } = await sb
      .from("projects")
      .insert({
        user_id: auth.id,
        name: name.trim(),
        project_key: projectKey,
        public_token: publicToken,
        grace_period: Number(gracePeriod),
      })
      .select("id, name, project_key, public_token, state, message, grace_period, created_at, updated_at")
      .single();

    if (error || !newProject) {
      throw createError({
        statusCode: 500,
        statusMessage: error?.message ?? "Failed to create project",
      });
    }

    return newProject;
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});
