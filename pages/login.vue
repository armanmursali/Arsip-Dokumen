<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-slate-50">
    <!-- Left Branding Panel (Desktop) -->
    <aside class="hidden lg:flex lg:w-5/12 xl:w-[44%] bg-[#0B192C] text-white p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
      <!-- Subtle architectural grid lines -->
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.04]"
        style="background-image: linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px); background-size: 40px 40px;"
      ></div>

      <div class="relative z-10 flex items-center justify-between">
        <NuxtLink to="/" class="inline-flex items-center gap-3 group">
          <img
            v-if="settings.logo"
            :src="companyLogoUrl"
            alt="Logo Instansi"
            class="h-10 w-10 rounded-lg object-cover ring-1 ring-white/25 bg-white"
          />
          <div
            v-else
            class="h-10 w-10 rounded-lg bg-sky-500/15 ring-1 ring-sky-400/35 flex items-center justify-center text-sky-400"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div>
            <div class="text-base font-bold tracking-tight text-white">Digital Arsip</div>
            <div class="text-xs text-slate-400">{{ settings.name || 'Pusat Dokumentasi & Arsip' }}</div>
          </div>
        </NuxtLink>
      </div>

      <div class="relative z-10 space-y-8 my-auto py-10">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-inset ring-white/15">
            Portal Pengarsipan Terpadu
          </span>
          <h1 class="mt-4 text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
            {{ settings.name || 'Manajemen Arsip Digital Instansi' }}
          </h1>
          <p class="mt-3 text-sm leading-relaxed text-slate-300 max-w-md">
            {{ settings.slogan || 'Kelola dokumen resmi secara terstruktur, aman, terklasifikasi, dan mudah ditelusuri kapan saja.' }}
          </p>
        </div>

        <div class="space-y-4 border-t border-white/10 pt-7">
          <div class="flex items-start gap-3.5">
            <div class="mt-0.5 h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-sky-400 shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Penyimpanan Terstruktur</h3>
              <p class="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Klasifikasi dua tingkat berdasarkan Fungsi Arsip dan Subjek dengan penandaan warna visual.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3.5">
            <div class="mt-0.5 h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-sky-400 shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Riwayat Versi &amp; Audit Trail</h3>
              <p class="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Setiap perubahan arsip tersimpan dalam versi historis beserta jejak aktivitas pengguna yang lengkap.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3.5">
            <div class="mt-0.5 h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-sky-400 shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white">Akses Berbasis Peran</h3>
              <p class="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Autentikasi aman dan pengelolaan hak akses berbasis peran untuk menjaga kerahasiaan dokumen.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-5">
        <span>&copy; {{ new Date().getFullYear() }} Digital Arsip</span>
        <NuxtLink to="/" class="text-slate-300 hover:text-white transition-colors">Kembali ke Beranda &rarr;</NuxtLink>
      </div>
    </aside>

    <!-- Right Form Panel -->
    <main class="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
      <div class="w-full max-w-md space-y-6">
        <!-- Mobile Header Brand -->
        <div class="lg:hidden flex items-center justify-between">
          <NuxtLink to="/" class="inline-flex items-center gap-2.5">
            <img
              v-if="settings.logo"
              :src="companyLogoUrl"
              alt="Logo Instansi"
              class="h-9 w-9 rounded-lg object-cover border border-slate-200 bg-white"
            />
            <div
              v-else
              class="h-9 w-9 rounded-lg bg-[#0B192C] flex items-center justify-center text-sky-400"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div>
              <div class="text-base font-bold text-slate-900">Digital Arsip</div>
              <div class="text-xs text-slate-500">{{ settings.name || 'Portal Pengarsipan' }}</div>
            </div>
          </NuxtLink>
          <NuxtLink to="/" class="text-xs font-medium text-slate-500 hover:text-slate-900">Beranda</NuxtLink>
        </div>

        <div class="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 class="text-xl font-bold tracking-tight text-slate-900">
              Masuk ke Akun
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              Gunakan akun yang telah didaftarkan oleh Super Admin untuk mengakses ruang kerja arsip.
            </p>
          </div>

          <div v-if="errorMsg" class="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-sm text-rose-700">
            {{ errorMsg }}
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">Alamat Email</label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="nama@instansi.go.id"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-shadow"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">Password</label>
              <input
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-shadow"
              />
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full rounded-lg bg-[#0B192C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {{ submitting ? 'Memproses...' : 'Masuk ke Dashboard' }}
            </button>
          </form>

          <p class="text-xs text-slate-500 text-center border-t border-slate-100 pt-4">
            Belum memiliki akses? Hubungi Super Admin instansi untuk pembuatan akun baru.
          </p>
        </div>

        <p class="text-center text-xs text-slate-400 lg:hidden">
          &copy; {{ new Date().getFullYear() }} {{ settings.name || 'Digital Arsip' }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const app = useArsipApp()
const { currentUser, settings, companyLogoUrl } = app

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const submitting = ref(false)

watch(
  () => currentUser.value,
  (user) => {
    if (user) {
      router.replace('/dashboard')
    }
  }
)

onMounted(async () => {
  await app.init()
  if (currentUser.value) {
    await router.replace('/dashboard')
  }
})

async function handleSubmit() {
  errorMsg.value = ''
  submitting.value = true
  try {
    const res = await app.login(email.value, password.value)
    if (!res.ok) {
      errorMsg.value = res.error || 'Gagal melakukan autentikasi.'
      return
    }
    await router.replace('/dashboard')
    await nextTick()
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
      window.location.assign('/dashboard')
    }
  } catch (err: any) {
    if (currentUser.value && typeof window !== 'undefined') {
      window.location.assign('/dashboard')
      return
    }
    errorMsg.value = err?.message || 'Terjadi kesalahan saat memproses autentikasi.'
  } finally {
    submitting.value = false
  }
}
</script>
