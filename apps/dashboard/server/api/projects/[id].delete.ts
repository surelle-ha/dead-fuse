import { requireAuth } from "~/server/utils/auth";
import { useSupabaseAdmin } from "~/server/utils/supabase";
import { hasDeletedAtColumn } from "./utils";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const id = getRouterParam(event, "id");
  const sb = useSupabaseAdmin();
  const hideDeleted = await hasDeletedAtColumn();

  let result;

  if (hideDeleted) {
    result = await sb
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", auth.id)
      .is("deleted_at", null);
  } else {
    result = await sb
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.id);
  }

  const { error } = result;

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { success: true };
});