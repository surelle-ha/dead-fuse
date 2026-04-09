/**
 * Public endpoint — no auth required.
 * Returns the Supabase project URL and anon key so the dead-fuse SDK
 * can self-configure without the caller needing to know these values.
 * The anon key is safe to expose: Supabase RLS protects the data.
 */
export default defineEventHandler(() => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
        throw createError({
            statusCode: 503,
            statusMessage: "DeadFuse server is not configured yet.",
        });
    }

    return { supabaseUrl: url, supabaseAnonKey: key };
});