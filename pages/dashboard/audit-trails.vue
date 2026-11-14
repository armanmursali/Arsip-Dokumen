<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">Audit Trails</h1>
      <p class="text-sm text-gray-500">Log seluruh aktivitas created, updated, dan deleted di dalam sistem.</p>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <input
        v-model="search"
        type="text"
        placeholder="Cari aktivitas, model, atau nama pengguna..."
        class="w-full sm:w-96 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
      />
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aktivitas</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Model</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pengguna</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="log in filtered" :key="log.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <span :class="[activityBadgeClass(log.description), 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold']">
                  {{ log.description }}
                </span>
              </td>
              <td class="px-4 py-3 font-medium text-gray-800">
                {{ app.getActivitySubjectName(log) }}
              </td>
              <td class="px-4 py-3 text-gray-600">{{ log.causer_name || 'System' }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDateTime(log.created_at) }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  type="button"
                  @click="selectedLog = log"
                  class="text-xs font-semibold text-sky-600 hover:underline"
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">Belum ada catatan aktivitas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal (Data Baru vs Data Lama) -->
    <div v-if="selectedLog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-5">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Detail Audit Trail</h3>
          <button type="button" @click="selectedLog = null" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 text-sm">
          <div>
            <span class="text-xs text-gray-500 block">Aktivitas</span>
            <span class="font-semibold text-gray-900">{{ selectedLog.description }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">Model / Data</span>
            <span class="font-semibold text-gray-900">{{ app.getActivitySubjectName(selectedLog) }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">Dilakukan oleh</span>
            <span class="font-semibold text-gray-900">{{ selectedLog.causer_name || 'System' }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 block">Waktu</span>
            <span class="font-semibold text-gray-900">{{ formatDateTime(selectedLog.created_at) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="text-xs font-semibold text-gray-600 uppercase mb-3">Data Baru</h4>
            <dl
              v-if="selectedLog.properties?.attributes && Object.keys(selectedLog.properties.attributes).length > 0"
              class="space-y-2 text-xs"
            >
              <div
                v-for="(val, key) in selectedLog.properties.attributes"
                :key="`new-${String(key)}`"
                class="flex items-start gap-2"
              >
                <dt class="font-medium text-gray-700 w-32 shrink-0">{{ app.formatFieldLabel(key) }}</dt>
                <dd class="text-gray-900 break-words">{{ app.formatFieldValue(key, val) }}</dd>
              </div>
            </dl>
            <p v-else class="text-xs text-gray-400">Tidak ada data</p>
          </div>
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="text-xs font-semibold text-gray-600 uppercase mb-3">Data Lama</h4>
            <dl
              v-if="selectedLog.properties?.old && Object.keys(selectedLog.properties.old).length > 0"
              class="space-y-2 text-xs"
            >
              <div
                v-for="(val, key) in selectedLog.properties.old"
                :key="`old-${String(key)}`"
                class="flex items-start gap-2"
              >
                <dt class="font-medium text-gray-700 w-32 shrink-0">{{ app.formatFieldLabel(key) }}</dt>
                <dd class="text-gray-700 break-words">{{ app.formatFieldValue(key, val) }}</dd>
              </div>
            </dl>
            <p v-else class="text-xs text-gray-400">Tidak ada data</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityLogRecord } from '~/types/arsip'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const app = useArsipApp()
const { activityLogs } = app

const search = ref('')
const selectedLog = ref<ActivityLogRecord | null>(null)

onMounted(async () => {
  await app.init()
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return activityLogs.value
  return activityLogs.value.filter(
    (l) =>
      l.description.toLowerCase().includes(q) ||
      (l.subject_type || '').toLowerCase().includes(q) ||
      (l.causer_name || '').toLowerCase().includes(q)
  )
})

function activityBadgeClass(desc: string): string {
  switch (desc) {
    case 'created':
      return 'bg-emerald-100 text-emerald-700'
    case 'updated':
      return 'bg-amber-100 text-amber-700'
    case 'deleted':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

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

