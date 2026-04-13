import { requireAuth } from "../../utils/auth";
import { useSupabaseAdmin } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const sb = useSupabaseAdmin();

  const { count, error } = await sb
    .from('support_tickets')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', auth.id)
    .eq('status', 'open')
    .eq('subject', 'Limit Increase Request');

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load support request status.' });
  }

  return { pending: (count ?? 0) > 0 };
});
