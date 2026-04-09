import { requireAuth } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");
  const sb = useSupabaseAdmin();

  const { data: project, error } = await sb
    .from("projects")
    .select("id, name, project_key, public_token, state, message, grace_period, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", auth.id)
    .single();

  if (error || !project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" });
  }

  return project;
});
