<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div class="flex items-center gap-2.5">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Subjek Arsip</h1>
          <span class="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700 tabular-nums">
            {{ filtered.length }}
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-0.5">Kelola klasifikasi subjek arsip tingkat kedua beserta warna badge.</p>
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
        <button
          type="button"
          @click="openCreate"
          class="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Buat Subjek</span>
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4">
      <div class="relative w-full sm:w-80">
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
          placeholder="Cari nama subjek arsip..."
          class="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50/90">
            <tr>
              <th class="px-4 py-3 text-left w-10">
                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="rounded border-slate-300 text-[#0B192C] focus:ring-sky-500" />
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Badge</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Deskripsi</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dibuat</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="item in filtered" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-4 py-3.5">
                <input v-model="selectedIds" type="checkbox" :value="item.id" class="rounded border-slate-300 text-[#0B192C] focus:ring-sky-500" />
              </td>
              <td class="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">{{ item.nama }}</td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap"
                  :style="computeBadgeStyle(item.color)"
                >
                  <span class="h-1.5 w-1.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></span>
                  <span>{{ item.nama }}</span>
                </span>
              </td>
              <td class="px-4 py-3.5 text-slate-600 max-w-md truncate">{{ item.deskripsi || '-' }}</td>
              <td class="px-4 py-3.5 text-slate-600 whitespace-nowrap tabular-nums">{{ formatDate(item.created_at) }}</td>
              <td class="px-4 py-3.5 text-right whitespace-nowrap space-x-3">
                <button type="button" @click="openEdit(item)" class="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline">Edit</button>
                <button type="button" @click="handleDelete(item.id)" class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline">Hapus</button>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-slate-500">Belum ada data subjek arsip.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4">
      <div class="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-lg font-semibold text-slate-900">{{ editingId ? 'Edit Subjek Arsip' : 'Buat Subjek Arsip' }}</h3>
          <button type="button" @click="modalOpen = false" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nama Subjek *</label>
            <input
              v-model="form.nama"
              type="text"
              required
              maxlength="255"
              placeholder="Contoh: Surat Keluar"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
            <textarea
              v-model="form.deskripsi"
              rows="3"
              placeholder="Keterangan singkat klasifikasi..."
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
            ></textarea>
          </div>
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-slate-700">Warna Badge *</label>
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap"
                :style="computeBadgeStyle(form.color)"
              >
                <span class="h-1.5 w-1.5 rounded-full shrink-0" :style="{ backgroundColor: form.color }"></span>
                <span>{{ form.nama || 'Contoh Badge' }}</span>
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="preset in ['#0EA5A4', '#2563EB', '#7C3AED', '#F97316', '#DC2626', '#059669', '#0F172A', '#D97706']"
                :key="preset"
                type="button"
                @click="form.color = preset"
                :title="`Pilih warna ${preset}`"
                class="h-7 w-7 rounded-full border transition-transform hover:scale-110 focus:outline-none"
                :class="form.color.toUpperCase() === preset ? 'ring-2 ring-offset-2 ring-[#0B192C] border-white scale-105' : 'border-slate-200'"
                :style="{ backgroundColor: preset }"
              ></button>
              <label class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
                <input v-model="form.color" type="color" class="h-5 w-5 border-0 bg-transparent p-0 cursor-pointer" />
                <span>Kustom</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" @click="modalOpen = false" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" class="rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computeBadgeStyle } from '~/composables/useArsipApp'
import type { SubjekRecord } from '~/types/arsip'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const app = useArsipApp()
const { subjeks } = app

const search = ref('')
const selectedIds = ref<number[]>([])
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  nama: '',
  deskripsi: '',
  color: '#3B82F6'
})

onMounted(async () => {
  await app.init()
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return subjeks.value
  return subjeks.value.filter(
    (s) => s.nama.toLowerCase().includes(q) || (s.deskripsi || '').toLowerCase().includes(q)
  )
})

const allSelected = computed(() => filtered.value.length > 0 && filtered.value.every((s) => selectedIds.value.includes(s.id)))

function toggleSelectAll() {
  selectedIds.value = allSelected.value ? [] : filtered.value.map((s) => s.id)
}

function openCreate() {
  editingId.value = null
  form.nama = ''
  form.deskripsi = ''
  form.color = '#3B82F6'
  modalOpen.value = true
}

function openEdit(item: SubjekRecord) {
  editingId.value = item.id
  form.nama = item.nama
  form.deskripsi = item.deskripsi || ''
  form.color = item.color || '#3B82F6'
  modalOpen.value = true
}

async function handleSave() {
  if (editingId.value) {
    await app.updateSubjek(editingId.value, { ...form })
  } else {
    await app.createSubjek({ ...form })
  }
  modalOpen.value = false
}

async function handleDelete(id: number) {
  if (!confirm('Hapus subjek arsip ini?')) return
  await app.deleteSubjek(id)
  selectedIds.value = selectedIds.value.filter((x) => x !== id)
}

async function handleBulkDelete() {
  if (!confirm(`Hapus ${selectedIds.value.length} subjek terpilih?`)) return
  for (const id of [...selectedIds.value]) {
    await app.deleteSubjek(id)
  }
  selectedIds.value = []
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

