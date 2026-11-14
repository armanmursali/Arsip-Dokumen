<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <!-- Top Navbar -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-3 min-w-0">
          <img
            v-if="settings.logo"
            :src="companyLogoUrl"
            alt="Logo Instansi"
            class="h-9 w-9 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
          />
          <div
            v-else
            class="h-9 w-9 rounded-lg bg-[#0B192C] flex items-center justify-center text-sky-400 shrink-0"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div class="min-w-0">
            <span class="block text-base font-bold tracking-tight text-slate-900 truncate">Digital Arsip</span>
            <span v-if="settings.name" class="block text-[11px] text-slate-500 truncate">{{ settings.name }}</span>
          </div>
        </NuxtLink>

        <div class="flex items-center gap-3 shrink-0">
          <NuxtLink
            :to="currentUser ? '/dashboard' : '/login'"
            class="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <span>{{ currentUser ? 'Buka Dashboard' : 'Masuk Portal' }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-slate-900 border-b border-slate-200/80">
      <img
        :src="heroImageUrl"
        alt="Latar Belakang Hero"
        class="absolute inset-0 h-full w-full object-cover object-center"
      />
      <!-- Dark shadow overlay -->
      <div class="absolute inset-0 bg-slate-950/60 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-slate-900/45"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div class="max-w-3xl space-y-6">
          <div class="inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium text-white">
            <span class="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            <span>{{ settings.name || 'Pusat Dokumentasi & Arsip Digital' }}</span>
          </div>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            {{ heroConfig.title || 'Pengelolaan Arsip Digital yang Terstruktur, Aman, dan Mudah Ditelusuri' }}
          </h1>

          <p class="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            {{
              heroConfig.subtitle ||
              settings.slogan ||
              'Simpan, klasifikasikan, dan telusuri dokumen resmi instansi Anda secara cepat, rapi, dan aman.'
            }}
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-1">
            <NuxtLink
              :to="currentUser ? '/dashboard' : '/login'"
              class="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
            >
              <span>{{ currentUser ? 'Masuk ke Dashboard' : 'Mulai Sekarang' }}</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </NuxtLink>
            <a
              href="#fitur"
              class="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="fitur" class="py-16 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-sky-700">Keunggulan Utama</h2>
          <p class="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Dirancang untuk Kepatuhan dan Kecepatan Akses Dokumen
          </p>
          <p class="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Seluruh alur pencatatan, pemindaian, pencarian metadata, dan pengawasan aktivitas terintegrasi secara rapi.
          </p>
        </div>

        <div class="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-colors">
            <div class="h-10 w-10 rounded-lg bg-[#0B192C] text-sky-400 flex items-center justify-center">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-slate-900">Manajemen Arsip Digital</h3>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Simpan, cari, ekspor metadata ke Excel, dan atur dokumen penting termasuk PDF, Gambar, Office, dan Video.
            </p>
          </div>

          <div class="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-colors">
            <div class="h-10 w-10 rounded-lg bg-[#0B192C] text-sky-400 flex items-center justify-center">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-slate-900">Picture to PDF</h3>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Ambil foto dokumen fisik langsung melalui kamera perangkat atau file gambar dan konversi menjadi satu PDF siap arsip.
            </p>
          </div>

          <div class="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-colors">
            <div class="h-10 w-10 rounded-lg bg-[#0B192C] text-sky-400 flex items-center justify-center">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-slate-900">Pratinjau Instan &amp; Berbagi QR</h3>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Tinjau PDF, gambar, video, dan Excel langsung di browser serta bagikan tautan internal dengan QR Code.
            </p>
          </div>

          <div class="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-colors">
            <div class="h-10 w-10 rounded-lg bg-[#0B192C] text-sky-400 flex items-center justify-center">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-slate-900">Klasifikasi Fungsi &amp; Subjek</h3>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Susun taksonomi arsip dengan label berwarna agar pencarian dan pengelompokan dokumen lebih cepat.
            </p>
          </div>

          <div class="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-colors">
            <div class="h-10 w-10 rounded-lg bg-[#0B192C] text-sky-400 flex items-center justify-center">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-slate-900">Audit Trail &amp; Versi</h3>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Lacak setiap aktivitas tambah, ubah, hapus, serta simpan arsip versi sebelumnya untuk akuntabilitas penuh.
            </p>
          </div>

          <div class="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm hover:border-slate-300 transition-colors">
            <div class="h-10 w-10 rounded-lg bg-[#0B192C] text-sky-400 flex items-center justify-center">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 class="mt-4 text-base font-semibold text-slate-900">Trash &amp; Kontrol Akses</h3>
            <p class="mt-2 text-sm text-slate-600 leading-relaxed">
              Penghapusan aman melalui Trash sebelum hapus permanen serta pengaturan peran (RBAC) per pengguna.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-auto bg-[#0B192C] text-slate-300 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="text-base font-bold text-white">Digital Arsip</div>
          <p class="text-xs text-slate-400 mt-1">
            {{ settings.name || 'Pusat Dokumentasi & Arsip Digital' }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <NuxtLink to="/dashboard/arsip" class="hover:text-white transition-colors">Daftar Arsip</NuxtLink>
          <NuxtLink to="/dashboard/picture-to-pdf" class="hover:text-white transition-colors">Picture to PDF</NuxtLink>
          <NuxtLink to="/dashboard/petunjuk-penggunaan" class="hover:text-white transition-colors">Panduan Pengguna</NuxtLink>
          <span>&copy; {{ new Date().getFullYear() }} Digital Arsip</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const app = useArsipApp()
const { currentUser, settings, companyLogoUrl, heroConfig, heroImageUrl } = app

onMounted(async () => {
  await app.init()
})
</script>
