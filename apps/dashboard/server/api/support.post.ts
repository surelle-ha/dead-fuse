import { requireAuth } from "../utils/auth";
import { useSupabaseAdmin } from "../utils/supabase";

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event);
  const body = await readBody(event);
  const subject = String(body?.subject || "").trim();
  const message = String(body?.message || "").trim();

  if (!subject || !message) {
    throw createError({ statusCode: 400, statusMessage: "Subject and message are required." });
  }

  const sb = useSupabaseAdmin();
  const { data: ticket, error } = await sb
    .from("support_tickets")
    .insert({
      user_id: auth.id,
      subject,
      message,
    })
    .select("id, subject, message, status, created_at")
    .single();

  if (error || !ticket) {
    throw createError({ statusCode: 500, statusMessage: error?.message ?? "Failed to create support ticket." });
  }

  return { ticket };
});
