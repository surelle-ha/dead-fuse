export default defineEventHandler(() => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const jwtSecret = process.env.JWT_SECRET;
  
  return {
    configured: Boolean(supabaseUrl && supabaseKey && jwtSecret),
    hasSupabase: Boolean(supabaseUrl && supabaseKey),
    hasJwtSecret: Boolean(jwtSecret),
  };
});
