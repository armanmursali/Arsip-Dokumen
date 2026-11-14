<script setup lang="ts">
const app = useArsipApp()
const router = useRouter()
const route = useRoute()
const { settings, companyLogoUrl } = app

const faviconHref = computed(() => (settings.value.logo ? companyLogoUrl.value : '/favicon.ico'))

useHead(() => ({
  title: settings.value.name ? `Digital Arsip — ${settings.value.name}` : 'Digital Arsip',
  link: [
    {
      key: 'favicon',
      rel: 'icon',
      href: faviconHref.value
    },
    {
      key: 'shortcut-icon',
      rel: 'shortcut icon',
      href: faviconHref.value
    },
    {
      key: 'apple-touch-icon',
      rel: 'apple-touch-icon',
      href: faviconHref.value
    }
  ]
}))

function hasOAuthCallbackParams(): boolean {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash || ''
  const search = window.location.search || ''
  return (
    hash.includes('access_token=') ||
    hash.includes('error=') ||
    search.includes('code=') ||
    search.includes('error=')
  )
}

onMounted(async () => {
  const isOAuthCallback = hasOAuthCallbackParams()
  if (isOAuthCallback) {
    await app.withActionLoading('Memverifikasi akun & mengalihkan ke Dashboard...', async () => {
      await app.loadPublicSettings()
      await app.init(true)
      if (app.currentUser.value && (route.path === '/' || route.path === '/login')) {
        await router.replace('/dashboard')
      } else if (app.oauthError.value && route.path === '/') {
        await router.replace('/login')
      }
    })
    return
  }

  await app.loadPublicSettings()
  await app.init()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-sky-500 selection:text-white">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ConfirmModal />
    <ActionLoadingModal />
  </div>
</template>

<style>
summary {
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 5px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 9999px;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.45);
}
</style>
