<script setup lang="ts">
const app = useArsipApp()
const { settings, companyLogoUrl } = app

await useAsyncData('arsip-public-settings', () => app.loadPublicSettings())

useHead(() => ({
  title: settings.value.name ? `Digital Arsip — ${settings.value.name}` : 'Digital Arsip',
  link: [
    {
      key: 'favicon',
      rel: 'icon',
      href: companyLogoUrl.value
    },
    {
      key: 'shortcut-icon',
      rel: 'shortcut icon',
      href: companyLogoUrl.value
    },
    {
      key: 'apple-touch-icon',
      rel: 'apple-touch-icon',
      href: companyLogoUrl.value
    }
  ]
}))

onMounted(() => {
  app.init()
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
