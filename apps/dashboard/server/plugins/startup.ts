import { runMigrations } from "../utils/db";

export default defineNitroPlugin(async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[DeadFuse] DATABASE_URL not set — skipping migrations. Visit /onboarding to configure.");
    return;
  }
  try {
    await runMigrations();
  } catch (err) {
    console.error("[DeadFuse] Migration failed:", err);
  }
});
