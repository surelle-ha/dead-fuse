import { useSupabaseAdmin } from "~/server/utils/supabase";
import { hasDeletedAtColumn } from "~/server/api/projects/utils";
import { registerClient, countClients } from "~/server/utils/projectClientStore";

export default defineEventHandler(async (event) => {
  const projectKey = getRouterParam(event, "projectKey");
  const body = await readBody(event) as { token?: string; clientId?: string; host?: string };
  const token = body?.token;
  const clientId = body?.clientId;
  const host = body?.host;

  if (!projectKey || !token || !clientId) {
    throw createError({ statusCode: 400, statusMessage: "projectKey, token, and clientId are required." });
  }

  const sb = useSupabaseAdmin();
  const hideDeleted = await hasDeletedAtColumn();

  const { data: project, error: projectErr } = await sb
    .from("projects")
    .select("id")
    .eq("project_key", projectKey)
    .maybeSingle();

  if (projectErr || !project) {
    throw createError({ statusCode: 403, statusMessage: "Invalid project key or token." });
  }

  if (hideDeleted) {
    const deletedCheck = await sb
      .from("projects")
      .select("id")
      .eq("id", project.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!deletedCheck?.id) {
      throw createError({ statusCode: 403, statusMessage: "Invalid project key or token." });
    }
  }

  const { data: instance, error: instanceErr } = await sb
    .from("project_instances")
    .select("id")
    .eq("project_id", project.id)
    .eq("token", token)
    .single();

  if (instanceErr || !instance) {
    throw createError({ statusCode: 403, statusMessage: "Invalid project key or token." });
  }

  registerClient(projectKey, clientId, host);
  return { connected: countClients(projectKey) };
});