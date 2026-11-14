<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Roles &amp; Permissions</h1>
        <p class="text-sm text-gray-500">Atur role pengguna dan hak akses fitur (RBAC).</p>
      </div>
      <button
        type="button"
        @click="openCreate"
        class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
      >
        + Buat Role
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="r in roles"
        :key="r.id"
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between gap-4"
      >
        <div>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900">{{ r.name }}</h3>
            <div class="flex items-center gap-2">
              <button type="button" @click="openEdit(r)" class="text-xs font-semibold text-amber-600 hover:underline">Edit</button>
              <button type="button" @click="handleDelete(r.id)" class="text-xs font-semibold text-red-600 hover:underline">Hapus</button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ r.permissions.length }} permissions aktif</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="perm in r.permissions"
              :key="perm"
              class="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-medium"
            >
              {{ perm }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ editingId ? 'Edit Role' : 'Buat Role Baru' }}</h3>
          <button type="button" @click="modalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Role *</label>
            <input v-model="form.name" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <label
                v-for="perm in ALL_PERMISSIONS"
                :key="perm"
                class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
              >
                <input v-model="form.permissions" type="checkbox" :value="perm" class="rounded border-gray-300 text-primary-600" />
                <span>{{ perm }}</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="modalOpen = false" class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Batal</button>
            <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoleRecord } from '~/types/arsip'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const ALL_PERMISSIONS = [
  'view_any_arsip',
  'view_arsip',
  'create_arsip',
  'update_arsip',
  'delete_arsip',
  'restore_arsip',
  'force_delete_arsip',
  'view_any_kategori',
  'create_kategori',
  'update_kategori',
  'delete_kategori',
  'view_any_subjek',
  'create_subjek',
  'update_subjek',
  'delete_subjek',
  'view_any_user',
  'create_user',
  'update_user',
  'delete_user',
  'view_any_role',
  'create_role',
  'update_role',
  'delete_role',
  'view_audit_trail',
  'manage_settings'
]

const app = useArsipApp()
const { roles } = app

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  permissions: [] as string[]
})

onMounted(async () => {
  await app.init()
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.permissions = ['view_any_arsip', 'view_arsip']
  modalOpen.value = true
}

function openEdit(r: RoleRecord) {
  editingId.value = r.id
  form.name = r.name
  form.permissions = [...r.permissions]
  modalOpen.value = true
}

async function handleSave() {
  if (editingId.value) {
    await app.updateRole(editingId.value, { name: form.name, permissions: form.permissions })
  } else {
    await app.createRole({ name: form.name, permissions: form.permissions })
  }
  modalOpen.value = false
}

async function handleDelete(id: number) {
  if (!confirm('Hapus role ini?')) return
  await app.deleteRole(id)
}
</script>

