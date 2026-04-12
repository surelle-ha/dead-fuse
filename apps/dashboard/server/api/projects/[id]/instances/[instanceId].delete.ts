import { requireAuth } from "~/server/utils/auth";
import { useSupabaseAdmin } from "~/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const projectId = getRouterParam(event, "id");
  const instanceId = getRouterParam(event, "instanceId");
  const sb = useSupabaseAdmin();

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

  if (event.method === "DELETE") {
    const { error } = await sb
      .from("project_instances")
      .delete()
      .eq("id", instanceId)
      .eq("project_id", projectId);

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
    return { success: true };
  }

  throw createError({ statusCode: 405, statusMessage: "Method Not Allowed" });
});