import { requireAdmin } from "../utils/auth";
import { useSupabaseAdmin } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const auth = await requireAdmin(event);
  const sb = useSupabaseAdmin();

  const [{ count: totalUsers, error: usersError }, { count: totalProjects, error: projectsError }, { count: totalTickets, error: ticketsError }, { count: openTickets, error: openError }] = await Promise.all([
    sb.from("users").select("id", { head: true, count: "exact" }),
    sb.from("projects").select("id", { head: true, count: "exact" }),
    sb.from("support_tickets").select("id", { head: true, count: "exact" }),
    sb.from("support_tickets").select("id", { head: true, count: "exact" }).eq("status", "open"),
  ]);

  if (usersError || projectsError || ticketsError || openError) {
    throw createError({ statusCode: 500, statusMessage: "Failed to load admin summary." });
  }

  const { data: users, error: usersListError } = await sb
    .from("users")
    .select("id, email, role, project_limit, plan_id, plan_expires_at")
    .order("email", { ascending: true });

  const { data: projectRows, error: projectRowsError } = await sb
    .from("projects")
    .select("user_id");

  if (projectRowsError) {
    throw createError({ statusCode: 500, statusMessage: "Failed to load users for admin dashboard." });
  }

  const projectCountByUser = (projectRows || []).reduce<Record<string, number>>((acc: Record<string, number>, project: { user_id?: string }) => {
    if (project.user_id) {
      acc[project.user_id] = (acc[project.user_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (usersListError) {
    throw createError({ statusCode: 500, statusMessage: "Failed to load users for admin dashboard." });
  }

  const planMap: Record<string, string> = {};
  const { data: plans, error: plansError } = await sb
    .from("pricing_plans")
    .select("id, slug, name, project_limit");

  let freeProjectLimit = 2;
  if (!plansError && plans) {
    for (const plan of plans) {
      if (plan.id) planMap[plan.id] = plan.name;
      if (plan.slug === "free") freeProjectLimit = plan.project_limit;
    }
  }

  const adminUsers = (users || []).map((user: { id: string; email: string; role?: string | null; project_limit?: number | null; plan_id?: string | null; plan_expires_at?: string | null }) => {
    const planLimit = user.plan_id ? undefined : freeProjectLimit;
    const effectiveLimit = Math.max(user.project_limit ?? 0, planLimit ?? 0, 2);

    return {
      id: user.id,
      email: user.email,
      role: user.role ?? "user",
      project_limit: effectiveLimit,
      project_count: projectCountByUser[user.id] ?? 0,
      plan_id: user.plan_id,
      plan_name: user.plan_id ? planMap[user.plan_id] ?? "Custom" : "Free",
      plan_expires_at: user.plan_expires_at,
    };
  });

  const { data: tickets } = await sb
    .from("support_tickets")
    .select("id, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    userId: auth.id,
    email: auth.email,
    totals: {
      users: totalUsers ?? 0,
      projects: totalProjects ?? 0,
      tickets: totalTickets ?? 0,
      openTickets: openTickets ?? 0,
    },
    users: adminUsers,
    tickets: tickets || [],
  };
});
