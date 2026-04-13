import { requireAuth } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";
import { hasDeletedAtColumn } from "./utils";
import { randomBytes } from "crypto";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const sb = useSupabaseAdmin();

  if (event.method === "GET") {
    const hideDeleted = await hasDeletedAtColumn();

    let query = sb
      .from("projects")
      .select("id, name, project_key, public_token, state, message, grace_period, client_name, target_completion, description, budget, priority, created_at, updated_at")
      .eq("user_id", auth.id);

    if (hideDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data: projects, error } = await query.order("created_at", { ascending: false });

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
    const { name, gracePeriod = 3, clientName, targetCompletion, description, budget, priority } = body ?? {};

    if (!name?.trim()) {
      throw createError({ statusCode: 400, statusMessage: "Project name is required" });
    }

    const hideDeleted = await hasDeletedAtColumn();
    let countQuery = sb
      .from("projects")
      .select("id")
      .eq("user_id", auth.id);

    if (hideDeleted) {
      countQuery = countQuery.is("deleted_at", null);
    }

    const { data: existingProjects, error: countError } = await countQuery;

    if (countError) {
      throw createError({ statusCode: 500, statusMessage: countError.message });
    }

    const { data: user, error: userError } = await sb
      .from("users")
      .select("plan_id, project_limit")
      .eq("id", auth.id)
      .single();

    if (userError || !user) {
      throw createError({ statusCode: 404, statusMessage: "User not found." });
    }

    let planLimit: number | null = null;

    if (user.plan_id) {
      const { data: plan } = await sb
        .from("pricing_plans")
        .select("project_limit")
        .eq("id", user.plan_id)
        .single();

      if (plan) {
        planLimit = plan.project_limit;
      }
    }

    const effectiveLimit = Math.max(user.project_limit ?? 0, planLimit ?? 0, 2);

    if ((existingProjects || []).length >= effectiveLimit) {
      throw createError({
        statusCode: 403,
        statusMessage: "Project limit reached. Upgrade to create more projects.",
      });
    }

    const projectKey = randomBytes(8).toString("hex");

    const { data: newProject, error } = await sb
      .from("projects")
      .insert({
        user_id: auth.id,
        name: name.trim(),
        project_key: projectKey,
        public_token: '',
        grace_period: Number(gracePeriod),
        client_name: clientName?.trim() || null,
        target_completion: targetCompletion || null,
        description: description?.trim() || null,
        budget: budget?.trim() || null,
        priority: priority || 'medium',
      })
      .select("id, name, project_key, public_token, state, message, grace_period, client_name, target_completion, description, budget, priority, created_at, updated_at")
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
