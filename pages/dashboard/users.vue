<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">Users</h1>
        <p class="text-sm text-gray-500">Kelola pengguna aplikasi beserta role aksesnya.</p>
      </div>
      <button
        type="button"
        @click="openCreate"
        class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
      >
        + Buat User
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dibuat</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ u.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                  {{ u.role }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(u.created_at) }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button type="button" @click="openEdit(u)" class="text-xs font-semibold text-amber-600 hover:underline">Edit</button>
                <button
                  v-if="u.id !== currentUser?.id"
                  type="button"
                  @click="handleDelete(u.id)"
                  class="text-xs font-semibold text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">Belum ada pengguna terdaftar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ editingId ? 'Edit User' : 'Buat User Baru' }}</h3>
          <button type="button" @click="modalOpen = false" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
            <input v-model="form.name" type="text" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input v-model="form.email" type="email" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select v-model="form.role" required class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
              <option v-for="r in roles" :key="r.id" :value="r.name">{{ r.name }}</option>
            </select>
          </div>
          <div v-if="!isSupabase">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password {{ editingId ? '(Kosongkan jika tidak diubah)' : '*' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!editingId"
              minlength="6"
              placeholder="Minimal 6 karakter"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
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
import type { ProfileRecord } from '~/types/arsip'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const app = useArsipApp()
const { users, roles, currentUser, isSupabase } = app

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  email: '',
  role: 'operator',
  password: ''
})

onMounted(async () => {
  await app.init()
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.email = ''
  form.role = roles.value[0]?.name || 'operator'
  form.password = ''
  modalOpen.value = true
}

function openEdit(u: ProfileRecord) {
  editingId.value = u.id
  form.name = u.name
  form.email = u.email
  form.role = u.role
  form.password = ''
  modalOpen.value = true
}

async function handleSave() {
  if (editingId.value) {
    await app.updateUser(editingId.value, {
      name: form.name,
      email: form.email,
      role: form.role,
      password: form.password || undefined
    })
  } else {
    await app.createUser({
      name: form.name,
      email: form.email,
      role: form.role,
      password: form.password || 'password'
    })
  }
  modalOpen.value = false
}

async function handleDelete(id: string) {
  if (!confirm('Hapus pengguna ini?')) return
  await app.deleteUser(id)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

