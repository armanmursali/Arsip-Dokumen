<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div class="flex items-center gap-2.5">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Arsip Dokumen</h1>
          <span class="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700 tabular-nums">
            {{ filtered.length }}
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-0.5">Kelola, filter, dan telusuri dokumen serta file arsip digital instansi.</p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          v-if="selectedIds.length > 0"
          type="button"
          @click="handleBulkDelete"
          class="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          Hapus Terpilih ({{ selectedIds.length }})
        </button>
        <NuxtLink
          to="/dashboard/arsip/create"
          class="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Buat Arsip</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div class="lg:col-span-2">
          <label class="block text-xs font-semibold text-slate-600 mb-1">Cari Arsip</label>
          <div class="relative">
            <svg
              class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Cari judul, nama file, fungsi, atau subjek..."
              class="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Fungsi Arsip</label>
          <select
            v-model="filterKategori"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-800 focus:border-[#0B192C] focus:outline-none"
          >
            <option value="">Semua Fungsi</option>
            <option v-for="k in kategoris" :key="k.id" :value="k.id">{{ k.nama }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Subjek</label>
          <select
            v-model="filterSubjek"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-800 focus:border-[#0B192C] focus:outline-none"
          >
            <option value="">Semua Subjek</option>
            <option v-for="s in subjeks" :key="s.id" :value="s.id">{{ s.nama }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            type="button"
            @click="resetFilters"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Dari Tanggal</label>
          <input
            v-model="dateFrom"
            type="date"
            class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-[#0B192C] focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Sampai Tanggal</label>
          <input
            v-model="dateUntil"
            type="date"
            class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-[#0B192C] focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Urutkan</label>
          <select
            v-model="sortKey"
            class="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white text-slate-800 focus:border-[#0B192C] focus:outline-none"
          >
            <option value="created_desc">Tanggal Terbaru</option>
            <option value="created_asc">Tanggal Terlama</option>
            <option value="judul_asc">Nama (A - Z)</option>
            <option value="judul_desc">Nama (Z - A)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50/90">
            <tr>
              <th class="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  :checked="allPageSelected"
                  @change="toggleSelectAll"
                  class="rounded border-slate-300 text-[#0B192C] focus:ring-sky-500"
                />
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dokumen</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Format</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fungsi</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Subjek</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pengunggah</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tanggal</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="item in paginated" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-4 py-3.5 align-top">
                <input
                  v-model="selectedIds"
                  type="checkbox"
                  :value="item.id"
                  class="mt-0.5 rounded border-slate-300 text-[#0B192C] focus:ring-sky-500"
                />
              </td>
              <td class="px-4 py-3.5 max-w-xs">
                <NuxtLink :to="`/dashboard/arsip/${item.id}`" class="block group">
                  <div class="font-semibold text-slate-900 group-hover:text-sky-700 truncate transition-colors" :title="item.judul">
                    {{ item.judul }}
                  </div>
                  <div class="text-xs text-slate-500 truncate mt-0.5">
                    {{ item.original_file_name || item.file_path }}
                  </div>
                </NuxtLink>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  :class="[
                    getDocTypeBadgeClass(getDocType(item)),
                    'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset'
                  ]"
                >
                  {{ getDocType(item) }}
                </span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  v-if="app.getKategori(item.kategori_id)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :style="computeBadgeStyle(app.getKategori(item.kategori_id)?.color)"
                >
                  {{ app.getKategori(item.kategori_id)?.nama }}
                </span>
                <span v-else class="text-xs text-slate-400">-</span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  v-if="app.getSubjek(item.subjek_id)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :style="computeBadgeStyle(app.getSubjek(item.subjek_id)?.color)"
                >
                  {{ app.getSubjek(item.subjek_id)?.nama }}
                </span>
                <span v-else class="text-xs text-slate-400">-</span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-slate-700">
                {{ app.getUserName(item) }}
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-slate-600 tabular-nums">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-right">
                <div class="inline-flex items-center gap-1">
                  <NuxtLink
                    :to="`/dashboard/arsip/${item.id}`"
                    class="px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                    title="Lihat"
                  >
                    Lihat
                  </NuxtLink>
                  <button
                    type="button"
                    @click="handleDownload(item)"
                    class="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Unduh"
                  >
                    Unduh
                  </button>
                  <NuxtLink
                    :to="`/dashboard/arsip/${item.id}/edit`"
                    class="px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    Edit
                  </NuxtLink>
                  <button
                    type="button"
                    @click="handleDelete(item.id)"
                    class="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Hapus"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginated.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-sm text-slate-500">
                Tidak ada arsip yang sesuai dengan filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 sm:px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-600">
        <div class="tabular-nums text-xs sm:text-sm">
          Menampilkan <span class="font-semibold text-slate-900">{{ paginated.length }}</span> dari
          <span class="font-semibold text-slate-900">{{ filtered.length }}</span> arsip
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="page <= 1"
            @click="page--"
            class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Sebelumnya
          </button>
          <span class="text-xs font-semibold text-slate-700 tabular-nums px-1">Hal {{ page }} / {{ totalPages }}</span>
          <button
            type="button"
            :disabled="page >= totalPages"
            @click="page++"
            class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computeBadgeStyle, getDocType, getDocTypeBadgeClass } from '~/composables/useArsipApp'
import type { ArsipRecord } from '~/types/arsip'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const app = useArsipApp()
const { activeArsips, kategoris, subjeks } = app

const search = ref('')
const filterKategori = ref<string | number>('')
const filterSubjek = ref<string | number>('')
const dateFrom = ref('')
const dateUntil = ref('')
const sortKey = ref('created_desc')
const selectedIds = ref<number[]>([])
const page = ref(1)
const perPage = 10

onMounted(async () => {
  await app.init()
})

watch([search, filterKategori, filterSubjek, dateFrom, dateUntil, sortKey], () => {
  page.value = 1
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = activeArsips.value.filter((a) => {
    if (filterKategori.value !== '' && a.kategori_id !== Number(filterKategori.value)) return false
    if (filterSubjek.value !== '' && a.subjek_id !== Number(filterSubjek.value)) return false
    const dateStr = (a.created_at || '').slice(0, 10)
    if (dateFrom.value && dateStr < dateFrom.value) return false
    if (dateUntil.value && dateStr > dateUntil.value) return false
    if (q) {
      const katName = app.getKategori(a.kategori_id)?.nama?.toLowerCase() || ''
      const subName = app.getSubjek(a.subjek_id)?.nama?.toLowerCase() || ''
      const fileName = (a.original_file_name || a.file_path || '').toLowerCase()
      return (
        a.judul.toLowerCase().includes(q) ||
        fileName.includes(q) ||
        katName.includes(q) ||
        subName.includes(q)
      )
    }
    return true
  })

  return [...list].sort((a, b) => {
    if (sortKey.value === 'created_asc') return a.created_at.localeCompare(b.created_at)
    if (sortKey.value === 'judul_asc') return a.judul.localeCompare(b.judul)
    if (sortKey.value === 'judul_desc') return b.judul.localeCompare(a.judul)
    return b.created_at.localeCompare(a.created_at)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const allPageSelected = computed(() => {
  return paginated.value.length > 0 && paginated.value.every((a) => selectedIds.value.includes(a.id))
})

function toggleSelectAll() {
  if (allPageSelected.value) {
    const pageIds = new Set(paginated.value.map((a) => a.id))
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.has(id))
  } else {
    const next = new Set(selectedIds.value)
    for (const a of paginated.value) next.add(a.id)
    selectedIds.value = Array.from(next)
  }
}

function resetFilters() {
  search.value = ''
  filterKategori.value = ''
  filterSubjek.value = ''
  dateFrom.value = ''
  dateUntil.value = ''
  sortKey.value = 'created_desc'
}

async function handleDelete(id: number) {
  if (!confirm('Pindahkan arsip ini ke Trash Arsip?')) return
  await app.softDeleteArsip(id)
  selectedIds.value = selectedIds.value.filter((x) => x !== id)
}

async function handleBulkDelete() {
  if (!confirm(`Pindahkan ${selectedIds.value.length} arsip terpilih ke Trash Arsip?`)) return
  for (const id of [...selectedIds.value]) {
    await app.softDeleteArsip(id)
  }
  selectedIds.value = []
}

async function handleDownload(item: ArsipRecord) {
  await app.recordDownload(item.id)
  await app.downloadFile(item.file_path, item.original_file_name)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
