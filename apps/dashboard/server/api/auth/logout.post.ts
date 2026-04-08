export default defineEventHandler((event) => {
  deleteCookie(event, "df_token", { path: "/" });
  return { ok: true };
});
