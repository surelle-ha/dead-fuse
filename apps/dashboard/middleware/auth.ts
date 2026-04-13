export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for public pages
  if (to.path === '/login' || to.path === '/onboarding') return

  const headers = useRequestHeaders(['cookie'])

  // Check onboarding status first
  try {
    const status = await $fetch<{ configured: boolean }>('/api/onboarding/status', {
      headers,
    })
    if (!status.configured && to.path !== '/onboarding') {
      return navigateTo('/onboarding')
    }
  } catch {
    return navigateTo('/onboarding')
  }

  // Check auth
  try {
    await $fetch('/api/auth/me', { headers })
  } catch {
    return navigateTo('/login')
  }
})
