import { useSupabaseAdmin } from "~/server/utils/supabase";
import { hasDeletedAtColumn } from "../utils";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const token = getQuery(event).token as string | undefined;

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: "Token is required." });
  }

  const sb = useSupabaseAdmin();
  const hideDeleted = await hasDeletedAtColumn();

  let query = sb
    .from("projects")
    .select("state, message")
    .eq("project_key", id)
    .eq("public_token", token);

  if (hideDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data: project, error } = await query.single();

  if (error || !project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found." });
  }

  return { state: project.state, message: project.message };
});