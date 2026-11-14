<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
      <p class="text-sm text-gray-500">Kelola informasi perusahaan, slogan, dan logo aplikasi.</p>
    </div>

    <div v-if="savedMsg" class="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
      {{ savedMsg }}
    </div>

    <form @submit.prevent="handleSave" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Slogan Perusahaan</label>
        <textarea
          v-model="form.slogan"
          rows="3"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Logo Perusahaan</label>
        <div class="flex items-center gap-4 mb-3">
          <img
            :src="previewUrl || companyLogoUrl"
            alt="Preview Logo"
            class="h-24 w-24 rounded-xl object-cover border border-gray-200"
          />
          <div class="space-y-2">
            <input
              type="file"
              accept="image/*"
              @change="onLogoSelected"
              class="block text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700"
            />
            <button
              v-if="settings.logo || previewUrl"
              type="button"
              @click="resetLogo"
              class="text-xs text-red-600 hover:underline"
            >
              Hapus Logo Kustom
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const app = useArsipApp()
const { settings, companyLogoUrl } = app

const form = reactive({
  name: '',
  slogan: ''
})
const selectedLogo = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const clearLogoFlag = ref(false)
const saving = ref(false)
const savedMsg = ref('')

onMounted(async () => {
  await app.init()
  form.name = settings.value.name
  form.slogan = settings.value.slogan || ''
})

function onLogoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) return
  selectedLogo.value = file
  clearLogoFlag.value = false
  previewUrl.value = URL.createObjectURL(file)
}

function resetLogo() {
  selectedLogo.value = null
  previewUrl.value = null
  clearLogoFlag.value = true
}

async function handleSave() {
  saving.value = true
  savedMsg.value = ''
  try {
    let logoPath: string | null | undefined = undefined
    if (clearLogoFlag.value) {
      logoPath = null
    } else if (selectedLogo.value) {
      const uploaded = await app.uploadFile(selectedLogo.value, selectedLogo.value.name, 'settings', 'settings')
      logoPath = uploaded.path
    }
    await app.updateSettings({
      name: form.name,
      slogan: form.slogan || null,
      logo: logoPath
    })
    savedMsg.value = 'Pengaturan perusahaan berhasil disimpan.'
  } finally {
    saving.value = false
  }
}
</script>

