<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Instansi &amp; Tampilan</h1>
      <p class="text-sm text-slate-500 mt-0.5">Kelola identitas instansi, logo, serta gambar latar dan teks Hero pada halaman utama.</p>
    </div>

    <div v-if="savedMsg" class="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
      {{ savedMsg }}
    </div>
    <div v-if="errMsg" class="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
      {{ errMsg }}
    </div>

    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- Profil Instansi -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        <div class="border-b border-slate-100 pb-3">
          <h2 class="text-base font-semibold text-slate-900">Profil Instansi</h2>
          <p class="text-xs text-slate-500 mt-0.5">Nama, slogan, dan logo yang tampil di sidebar dan halaman publik.</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nama Instansi *</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Slogan Instansi</label>
          <textarea
            v-model="form.slogan"
            rows="2"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Logo Instansi</label>
          <div class="flex flex-wrap items-center gap-4">
            <img
              :src="previewUrl || companyLogoUrl"
              alt="Preview Logo"
              class="h-20 w-20 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
            />
            <div class="space-y-2">
              <input
                type="file"
                accept="image/*"
                @change="onLogoSelected"
                class="block text-sm text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
              />
              <button
                v-if="(settings.logo && !clearLogoFlag) || previewUrl"
                type="button"
                @click="resetLogo"
                class="text-xs font-medium text-rose-600 hover:underline"
              >
                Hapus Logo Kustom
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Halaman Utama -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        <div class="border-b border-slate-100 pb-3">
          <h2 class="text-base font-semibold text-slate-900">Hero Halaman Utama (Beranda)</h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Atur gambar latar belakang, judul utama, dan deskripsi singkat pada banner halaman depan.
          </p>
        </div>

        <!-- Live Preview Hero -->
        <div>
          <span class="block text-xs font-semibold text-slate-600 mb-2">Pratinjau Banner Hero</span>
          <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
            <img
              :src="heroPreviewSrc"
              alt="Pratinjau Latar Hero"
              class="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div class="absolute inset-0 bg-slate-950/60 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-slate-900/45"></div>
            <div class="relative z-10 p-5 sm:p-6 space-y-2.5 max-w-xl">
              <span class="inline-flex items-center gap-1.5 rounded-md bg-white/10 border border-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white">
                <span class="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                <span>{{ form.name || 'Nama Instansi' }}</span>
              </span>
              <h3 class="text-lg sm:text-xl font-bold text-white leading-snug">
                {{ form.heroTitle || 'Pengelolaan Arsip Digital yang Terstruktur, Aman, dan Mudah Ditelusuri' }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-2">
                {{
                  form.heroSubtitle ||
                  form.slogan ||
                  'Simpan, klasifikasikan, dan telusuri dokumen resmi instansi Anda secara cepat, rapi, dan aman.'
                }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Gambar Latar Belakang Hero</label>
          <div class="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/*"
              @change="onHeroSelected"
              class="block text-sm text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
            />
            <button
              v-if="(heroConfig.image && !clearHeroFlag) || heroPreviewUrl"
              type="button"
              @click="resetHeroImage"
              class="text-xs font-medium text-rose-600 hover:underline"
            >
              Gunakan Gambar Default
            </button>
          </div>
          <p class="text-xs text-slate-500 mt-1.5">Disarankan gambar lanskap (misalnya 1600x900 px). Bayangan gelap diterapkan otomatis agar teks tetap terbaca jelas.</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Judul Hero</label>
          <input
            v-model="form.heroTitle"
            type="text"
            placeholder="Pengelolaan Arsip Digital yang Terstruktur, Aman, dan Mudah Ditelusuri"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Subjudul / Deskripsi Hero</label>
          <textarea
            v-model="form.heroSubtitle"
            rows="3"
            placeholder="Kosongkan untuk menampilkan Slogan Instansi secara otomatis."
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
          ></textarea>
          <p class="text-xs text-slate-500 mt-1">Jika dibiarkan kosong, subjudul Hero akan otomatis memakai Slogan Instansi di atas.</p>
        </div>
      </div>

      <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div class="min-w-0">
          <div
            v-if="savedMsg"
            class="inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-emerald-800"
          >
            <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{{ savedMsg }}</span>
          </div>
          <div
            v-else-if="errMsg"
            class="inline-flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs sm:text-sm font-medium text-rose-800"
          >
            <span>{{ errMsg }}</span>
          </div>
        </div>

        <button
          type="submit"
          :disabled="saving"
          class="rounded-lg bg-[#0B192C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0 self-end sm:self-auto"
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

const DEFAULT_HERO_FALLBACK =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80'

const app = useArsipApp()
const { settings, companyLogoUrl, heroConfig, heroImageUrl } = app

const form = reactive({
  name: '',
  slogan: '',
  heroTitle: '',
  heroSubtitle: ''
})
const selectedLogo = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const clearLogoFlag = ref(false)

const selectedHeroFile = ref<File | null>(null)
const heroPreviewUrl = ref<string | null>(null)
const clearHeroFlag = ref(false)

const saving = ref(false)
const savedMsg = ref('')
const errMsg = ref('')

const heroPreviewSrc = computed(() => {
  if (heroPreviewUrl.value) return heroPreviewUrl.value
  if (clearHeroFlag.value) return DEFAULT_HERO_FALLBACK
  return heroImageUrl.value
})

onMounted(async () => {
  await app.init()
  form.name = settings.value.name
  form.slogan = settings.value.slogan || ''
  form.heroTitle = heroConfig.value.title || ''
  form.heroSubtitle = heroConfig.value.subtitle || ''
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

function onHeroSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) return
  selectedHeroFile.value = file
  clearHeroFlag.value = false
  heroPreviewUrl.value = URL.createObjectURL(file)
}

function resetHeroImage() {
  selectedHeroFile.value = null
  heroPreviewUrl.value = null
  clearHeroFlag.value = true
}

async function handleSave() {
  saving.value = true
  savedMsg.value = ''
  errMsg.value = ''
  try {
    let logoPath: string | null | undefined = undefined
    if (clearLogoFlag.value) {
      logoPath = null
    } else if (selectedLogo.value) {
      const uploaded = await app.uploadFile(selectedLogo.value, selectedLogo.value.name, 'settings', 'settings')
      logoPath = uploaded.path
    }

    let heroImagePath: string | null | undefined = undefined
    if (clearHeroFlag.value) {
      heroImagePath = null
    } else if (selectedHeroFile.value) {
      const uploadedHero = await app.uploadFile(selectedHeroFile.value, selectedHeroFile.value.name, 'settings', 'settings')
      heroImagePath = uploadedHero.path
    }

    await app.updateSettings({
      name: form.name,
      slogan: form.slogan || null,
      logo: logoPath,
      hero: {
        title: form.heroTitle.trim() || 'Pengelolaan Arsip Digital yang Terstruktur, Aman, dan Mudah Ditelusuri',
        subtitle: form.heroSubtitle.trim(),
        image: heroImagePath
      }
    })
    selectedLogo.value = null
    selectedHeroFile.value = null
    clearLogoFlag.value = false
    clearHeroFlag.value = false
    previewUrl.value = null
    heroPreviewUrl.value = null
    savedMsg.value = 'Pengaturan instansi dan tampilan Hero berhasil disimpan.'
  } catch (err: any) {
    errMsg.value = err?.message || 'Gagal menyimpan pengaturan.'
  } finally {
    saving.value = false
  }
}
</script>

