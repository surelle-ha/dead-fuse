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

  let query = sb
    .from("projects")
    .select("project_key")
    .eq("project_key", projectKey)
    .eq("public_token", token);

  if (hideDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data: project, error } = await query.single();
  if (error || !project) {
    throw createError({ statusCode: 403, statusMessage: "Invalid project key or token." });
  }

  registerClient(projectKey, clientId, host);
  return { connected: countClients(projectKey) };
});