export default defineEventHandler((event) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (!clientId) {
    throw createError({ statusCode: 500, statusMessage: 'GITHUB_CLIENT_ID is not configured.' });
  }

  const redirectUrl = `${appUrl}/api/auth/github/callback`;
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=user:email&allow_signup=true`;

  return sendRedirect(event, authUrl, 302);
});
