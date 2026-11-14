<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div class="flex items-center gap-2.5">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Users &amp; Akses Data</h1>
          <span class="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
            {{ users.length }}
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-0.5">
          Kelola pengguna, tetapkan role (<span class="font-medium">superadmin</span>, <span class="font-medium">writer</span>, <span class="font-medium">viewer</span>), dan atur data apa saja yang boleh dilihat atau diedit.
        </p>
      </div>
      <button
        type="button"
        @click="openCreate"
        class="inline-flex items-center gap-1.5 rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>Buat User</span>
      </button>
    </div>

    <div v-if="statusMsg" class="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
      {{ statusMsg }}
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50/90">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cakupan Akses Data</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dibuat</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-14">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">{{ u.name }}</td>
              <td class="px-4 py-3.5 text-slate-600 whitespace-nowrap">{{ u.email }}</td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  :class="[
                    roleBadgeClass(u.role),
                    'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold'
                  ]"
                >
                  {{ formatRoleLabel(u.role) }}
                </span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                <span
                  v-if="normalizeRole(u.role) === 'superadmin'"
                  class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                >
                  Akses Penuh (Semua Data)
                </span>
                <span
                  v-else-if="app.getUserCustomPermissions(u.id)"
                  class="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 font-medium"
                >
                  {{ formatUserScopeSummary(u.id) }}
                </span>
                <span v-else class="text-slate-500">
                  Mengikuti Role {{ formatRoleLabel(u.role) }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-slate-600 whitespace-nowrap tabular-nums">{{ formatDate(u.created_at) }}</td>
              <td class="px-4 py-3.5 text-right whitespace-nowrap w-14">
                <RowActionMenu
                  :items="[
                    {
                      label: 'Edit & Atur Akses',
                      onClick: () => openEdit(u),
                      icon: 'edit'
                    },
                    {
                      label: 'Hapus User',
                      onClick: () => handleDelete(u.id),
                      icon: 'delete',
                      variant: 'danger',
                      show: u.id !== currentUser?.id
                    }
                  ]"
                />
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-slate-500">Belum ada pengguna terdaftar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div class="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ editingId ? 'Edit User & Atur Akses Data' : 'Buat User Baru' }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">Tetapkan role pengguna serta data spesifik yang dapat dilihat atau diedit.</p>
          </div>
          <button
            type="button"
            @click="modalOpen = false"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="modalErr" class="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-800">
          {{ modalErr }}
        </div>

        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nama *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B192C] focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Role *</label>
            <select
              v-model="form.role"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:border-[#0B192C] focus:outline-none"
            >
              <option value="superadmin">Super Admin (superadmin) — Semua Permission</option>
              <option value="writer">Writer (writer) — Lihat, Buat, Edit, &amp; Hapus Data</option>
              <option value="viewer">Viewer (viewer) — Hanya Lihat Data</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Password {{ editingId ? '(Kosongkan jika tidak diubah)' : '*' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!editingId"
              minlength="6"
              placeholder="Minimal 6 karakter"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <!-- Role-specific Data Access Controls -->
          <div
            v-if="form.role === 'superadmin'"
            class="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600"
          >
            Pengguna dengan role <span class="font-semibold text-slate-900">Super Admin</span> otomatis memiliki akses penuh ke seluruh data, modul, dan pengaturan sistem.
          </div>

          <div v-else class="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50/50">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 class="text-sm font-semibold text-slate-900">Atur Data yang Bisa Dilihat / Diedit</h4>
                <p class="text-xs text-slate-500">Pilih ikut pengaturan role atau kustomisasi khusus untuk pengguna ini.</p>
              </div>
              <select
                v-model="aclMode"
                class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium bg-white text-slate-800"
              >
                <option value="role">Ikuti Pengaturan Role ({{ formatRoleLabel(form.role) }})</option>
                <option value="custom">Kustomisasi Akses Data User Ini</option>
              </select>
            </div>

            <div v-if="aclMode === 'custom'" class="space-y-4 pt-2 border-t border-slate-200/80">
              <div
                v-if="form.role === 'viewer'"
                class="rounded-lg bg-sky-50 border border-sky-200 px-3 py-2 text-xs text-sky-800"
              >
                Role <span class="font-semibold">Viewer</span> hanya bisa diatur modul dan kategori yang boleh <span class="font-semibold">dilihat</span>. Akses buat/edit/hapus dinonaktifkan.
              </div>

              <!-- Module Toggles -->
              <div>
                <div class="text-xs font-semibold text-slate-700 mb-2">Akses Modul &amp; Aksi Data</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    v-for="mod in USER_MODULE_TOGGLES"
                    :key="mod.id"
                    :class="[
                      form.role === 'viewer' && mod.writeOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                      'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700'
                    ]"
                  >
                    <input
                      type="checkbox"
                      :checked="isModuleEnabled(mod.perms)"
                      :disabled="form.role === 'viewer' && mod.writeOnly"
                      @change="toggleUserModule(mod.perms, ($event.target as HTMLInputElement).checked)"
                      class="rounded border-slate-300 text-[#0B192C] focus:ring-sky-500"
                    />
                    <span>{{ mod.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Viewable Category Scope -->
              <div class="space-y-2">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span class="text-xs font-semibold text-slate-700">Kategori Data yang Dapat Dilihat</span>
                  <select
                    v-model="viewScopeMode"
                    class="rounded-lg border border-slate-300 px-2.5 py-1 text-xs bg-white text-slate-800"
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="custom">Pilih Kategori Tertentu</option>
                  </select>
                </div>
                <div
                  v-if="viewScopeMode === 'custom'"
                  class="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-3 max-h-40 overflow-y-auto"
                >
                  <label
                    v-for="k in kategoris"
                    :key="`u-view-${k.id}`"
                    class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                  >
                    <input v-model="customViewKategoriIds" type="checkbox" :value="k.id" class="rounded border-slate-300 text-[#0B192C]" />
                    <span class="inline-flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: k.color }"></span>
                      <span>{{ k.nama }}</span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Editable Category Scope (Writer only) -->
              <div v-if="form.role === 'writer'" class="space-y-2">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span class="text-xs font-semibold text-slate-700">Kategori Data yang Dapat Diedit / Dihapus</span>
                  <select
                    v-model="editScopeMode"
                    class="rounded-lg border border-slate-300 px-2.5 py-1 text-xs bg-white text-slate-800"
                  >
                    <option value="all">Semua Kategori yang Dapat Dilihat</option>
                    <option value="custom">Pilih Kategori Tertentu</option>
                  </select>
                </div>
                <div
                  v-if="editScopeMode === 'custom'"
                  class="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-3 max-h-40 overflow-y-auto"
                >
                  <label
                    v-for="k in selectableEditKategoris"
                    :key="`u-edit-${k.id}`"
                    class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                  >
                    <input v-model="customEditKategoriIds" type="checkbox" :value="k.id" class="rounded border-slate-300 text-[#0B192C]" />
                    <span class="inline-flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: k.color }"></span>
                      <span>{{ k.nama }}</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="modalOpen = false"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-lg bg-[#0B192C] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DEFAULT_ROLE_PERMISSIONS,
  buildPermissionsWithScopes,
  extractBasePermissions,
  extractScopeIds,
  formatRoleLabel,
  normalizeRole,
  sanitizePermissionsForRole,
  type AppRole
} from '~/composables/useArsipApp'
import type { ProfileRecord } from '~/types/arsip'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const USER_MODULE_TOGGLES = [
  { id: 'view_arsip', label: 'Lihat Daftar & Detail Arsip', perms: ['view_any_arsip', 'view_arsip'], writeOnly: false },
  { id: 'create_arsip', label: 'Buat / Upload Arsip', perms: ['create_arsip'], writeOnly: true },
  { id: 'update_arsip', label: 'Edit Arsip & Versi Baru', perms: ['update_arsip'], writeOnly: true },
  {
    id: 'delete_arsip',
    label: 'Hapus & Pulihkan Arsip (Trash)',
    perms: ['delete_arsip', 'restore_arsip', 'force_delete_arsip'],
    writeOnly: true
  },
  { id: 'view_kategori', label: 'Lihat Fungsi Arsip (Kategori)', perms: ['view_any_kategori'], writeOnly: false },
  {
    id: 'manage_kategori',
    label: 'Kelola Fungsi Arsip (Buat/Edit/Hapus)',
    perms: ['create_kategori', 'update_kategori', 'delete_kategori'],
    writeOnly: true
  },
  { id: 'view_subjek', label: 'Lihat Subjek Arsip', perms: ['view_any_subjek'], writeOnly: false },
  {
    id: 'manage_subjek',
    label: 'Kelola Subjek Arsip (Buat/Edit/Hapus)',
    perms: ['create_subjek', 'update_subjek', 'delete_subjek'],
    writeOnly: true
  }
]

const app = useArsipApp()
const { users, roles, kategoris, currentUser, isSupabase } = app

const modalOpen = ref(false)
const saving = ref(false)
const statusMsg = ref('')
const modalErr = ref('')
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  email: '',
  role: 'writer' as AppRole,
  password: ''
})

const aclMode = ref<'role' | 'custom'>('role')
const customBasePerms = ref<string[]>([...DEFAULT_ROLE_PERMISSIONS.writer])
const viewScopeMode = ref<'all' | 'custom'>('all')
const customViewKategoriIds = ref<number[]>([])
const editScopeMode = ref<'all' | 'custom'>('all')
const customEditKategoriIds = ref<number[]>([])

const selectableEditKategoris = computed(() => {
  if (viewScopeMode.value === 'all') return kategoris.value
  return kategoris.value.filter((k) => customViewKategoriIds.value.includes(k.id))
})

watch(
  () => form.role,
  (nextRole) => {
    if (nextRole === 'viewer') {
      customBasePerms.value = sanitizePermissionsForRole('viewer', customBasePerms.value)
    } else if (nextRole === 'writer' && customBasePerms.value.length === 0) {
      customBasePerms.value = [...DEFAULT_ROLE_PERMISSIONS.writer]
    }
  }
)

onMounted(async () => {
  await app.init()
})

function roleBadgeClass(role?: string | null): string {
  const norm = normalizeRole(role)
  if (norm === 'superadmin') return 'bg-[#0B192C] text-white'
  if (norm === 'writer') return 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200'
  return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
}

function formatUserScopeSummary(userId: string): string {
  const custom = app.getUserCustomPermissions(userId)
  if (!custom) return 'Default Role'
  const viewCats = extractScopeIds(custom, 'scope_view_kategori:')
  const editCats = extractScopeIds(custom, 'scope_edit_kategori:')
  const parts: string[] = []
  if (viewCats.length > 0) parts.push(`Lihat ${viewCats.length} Kategori`)
  if (editCats.length > 0) parts.push(`Edit ${editCats.length} Kategori`)
  if (parts.length === 0) {
    return `Kustom (${extractBasePermissions(custom).length} modul)`
  }
  return `Kustom: ${parts.join(' · ')}`
}

function isModuleEnabled(perms: string[]): boolean {
  return perms.some((p) => customBasePerms.value.includes(p))
}

function toggleUserModule(perms: string[], checked: boolean) {
  const set = new Set(customBasePerms.value)
  for (const p of perms) {
    if (checked) set.add(p)
    else set.delete(p)
  }
  customBasePerms.value = Array.from(set)
}

function loadAclDraft(role: AppRole, userId?: string | null) {
  const existing = userId ? app.getUserCustomPermissions(userId) : null
  if (existing && role !== 'superadmin') {
    aclMode.value = 'custom'
    customBasePerms.value = extractBasePermissions(existing)
    const viewIds = extractScopeIds(existing, 'scope_view_kategori:')
    const editIds = extractScopeIds(existing, 'scope_edit_kategori:')
    viewScopeMode.value = viewIds.length > 0 ? 'custom' : 'all'
    customViewKategoriIds.value = viewIds.length > 0 ? [...viewIds] : kategoris.value.map((k) => k.id)
    editScopeMode.value = editIds.length > 0 ? 'custom' : 'all'
    customEditKategoriIds.value = editIds.length > 0 ? [...editIds] : kategoris.value.map((k) => k.id)
  } else {
    aclMode.value = 'role'
    const roleDefault = roles.value.find((r) => r.name === role)?.permissions || DEFAULT_ROLE_PERMISSIONS[role]
    customBasePerms.value = extractBasePermissions(roleDefault)
    const viewIds = extractScopeIds(roleDefault, 'scope_view_kategori:')
    const editIds = extractScopeIds(roleDefault, 'scope_edit_kategori:')
    viewScopeMode.value = viewIds.length > 0 ? 'custom' : 'all'
    customViewKategoriIds.value = viewIds.length > 0 ? [...viewIds] : kategoris.value.map((k) => k.id)
    editScopeMode.value = editIds.length > 0 ? 'custom' : 'all'
    customEditKategoriIds.value = editIds.length > 0 ? [...editIds] : kategoris.value.map((k) => k.id)
  }
}

function openCreate() {
  modalErr.value = ''
  statusMsg.value = ''
  editingId.value = null
  form.name = ''
  form.email = ''
  form.role = 'writer'
  form.password = ''
  loadAclDraft('writer', null)
  modalOpen.value = true
}

function openEdit(u: ProfileRecord) {
  modalErr.value = ''
  statusMsg.value = ''
  editingId.value = u.id
  form.name = u.name
  form.email = u.email
  form.role = normalizeRole(u.role)
  form.password = ''
  loadAclDraft(form.role, u.id)
  modalOpen.value = true
}

async function handleSave() {
  modalErr.value = ''
  if (form.role !== 'superadmin' && aclMode.value === 'custom') {
    if (viewScopeMode.value === 'custom' && customViewKategoriIds.value.length === 0) {
      modalErr.value = 'Pilih minimal 1 kategori yang dapat dilihat, atau ubah ke Semua Kategori.'
      return
    }
    if (form.role === 'writer' && editScopeMode.value === 'custom' && customEditKategoriIds.value.length === 0) {
      modalErr.value = 'Pilih minimal 1 kategori yang dapat diedit, atau ubah ke Semua Kategori.'
      return
    }
  }

  saving.value = true
  try {
    let targetId = editingId.value
    if (targetId) {
      await app.updateUser(targetId, {
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password || undefined
      })
    } else {
      const created = await app.createUser({
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password || 'password'
      })
      targetId = created.id
    }

    if (targetId) {
      if (form.role === 'superadmin' || aclMode.value === 'role') {
        await app.saveUserCustomPermissions(targetId, null)
      } else {
        const viewIds = viewScopeMode.value === 'custom' ? customViewKategoriIds.value : []
        const editIds =
          form.role === 'writer' && editScopeMode.value === 'custom'
            ? customEditKategoriIds.value.filter((id) => viewIds.length === 0 || viewIds.includes(id))
            : []
        const nextPerms = buildPermissionsWithScopes(customBasePerms.value, viewIds, editIds)
        await app.saveUserCustomPermissions(targetId, nextPerms)
      }
    }

    statusMsg.value = editingId.value
      ? `Data dan akses pengguna ${form.name} berhasil diperbarui.`
      : `Pengguna ${form.name} berhasil ditambahkan.`
    modalOpen.value = false
  } catch (err: any) {
    modalErr.value = err?.message || 'Gagal menyimpan data pengguna.'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: string) {
  const ok = await app.confirmDialog({
    title: 'Hapus Pengguna?',
    message: 'Data profil dan hak akses pengguna ini akan dihapus secara permanen.',
    confirmText: 'Ya, Hapus Pengguna',
    variant: 'danger'
  })
  if (!ok) return
  await app.deleteUser(id)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
