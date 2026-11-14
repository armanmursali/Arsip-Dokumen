<template>
  <div class="space-y-6">
    <!-- Company Identity Banner & Quick Actions -->
    <div class="bg-white rounded-xl border border-slate-200 border-l-4 border-l-[#0B192C] shadow-sm p-5 sm:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
          <img
            :src="companyLogoUrl"
            :alt="settings.name || 'Logo Instansi'"
            class="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
          />
          <div class="min-w-0">
            <div class="text-xs font-semibold uppercase tracking-wider text-sky-700">Instansi Pengelola</div>
            <h1 class="text-lg sm:text-xl font-bold text-slate-900 truncate mt-0.5">
              {{ settings.name || 'Nama Instansi' }}
            </h1>
            <p class="text-slate-500 text-xs sm:text-sm truncate mt-0.5">
              {{ settings.slogan || 'Sistem Manajemen Arsip Digital Terpadu' }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <template v-if="canCreateArsip">
            <NuxtLink
              to="/dashboard/picture-to-pdf"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              </svg>
              <span>Scan ke PDF</span>
            </NuxtLink>
            <NuxtLink
              to="/dashboard/arsip/create"
              class="inline-flex items-center gap-2 rounded-lg bg-[#0B192C] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Buat Arsip</span>
            </NuxtLink>
          </template>
          <span
            v-else
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            Akses Lihat Saja — {{ formatRoleLabel(userRole) }}
          </span>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="card in statCards"
        :key="card.title"
        class="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.title }}</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{{ card.value }}</p>
          </div>
          <div :class="[card.iconBg, 'p-2.5 rounded-lg ring-1 ring-inset ring-black/5']">
            <svg class="w-5 h-5" :class="card.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" :d="card.iconPath" />
            </svg>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
          <span
            :class="[
              card.up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums'
            ]"
          >
            <span>{{ card.up ? '↑' : '↓' }}</span>
            <span>{{ (card.up ? '+' : '') + card.delta }} bulan ini</span>
          </span>
          <svg viewBox="0 0 120 28" class="w-24 h-7 overflow-visible">
            <polyline
              fill="none"
              :stroke="card.strokeColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              :points="buildSparklinePoints(card.series)"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Jumlah Arsip per Bulan</h2>
            <p class="text-xs text-slate-500 mt-0.5">Rekap penambahan arsip aktif berdasarkan bulan pembuatan.</p>
          </div>
        </div>
        <ClientOnly>
          <DashboardChartBar :labels="monthlyChart.labels" :values="monthlyChart.values" />
        </ClientOnly>
      </div>

      <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <h2 class="text-base font-semibold text-slate-900">Distribusi Tipe Dokumen</h2>
        <p class="text-xs text-slate-500 mt-0.5 mb-4">Proporsi format file arsip yang tersimpan.</p>
        <ClientOnly>
          <DashboardChartDoughnut
            :labels="docTypeChart.labels"
            :values="docTypeChart.values"
            :colors="docTypeChart.colors"
            label="Dokumen"
          />
        </ClientOnly>
      </div>

      <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <h2 class="text-base font-semibold text-slate-900">Distribusi Arsip per Kategori</h2>
        <p class="text-xs text-slate-500 mt-0.5 mb-4">Sebaran arsip berdasarkan Fungsi Arsip.</p>
        <ClientOnly>
          <DashboardChartDoughnut
            :labels="kategoriChart.labels"
            :values="kategoriChart.values"
            :colors="kategoriChart.colors"
            label="Arsip"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- Recent Upload Activity Table -->
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div class="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Aktivitas Upload Pengguna</h2>
          <p class="text-xs text-slate-500 mt-0.5">Kontribusi pengunggahan arsip terbaru dari setiap pengguna.</p>
        </div>
        <NuxtLink
          to="/dashboard/arsip"
          class="text-xs font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap"
        >
          Lihat Semua Arsip &rarr;
        </NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50/80">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pengguna</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Arsip</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Upload Terakhir</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="row in recentUploadUsers" :key="row.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0">
                    {{ initialsOf(row.name) }}
                  </div>
                  <span class="font-medium text-slate-900">{{ row.name }}</span>
                </div>
              </td>
              <td class="px-6 py-3.5 text-slate-600">{{ row.email }}</td>
              <td class="px-6 py-3.5">
                <span class="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 tabular-nums">
                  {{ row.count }} arsip
                </span>
              </td>
              <td class="px-6 py-3.5 text-slate-600 whitespace-nowrap tabular-nums">{{ formatDateTime(row.lastUpload) }}</td>
            </tr>
            <tr v-if="recentUploadUsers.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-sm text-slate-500">
                Belum ada aktivitas upload pengguna.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRoleLabel, getDocType } from '~/composables/useArsipApp'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const app = useArsipApp()
const { activeArsips, kategoris, visibleKategoris, users, settings, companyLogoUrl, canCreateArsip, userRole } = app

onMounted(async () => {
  await app.init()
})

function initialsOf(name: string): string {
  return (name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
}

function buildMonthlyCountSeries(dates: string[], months = 8): number[] {
  const now = new Date()
  const series: number[] = []
  for (let offset = months - 1; offset >= 0; offset--) {
    const target = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const ym = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`
    const count = dates.filter((d) => (d || '').slice(0, 7) === ym).length
    series.push(count)
  }
  return series
}

function buildMonthlyDistinctUsersSeries(months = 8): number[] {
  const now = new Date()
  const series: number[] = []
  for (let offset = months - 1; offset >= 0; offset--) {
    const target = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const ym = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`
    const distinct = new Set(
      activeArsips.value
        .filter((a) => (a.created_at || '').slice(0, 7) === ym)
        .map((a) => a.user_id || a.user_name || 'unknown')
    )
    series.push(distinct.size)
  }
  return series
}

function monthDelta(series: number[]): { delta: number; up: boolean } {
  if (series.length < 2) return { delta: 0, up: true }
  const delta = series[series.length - 1] - series[series.length - 2]
  return { delta, up: delta >= 0 }
}

function buildSparklinePoints(series: number[]): string {
  if (series.length === 0) return '0,24 120,24'
  const max = Math.max(...series, 1)
  const stepX = series.length > 1 ? 120 / (series.length - 1) : 120
  return series
    .map((val, i) => {
      const x = Math.round(i * stepX)
      const y = Math.round(24 - (val / max) * 20)
      return `${x},${y}`
    })
    .join(' ')
}

const statCards = computed(() => {
  const arsipSeries = buildMonthlyCountSeries(activeArsips.value.map((a) => a.created_at))
  const kategoriSeries = buildMonthlyCountSeries(visibleKategoris.value.map((k) => k.created_at))
  const uploaderSeries = buildMonthlyDistinctUsersSeries()

  const aDelta = monthDelta(arsipSeries)
  const kDelta = monthDelta(kategoriSeries)
  const uDelta = monthDelta(uploaderSeries)

  const uniqueUploaders = new Set(activeArsips.value.map((a) => a.user_id || a.user_name).filter(Boolean)).size

  return [
    {
      title: 'Total Arsip Aktif',
      value: activeArsips.value.length,
      delta: aDelta.delta,
      up: aDelta.up,
      series: arsipSeries,
      strokeColor: '#0284c7',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-700',
      iconPath: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
    },
    {
      title: 'Total Fungsi Arsip',
      value: visibleKategoris.value.length,
      delta: kDelta.delta,
      up: kDelta.up,
      series: kategoriSeries,
      strokeColor: '#059669',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
      iconPath: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z'
    },
    {
      title: 'Pengunggah Aktif',
      value: uniqueUploaders,
      delta: uDelta.delta,
      up: uDelta.up,
      series: uploaderSeries,
      strokeColor: '#d97706',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-700',
      iconPath: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z'
    }
  ]
})

const monthlyChart = computed(() => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const counts = new Map<number, number>()
  for (const a of activeArsips.value) {
    const dt = new Date(a.created_at)
    if (!Number.isNaN(dt.getTime())) {
      const m = dt.getMonth()
      counts.set(m, (counts.get(m) || 0) + 1)
    }
  }
  const sortedMonths = Array.from(counts.keys()).sort((a, b) => a - b)
  return {
    labels: sortedMonths.map((m) => monthNames[m]),
    values: sortedMonths.map((m) => counts.get(m) || 0)
  }
})

const docTypeChart = computed(() => {
  const counts: Record<string, number> = {}
  for (const a of activeArsips.value) {
    const ext = getDocType(a)
    counts[ext] = (counts[ext] || 0) + 1
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const palette = [
    '#0B192C', '#0284C7', '#059669', '#D97706', '#DC2626', '#475569',
    '#0EA5E9', '#14B8A6', '#64748B', '#0369A1', '#F59E0B', '#E11D48'
  ]
  return {
    labels: entries.map(([ext]) => ext),
    values: entries.map(([, total]) => total),
    colors: entries.map((_, idx) => palette[idx % palette.length])
  }
})

const kategoriChart = computed(() => {
  const counts: Record<string, number> = {}
  for (const a of activeArsips.value) {
    const katName = app.getKategori(a.kategori_id)?.nama || 'Lainnya'
    counts[katName] = (counts[katName] || 0) + 1
  }
  const entries = Object.entries(counts)
  const palette = [
    '#0284C7', '#0B192C', '#059669', '#D97706', '#0EA5E9',
    '#DC2626', '#14B8A6', '#475569', '#0369A1', '#94A3B8'
  ]
  return {
    labels: entries.map(([name]) => name),
    values: entries.map(([, total]) => total),
    colors: entries.map((_, idx) => palette[idx % palette.length])
  }
})

const recentUploadUsers = computed(() => {
  const map = new Map<string, { id: string; name: string; email: string; count: number; lastUpload: string }>()
  for (const a of activeArsips.value) {
    const key = a.user_id || a.user_name || 'unknown'
    const matchedUser = users.value.find((u) => u.id === a.user_id)
    const name = matchedUser?.name || a.user_name || 'Unknown'
    const email = matchedUser?.email || '-'
    const existing = map.get(key)
    if (!existing) {
      map.set(key, { id: key, name, email, count: 1, lastUpload: a.created_at })
    } else {
      existing.count += 1
      if (new Date(a.created_at) > new Date(existing.lastUpload)) {
        existing.lastUpload = a.created_at
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastUpload).getTime() - new Date(a.lastUpload).getTime()
  )
})

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
