import { useSupabaseAdmin } from '../../../utils/supabase';
import { signToken } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const code = getQuery(event).code as string | undefined;
  const errorDescription = getQuery(event).error_description as string | undefined;

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: errorDescription || 'GitHub authorization failed.' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 500, statusMessage: 'GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not configured.' });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${appUrl}/api/auth/github/callback`,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
    throw createError({
      statusCode: 500,
      statusMessage: tokenData.error_description || tokenData.error || 'Failed to exchange GitHub login code.',
    });
  }

  const accessToken = tokenData.access_token as string;
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  const userData = await userResponse.json();
  if (!userResponse.ok || !userData?.id) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch GitHub user profile.' });
  }

  const emailResponse = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  });

  const emails = await emailResponse.json();
  if (!emailResponse.ok || !Array.isArray(emails)) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch GitHub email address.' });
  }

  const primaryEmail = emails.find((item: any) => item.primary && item.verified)?.email ||
    emails.find((item: any) => item.verified)?.email;

  if (!primaryEmail) {
    throw createError({ statusCode: 500, statusMessage: 'No verified email address found for GitHub account.' });
  }

  const email = primaryEmail.toLowerCase();
  const providerId = String(userData.id);

  const sb = useSupabaseAdmin();
  const { data: existingUser, error: fetchErr } = await sb
    .from('users')
    .select('id, email')
    .eq('email', email)
    .single();

  if (fetchErr && fetchErr.code !== 'PGRST116') {
    throw createError({ statusCode: 500, statusMessage: 'Database error' });
  }

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { count, error: adminCountError } = await sb
      .from('users')
      .select('id', { head: true, count: 'exact' })
      .eq('role', 'admin');

    const existingAdmins = Number(count) || 0;
    const role = existingAdmins === 0 ? 'admin' : 'user';

    const { data: newUser, error: insertErr } = await sb
      .from('users')
      .insert({
        email,
        provider: 'github',
        provider_id: providerId,
        role,
      })
      .select('id')
      .single();

    if (insertErr || !newUser) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create OAuth user' });
    }

    userId = newUser.id;
  }

  const token = signToken({ id: userId, email });

  setCookie(event, 'df_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return sendRedirect(event, '/projects', 302);
});
