import { useSupabaseAdmin } from "~/server/utils/supabase";

let cachedHasDeletedAt: boolean | null = null;

export async function hasDeletedAtColumn(): Promise<boolean> {
  if (cachedHasDeletedAt !== null) {
    return cachedHasDeletedAt;
  }

  const sb = useSupabaseAdmin();
  const { error } = await sb.from("projects").select("deleted_at").limit(1);

  if (error) {
    cachedHasDeletedAt = false;
    return false;
  }

  cachedHasDeletedAt = true;
  return true;
}
