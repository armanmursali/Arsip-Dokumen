 export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const app = useArsipApp()
  await app.init()
  if (!app.currentUser.value && to.path.startsWith('/dashboard')) {
    return navigateTo('/login')
  }
  if (app.currentUser.value && to.path.startsWith('/dashboard') && !app.canAccessPath(to.path)) {
    return navigateTo('/dashboard')
  }
})

