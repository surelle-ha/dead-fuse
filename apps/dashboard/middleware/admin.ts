export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return;

  try {
    const me = await $fetch<{ role?: string }>('/api/auth/me');
    if (me.role !== 'admin') {
      return navigateTo('/projects');
    }
  } catch {
    return navigateTo('/login');
  }
});
