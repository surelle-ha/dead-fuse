import { requireAuth } from "~/server/utils/auth";
import { useSupabaseAdmin } from "~/server/utils/supabase";
import { hasDeletedAtColumn } from "../utils";
import { projectSockets } from "./state.post";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");
  const sb = useSupabaseAdmin();

  // Verify ownership
  const hideDeleted = await hasDeletedAtColumn();

  let query = sb
    .from("projects")
    .select("project_key")
    .eq("id", id)
    .eq("user_id", auth.id);

  if (hideDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data: project, error } = await query.single();

  if (error || !project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  const sockets = projectSockets.get(project.project_key);
  const connected = sockets ? sockets.size : 0;

  return { connected };
});