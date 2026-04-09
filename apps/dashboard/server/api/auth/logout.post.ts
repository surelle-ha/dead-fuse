export default defineEventHandler((event) => {
  // Clear the authentication cookie
  deleteCookie(event, 'df_token');
  return { success: true, message: 'Logged out successfully' };
});