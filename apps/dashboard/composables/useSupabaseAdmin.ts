import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client that uses the SERVICE ROLE key.
 * Only ever call this from server-side API routes — never expose the service key to the browser.
 */
export function useSupabaseAdmin(): SupabaseClient {
    const config = useRuntimeConfig();
    const url = process.env.SUPABASE_URL;
    const key = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        throw createError({
            statusCode: 500,
            statusMessage: "Supabase environment variables are not configured.",
        });
    }

    return createClient(url, key, {
        auth: { persistSession: false },
    });
}