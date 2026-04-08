export default defineEventHandler(() => {
  const dbUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_SECRET;
  return {
    configured: Boolean(dbUrl && jwtSecret),
    hasDatabase: Boolean(dbUrl),
    hasJwtSecret: Boolean(jwtSecret),
  };
});
