import { requireAuth } from "../../utils/auth";

export default defineEventHandler((event) => {
  const payload = requireAuth(event);
  return { userId: payload.id, email: payload.email };
});
