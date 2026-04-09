import { requireAuth } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";
import { hasDeletedAtColumn } from "./utils";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");
  const sb = useSupabaseAdmin();

  const hideDeleted = await hasDeletedAtColumn();

  let query = sb
    .from("projects")
    .select("id, name, project_key, public_token, state, message, grace_period, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", auth.id);

  if (hideDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data: project, error } = await query.single();

  if (error || !project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  return project;
});
