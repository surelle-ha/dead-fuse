import { requireAuth } from "../../utils/auth";

export default defineEventHandler((event) => {
  const payload = requireAuth(event);
  return { userId: payload.userId, email: payload.email };
});
