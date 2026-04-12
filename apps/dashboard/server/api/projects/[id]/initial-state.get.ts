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

  const { data: project, error: projectErr } = await sb
    .from("projects")
    .select("id, state, message")
    .eq("project_key", id)
    .maybeSingle();

  if (projectErr || !project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found." });
  }

  if (hideDeleted) {
    const deletedCheck = await sb
      .from("projects")
      .select("id")
      .eq("id", project.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!deletedCheck?.id) {
      throw createError({ statusCode: 404, statusMessage: "Project not found." });
    }
  }

  const { data: instance, error: instanceErr } = await sb
    .from("project_instances")
    .select("id")
    .eq("project_id", project.id)
    .eq("token", token)
    .single();

  if (instanceErr || !instance) {
    throw createError({ statusCode: 404, statusMessage: "Project not found." });
  }

  return { state: project.state, message: project.message };
});