import { requireAuth } from "~/server/utils/auth";
import { useSupabaseAdmin } from "~/server/utils/supabase";
import { projectSockets } from "./state.post";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");
  const sb = useSupabaseAdmin();

  // Verify ownership
  const { data: project, error } = await sb
    .from("projects")
    .select("project_key")
    .eq("id", id)
    .eq("user_id", auth.id)
    .single();

  if (error || !project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  const sockets = projectSockets.get(project.project_key);
  const connected = sockets ? sockets.size : 0;

  return { connected };
});