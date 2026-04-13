import { requireAuth } from "../../../../utils/auth";
import { requireAdmin } from "../../../../utils/auth";
import { useSupabaseAdmin } from "../../../../utils/supabase";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const sb = useSupabaseAdmin();
  const { userId } = event.context.params as { userId: string };
  const body = await readBody(event);
  const increment = Number(body?.increment ?? 1);

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing target user id.' });
  }
  if (Number.isNaN(increment) || increment <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Increment must be a positive number.' });
  }

  const { data: user, error: userError } = await sb
    .from('users')
    .select('project_limit')
    .eq('id', userId)
    .single();

  const missingProjectLimitColumn = userError?.message?.includes('project_limit');

  if (userError && !missingProjectLimitColumn) {
    throw createError({ statusCode: 404, statusMessage: 'User not found.' });
  }

  if (missingProjectLimitColumn) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database schema missing users.project_limit. Run migration 007_add_project_limit.sql.',
    });
  }

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found.' });
  }

  const { data: updatedUser, error: updateError } = await sb
    .from('users')
    .update({ project_limit: (user.project_limit ?? 2) + increment })
    .eq('id', userId)
    .select('id, email, project_limit')
    .single();

  if (updateError || !updatedUser) {
    throw createError({ statusCode: 500, statusMessage: updateError?.message ?? 'Failed to increase project slot limit.' });
  }

  return { user: updatedUser };
});
