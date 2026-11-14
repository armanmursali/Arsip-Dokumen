import type {
  ActivityLogRecord,
  ArsipRecord,
  ArsipVersionRecord,
  KategoriRecord,
  ProfileRecord,
  RoleRecord,
  SettingRecord,
  SubjekRecord
} from '~/types/arsip'

const DEFAULT_PLACEHOLDER_LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='14' fill='%230B192C'/%3E%3Cpath d='M48.5 23L47.1 45.7A4.5 4.5 0 0 1 42.6 50H21.4a4.5 4.5 0 0 1-4.5-4.3L15.5 23m16.5 6v13.5m0 0l-6-6m6 6l6-6M14.75 23h34.5c1.24 0 2.25-1.01 2.25-2.25v-3c0-1.24-1.01-2.25-2.25-2.25h-34.5c-1.24 0-2.25 1.01-2.25 2.25v3c0 1.24 1.01 2.25 2.25 2.25Z' stroke='%2338BDF8' stroke-width='3.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"

export interface HeroConfig {
  title: string
  subtitle: string
  image: string | null
}

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80'

const DEFAULT_HERO_CONFIG: HeroConfig = {
  title: 'Pengelolaan Arsip Digital yang Terstruktur, Aman, dan Mudah Ditelusuri',
  subtitle: '',
  image: null
}

const PENDING_USER_STORAGE_KEY = 'digital_arsip_supabase_pending_user'

export interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'success' | 'info'
}

let confirmResolver: ((val: boolean) => void) | null = null

function encodeCredential(password: string): string {
  if (typeof btoa === 'function') {
    return `cred_v1:${btoa(unescape(encodeURIComponent(password)))}`
  }
  return `cred_v1:${Buffer.from(password, 'utf8').toString('base64')}`
}

function verifyCredential(password: string, stored?: string | null): boolean {
  if (!stored) return false
  return stored === encodeCredential(password) || stored === password
}

function nowIso(): string {
  return new Date().toISOString()
}

function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() || 'file'
  return base.replace(/[ #&{}<>*?/\\$!'"`:@+|=\s]/g, '-')
}

function formatStorageFileName(originalName: string): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const rand = Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10)
  return `${stamp}_${rand}_${sanitizeFileName(originalName)}`
}

export function computeBadgeStyle(_hex?: string | null): {
  backgroundColor: string
  color: string
  borderColor: string
  borderWidth: string
  borderStyle: string
} {
  return {
    backgroundColor: '#f8fafc',
    color: '#334155',
    borderColor: '#e2e8f0',
    borderWidth: '1px',
    borderStyle: 'solid'
  }
}

export function getDocType(arsip: Partial<ArsipRecord>): string {
  const name = arsip.original_file_name || arsip.file_path || ''
  const parts = name.split('.')
  if (parts.length < 2) return 'FILE'
  return (parts.pop() || 'FILE').toUpperCase()
}

export function getDocTypeBadgeClass(ext: string): string {
  switch (ext.toUpperCase()) {
    case 'PDF':
      return 'bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-300'
    case 'DOC':
    case 'DOCX':
      return 'bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300'
    case 'XLS':
    case 'XLSX':
      return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'PPT':
    case 'PPTX':
      return 'bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300'
    case 'JPG':
    case 'JPEG':
    case 'PNG':
    case 'GIF':
    case 'WEBP':
    case 'TIFF':
    case 'SVG':
      return 'bg-sky-100 text-sky-700 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-300'
    case 'ZIP':
    case 'RAR':
    case '7Z':
      return 'bg-purple-100 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-600/20 dark:bg-gray-700 dark:text-gray-300'
  }
}

export const SYSTEM_ROLES = ['superadmin', 'writer', 'viewer'] as const
export type AppRole = (typeof SYSTEM_ROLES)[number]

export const ALL_PERMISSIONS: string[] = [
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

export const WRITER_ALLOWED_PERMISSIONS: string[] = [
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
  'view_audit_trail'
]

export const VIEWER_ALLOWED_PERMISSIONS: string[] = [
  'view_any_arsip',
  'view_arsip',
  'view_any_kategori',
  'view_any_subjek'
]

export const DEFAULT_ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  superadmin: [...ALL_PERMISSIONS],
  writer: [
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
    'delete_subjek'
  ],
  viewer: [...VIEWER_ALLOWED_PERMISSIONS]
}

export function normalizeRole(role?: string | null): AppRole {
  const clean = (role || '').trim().toLowerCase()
  if (clean === 'superadmin' || clean === 'super_admin' || clean === 'admin') {
    return 'superadmin'
  }
  if (clean === 'writer' || clean === 'operator') {
    return 'writer'
  }
  return 'viewer'
}

export function formatRoleLabel(role?: string | null): string {
  const normalized = normalizeRole(role)
  if (normalized === 'superadmin') return 'Super Admin'
  if (normalized === 'writer') return 'Writer'
  return 'Viewer'
}

export function extractScopeIds(
  perms: string[],
  prefix: 'scope_view_kategori:' | 'scope_edit_kategori:'
): number[] {
  const ids = new Set<number>()
  for (const p of perms) {
    if (typeof p === 'string' && p.startsWith(prefix)) {
      const id = Number(p.slice(prefix.length))
      if (Number.isFinite(id) && id > 0) {
        ids.add(id)
      }
    }
  }
  return Array.from(ids)
}

export function extractBasePermissions(perms: string[]): string[] {
  return (perms || []).filter((p) => !p.startsWith('scope_view_kategori:') && !p.startsWith('scope_edit_kategori:'))
}

export function sanitizePermissionsForRole(role: AppRole, perms: string[]): string[] {
  if (role === 'superadmin') {
    return [...ALL_PERMISSIONS]
  }
  const viewScopes = extractScopeIds(perms, 'scope_view_kategori:').map((id) => `scope_view_kategori:${id}`)
  if (role === 'viewer') {
    const base = Array.from(new Set(perms.filter((p) => VIEWER_ALLOWED_PERMISSIONS.includes(p))))
    return [...base, ...viewScopes]
  }
  const base = Array.from(new Set(perms.filter((p) => WRITER_ALLOWED_PERMISSIONS.includes(p))))
  const editScopes = extractScopeIds(perms, 'scope_edit_kategori:').map((id) => `scope_edit_kategori:${id}`)
  return [...base, ...viewScopes, ...editScopes]
}

export function buildPermissionsWithScopes(
  basePerms: string[],
  viewKategoriIds: number[],
  editKategoriIds: number[]
): string[] {
  const cleanBase = extractBasePermissions(basePerms)
  const viewTokens = Array.from(new Set(viewKategoriIds.filter((id) => Number.isFinite(id) && id > 0))).map(
    (id) => `scope_view_kategori:${id}`
  )
  const editTokens = Array.from(new Set(editKategoriIds.filter((id) => Number.isFinite(id) && id > 0))).map(
    (id) => `scope_edit_kategori:${id}`
  )
  return [...cleanBase, ...viewTokens, ...editTokens]
}

export function useArsipApp() {
  const supabase = useSupabaseClient()
  const isSupabase = computed(() => Boolean(supabase))

  const initialized = useState<boolean>('arsip_initialized', () => false)
  const loading = useState<boolean>('arsip_loading', () => false)
  const currentUser = useState<ProfileRecord | null>('arsip_current_user', () => null)
  const roles = useState<RoleRecord[]>('arsip_roles', () => [])
  const userAclMap = useState<Record<string, string[]>>('arsip_user_acl', () => ({}))
  const userCredMap = useState<Record<string, string>>('arsip_user_cred', () => ({}))
  const users = useState<ProfileRecord[]>('arsip_users', () => [])
  const kategoris = useState<KategoriRecord[]>('arsip_kategoris', () => [])
  const subjeks = useState<SubjekRecord[]>('arsip_subjeks', () => [])
  const arsips = useState<ArsipRecord[]>('arsip_arsips', () => [])
  const versions = useState<ArsipVersionRecord[]>('arsip_versions', () => [])
  const activityLogs = useState<ActivityLogRecord[]>('arsip_activity_logs', () => [])
  const settings = useState<SettingRecord>('arsip_settings', () => ({
    id: 1,
    name: '',
    slogan: null,
    logo: null,
    created_at: nowIso(),
    updated_at: nowIso()
  }))
  const heroConfig = useState<HeroConfig>('arsip_hero_config', () => ({ ...DEFAULT_HERO_CONFIG }))

  const confirmModalState = useState<ConfirmDialogOptions & { open: boolean }>('arsip_confirm_modal', () => ({
    open: false,
    title: '',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    variant: 'danger'
  }))

  function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
    if (confirmResolver) {
      confirmResolver(false)
      confirmResolver = null
    }
    confirmModalState.value = {
      open: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Ya, Lanjutkan',
      cancelText: options.cancelText ?? 'Batal',
      variant: options.variant ?? 'danger'
    }
    return new Promise<boolean>((resolve) => {
      confirmResolver = resolve
    })
  }

  function resolveConfirmDialog(result: boolean) {
    confirmModalState.value = { ...confirmModalState.value, open: false }
    if (confirmResolver) {
      const fn = confirmResolver
      confirmResolver = null
      fn(result)
    }
  }

  const actionLoadingCount = useState<number>('arsip_action_loading_count', () => 0)
  const actionLoadingText = useState<string>('arsip_action_loading_text', () => 'Memproses...')
  const actionLoading = computed(() => actionLoadingCount.value > 0)

  async function withActionLoading<T>(label: string, fn: () => Promise<T>): Promise<T> {
    actionLoadingText.value = label
    actionLoadingCount.value += 1
    const startedAt = Date.now()
    try {
      return await fn()
    } finally {
      const elapsed = Date.now() - startedAt
      if (elapsed < 220 && typeof window !== 'undefined') {
        await new Promise((resolve) => setTimeout(resolve, 220 - elapsed))
      }
      actionLoadingCount.value = Math.max(0, actionLoadingCount.value - 1)
    }
  }

  function requireSupabase() {
    if (!supabase) {
      throw new Error('Konfigurasi Supabase belum diatur. Periksa NUXT_PUBLIC_SUPABASE_URL dan NUXT_PUBLIC_SUPABASE_ANON_KEY pada file .env.')
    }
    return supabase
  }

  async function addActivityLog(entry: Omit<ActivityLogRecord, 'id' | 'created_at'>) {
    const sb = requireSupabase()
    const { data, error } = await sb
      .from('activity_logs')
      .insert({
        log_name: entry.log_name,
        description: entry.description,
        subject_type: entry.subject_type,
        subject_id: entry.subject_id,
        causer_id: entry.causer_id,
        causer_name: entry.causer_name,
        properties: entry.properties
      })
      .select()
      .single()
    if (!error && data) {
      activityLogs.value.unshift(data as ActivityLogRecord)
    }
  }

  async function loadPublicSettings() {
    if (!supabase) return null
    try {
      const [setRes, heroRoleRes] = await Promise.all([
        supabase.from('settings').select('*').limit(1).maybeSingle(),
        supabase.from('roles').select('*').eq('name', 'app_config:hero').maybeSingle()
      ])
      let nextHero: HeroConfig = { ...DEFAULT_HERO_CONFIG }
      if (heroRoleRes.data && Array.isArray(heroRoleRes.data.permissions) && typeof heroRoleRes.data.permissions[0] === 'string') {
        try {
          const parsed = JSON.parse(heroRoleRes.data.permissions[0])
          nextHero = {
            title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title : DEFAULT_HERO_CONFIG.title,
            subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : '',
            image: typeof parsed.image === 'string' && parsed.image.trim() ? parsed.image : null
          }
        } catch {
          // ignore malformed JSON
        }
      }
      if (setRes.data) {
        const sRow = setRes.data as SettingRecord
        settings.value = sRow
        if (sRow.hero_title || sRow.hero_subtitle || sRow.hero_image) {
          nextHero = {
            title: sRow.hero_title?.trim() || nextHero.title,
            subtitle: sRow.hero_subtitle ?? nextHero.subtitle,
            image: sRow.hero_image !== undefined ? sRow.hero_image : nextHero.image
          }
        }
      }
      heroConfig.value = nextHero
      return settings.value
    } catch {
      return null
    }
  }

  async function init(force = false) {
    if (initialized.value && !force) return
    if (typeof window === 'undefined') return
    const sb = requireSupabase()

    loading.value = true
    try {
      const { data: sessionData } = await sb.auth.getSession()
      const authUser = sessionData.session?.user || null

      if (authUser) {
        const { data: profileData } = await sb
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

        currentUser.value = profileData
          ? {
              ...(profileData as ProfileRecord),
              role: normalizeRole((profileData as ProfileRecord).role)
            }
          : {
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              role: normalizeRole(authUser.user_metadata?.role || 'viewer'),
              created_at: authUser.created_at,
              updated_at: authUser.created_at
            }
        localStorage.removeItem(PENDING_USER_STORAGE_KEY)
      } else {
        const savedPending = localStorage.getItem(PENDING_USER_STORAGE_KEY)
        if (savedPending) {
          const parsed = JSON.parse(savedPending) as ProfileRecord
          currentUser.value = { ...parsed, role: normalizeRole(parsed.role) }
        } else {
          currentUser.value = null
        }
      }

      const [kRes, sRes, aRes, vRes, lRes, uRes, rRes, setRes] = await Promise.all([
        sb.from('kategoris').select('*').order('id', { ascending: true }),
        sb.from('subjeks').select('*').order('id', { ascending: true }),
        sb.from('arsips').select('*').order('created_at', { ascending: false }),
        sb.from('arsip_versions').select('*').order('version', { ascending: false }),
        sb.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(200),
        sb.from('profiles').select('*').order('created_at', { ascending: false }),
        sb.from('roles').select('*').order('id', { ascending: true }),
        sb.from('settings').select('*').limit(1).maybeSingle()
      ])

      kategoris.value = (kRes.data || []) as KategoriRecord[]
      subjeks.value = (sRes.data || []) as SubjekRecord[]
      arsips.value = (aRes.data || []) as ArsipRecord[]
      versions.value = (vRes.data || []) as ArsipVersionRecord[]
      activityLogs.value = (lRes.data || []) as ActivityLogRecord[]
      users.value = ((uRes.data || []) as ProfileRecord[]).map((u) => ({
        ...u,
        role: normalizeRole(u.role)
      }))

      if (!authUser && currentUser.value) {
        const liveMatch = users.value.find(
          (u) =>
            u.id === currentUser.value?.id ||
            u.email.toLowerCase() === (currentUser.value?.email || '').toLowerCase()
        )
        if (liveMatch) {
          currentUser.value = liveMatch
          localStorage.setItem(PENDING_USER_STORAGE_KEY, JSON.stringify(liveMatch))
        } else {
          currentUser.value = null
          localStorage.removeItem(PENDING_USER_STORAGE_KEY)
        }
      }

      const rawRoles = (rRes.data || []) as RoleRecord[]
      const nextAclMap: Record<string, string[]> = {}
      const nextCredMap: Record<string, string> = {}
      const canonicalRoleMap = new Map<AppRole, RoleRecord>()

      let nextHeroConfig: HeroConfig = { ...DEFAULT_HERO_CONFIG }

      for (const r of rawRoles) {
        if (r.name === 'app_config:hero') {
          if (Array.isArray(r.permissions) && typeof r.permissions[0] === 'string') {
            try {
              const parsed = JSON.parse(r.permissions[0])
              nextHeroConfig = {
                title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title : DEFAULT_HERO_CONFIG.title,
                subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : '',
                image: typeof parsed.image === 'string' && parsed.image.trim() ? parsed.image : null
              }
            } catch {
              // ignore malformed config JSON and keep default hero config
            }
          }
          continue
        }
        if (r.name.startsWith('user_cred:')) {
          const uid = r.name.slice('user_cred:'.length)
          if (uid && Array.isArray(r.permissions) && typeof r.permissions[0] === 'string') {
            nextCredMap[uid] = r.permissions[0]
          }
          continue
        }
        if (r.name.startsWith('user_acl:')) {
          const uid = r.name.slice('user_acl:'.length)
          if (uid) {
            nextAclMap[uid] = Array.isArray(r.permissions) ? r.permissions : []
          }
          continue
        }
        if (SYSTEM_ROLES.includes(r.name as AppRole)) {
          const roleName = r.name as AppRole
          canonicalRoleMap.set(roleName, {
            ...r,
            name: roleName,
            permissions: sanitizePermissionsForRole(
              roleName,
              Array.isArray(r.permissions) ? r.permissions : DEFAULT_ROLE_PERMISSIONS[roleName]
            )
          })
        }
      }

      userCredMap.value = nextCredMap
      userAclMap.value = nextAclMap
      roles.value = SYSTEM_ROLES.map((roleName, idx) => {
        return (
          canonicalRoleMap.get(roleName) || {
            id: -(idx + 1),
            name: roleName,
            permissions: [...DEFAULT_ROLE_PERMISSIONS[roleName]],
            created_at: nowIso()
          }
        )
      })
      if (setRes.data) {
        const sRow = setRes.data as SettingRecord
        settings.value = sRow
        if (sRow.hero_title || sRow.hero_subtitle || sRow.hero_image) {
          nextHeroConfig = {
            title: sRow.hero_title?.trim() || nextHeroConfig.title,
            subtitle: sRow.hero_subtitle ?? nextHeroConfig.subtitle,
            image: sRow.hero_image !== undefined ? sRow.hero_image : nextHeroConfig.image
          }
        }
      }
      heroConfig.value = nextHeroConfig
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  // Auth helpers
  async function saveUserCredential(userId: string, rawPassword: string) {
    if (!userId || !rawPassword) return
    const sb = requireSupabase()
    const encoded = encodeCredential(rawPassword)
    const credName = `user_cred:${userId}`
    await sb.from('roles').upsert({ name: credName, permissions: [encoded] }, { onConflict: 'name' })
    userCredMap.value = { ...userCredMap.value, [userId]: encoded }
  }

  async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    return withActionLoading('Memverifikasi akun...', async () => {
      const sb = requireSupabase()
      await init()
      const cleanEmail = email.trim().toLowerCase()
      const { data, error } = await sb.auth.signInWithPassword({ email: cleanEmail, password })
      if (!error && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(PENDING_USER_STORAGE_KEY)
        }
        const { data: existingProfile } = await sb
          .from('profiles')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle()

        if (!existingProfile) {
          await sb.from('profiles').insert({
            id: data.user.id,
            name: data.user.user_metadata?.name || cleanEmail.split('@')[0] || 'User',
            email: cleanEmail,
            role: normalizeRole(data.user.user_metadata?.role || 'viewer')
          })
        }
        await saveUserCredential(existingProfile?.id || data.user.id, password)
        await init(true)
        return { ok: true }
      }

      // Fallback when Supabase email confirmation blocks signInWithPassword or user was created via Profiles table
      const { data: profileData, error: profileErr } = await sb
        .from('profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle()

      if (profileErr || !profileData) {
        return {
          ok: false,
          error: 'Email belum terdaftar. Silakan hubungi Super Admin untuk pembuatan akun.'
        }
      }

      let storedCred = userCredMap.value[profileData.id]
      if (!storedCred) {
        const { data: credRow } = await sb
          .from('roles')
          .select('permissions')
          .eq('name', `user_cred:${profileData.id}`)
          .maybeSingle()
        if (credRow && Array.isArray(credRow.permissions) && typeof credRow.permissions[0] === 'string') {
          storedCred = credRow.permissions[0]
        }
      }

      if (storedCred && !verifyCredential(password, storedCred)) {
        return { ok: false, error: 'Email atau password yang Anda masukkan salah.' }
      }
      if (!storedCred) {
        await saveUserCredential(profileData.id, password)
      }

      await sb.auth.signOut()
      const normalizedProfile: ProfileRecord = {
        ...(profileData as ProfileRecord),
        role: normalizeRole((profileData as ProfileRecord).role)
      }
      currentUser.value = normalizedProfile
      if (typeof window !== 'undefined') {
        localStorage.setItem(PENDING_USER_STORAGE_KEY, JSON.stringify(normalizedProfile))
      }
      await init(true)
      currentUser.value = normalizedProfile
      if (typeof window !== 'undefined') {
        localStorage.setItem(PENDING_USER_STORAGE_KEY, JSON.stringify(normalizedProfile))
      }
      return { ok: true }
    })
  }

  async function registerDemoOrSupabase(_name: string, _email: string, _password: string): Promise<{ ok: boolean; error?: string }> {
    return {
      ok: false,
      error: 'Pendaftaran mandiri dinonaktifkan. Penambahan akun hanya dapat dilakukan oleh Super Admin.'
    }
  }

  async function logout() {
    return withActionLoading('Keluar dari sesi...', async () => {
      const sb = requireSupabase()
      await sb.auth.signOut()
      if (typeof window !== 'undefined') {
        localStorage.removeItem(PENDING_USER_STORAGE_KEY)
      }
      currentUser.value = null
    })
  }

  async function updateProfile(payload: { name: string; email: string }) {
    if (!currentUser.value) return
    return withActionLoading('Menyimpan profil...', async () => {
      if (!currentUser.value) return
      const sb = requireSupabase()
      const oldData = { name: currentUser.value.name, email: currentUser.value.email }
      await sb.auth.updateUser({
        email: payload.email,
        data: { name: payload.name }
      })
      const { error } = await sb
        .from('profiles')
        .update({ name: payload.name, email: payload.email })
        .eq('id', currentUser.value.id)
      if (error) throw error

      currentUser.value = { ...currentUser.value, ...payload, updated_at: nowIso() }
      await addActivityLog({
        log_name: 'user',
        description: 'updated',
        subject_type: 'User',
        subject_id: currentUser.value.id,
        causer_id: currentUser.value.id,
        causer_name: currentUser.value.name,
        properties: { old: oldData, attributes: payload }
      })
    })
  }

  async function updatePassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
    if (!currentUser.value) return { ok: false, error: 'Tidak ada sesi pengguna.' }
    return withActionLoading('Memperbarui password...', async () => {
      if (!currentUser.value) return { ok: false, error: 'Tidak ada sesi pengguna.' }
      const sb = requireSupabase()
      try {
        await saveUserCredential(currentUser.value.id, newPassword)
        const { data: sessionData } = await sb.auth.getSession()
        if (sessionData.session) {
          const { error } = await sb.auth.updateUser({ password: newPassword })
          if (error) return { ok: false, error: error.message }
        }
        return { ok: true }
      } catch (err: any) {
        return { ok: false, error: err?.message || 'Gagal memperbarui password.' }
      }
    })
  }

  // Storage helpers
  async function uploadFile(
    file: File | Blob,
    originalName: string,
    bucket: 'arsip' | 'settings' = 'arsip',
    folder = 'arsip'
  ): Promise<{ path: string; original_file_name: string; size: number }> {
    return withActionLoading('Mengunggah file...', async () => {
      const sb = requireSupabase()
      const storedName = formatStorageFileName(originalName)
      const objectPath = bucket === 'settings' ? `${storedName}` : `${folder}/${storedName}`

      const { error } = await sb.storage.from(bucket).upload(objectPath, file, {
        upsert: true,
        contentType: file.type || undefined
      })
      if (error) {
        throw new Error(`Gagal upload ke Supabase Storage: ${error.message}`)
      }
      return {
        path: bucket === 'settings' ? `settings/${objectPath}` : objectPath,
        original_file_name: originalName,
        size: file.size
      }
    })
  }

  function getFileUrl(filePath?: string | null): string | null {
    if (!filePath) return null
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
      return filePath
    }
    if (!supabase) return null
    if (filePath.startsWith('settings/')) {
      const clean = filePath.replace(/^settings\//, '')
      return supabase.storage.from('settings').getPublicUrl(clean).data.publicUrl
    }
    return supabase.storage.from('arsip').getPublicUrl(filePath).data.publicUrl
  }

  function getFileSize(arsip: ArsipRecord): number {
    return typeof arsip.file_size === 'number' ? arsip.file_size : 0
  }

  async function deleteStoredFile(filePath?: string | null) {
    if (!filePath) return
    const sb = requireSupabase()
    if (filePath.startsWith('settings/')) {
      await sb.storage.from('settings').remove([filePath.replace(/^settings\//, '')])
    } else {
      await sb.storage.from('arsip').remove([filePath])
    }
  }

  // RBAC & Granular Data Scope Access Controls (3 Roles: superadmin, writer, viewer)
  const userRole = computed<AppRole>(() => normalizeRole(currentUser.value?.role))
  const isSuperAdmin = computed(() => userRole.value === 'superadmin')
  const isWriter = computed(() => userRole.value === 'writer')
  const isViewer = computed(() => userRole.value === 'viewer')

  const effectivePermissions = computed<string[]>(() => {
    if (!currentUser.value) return []
    if (userRole.value === 'superadmin') {
      return [...ALL_PERMISSIONS]
    }
    const customAcl = userAclMap.value[currentUser.value.id]
    if (Array.isArray(customAcl)) {
      return sanitizePermissionsForRole(userRole.value, customAcl)
    }
    const roleRecord = roles.value.find((r) => r.name === userRole.value)
    const basePerms = roleRecord?.permissions || DEFAULT_ROLE_PERMISSIONS[userRole.value]
    return sanitizePermissionsForRole(userRole.value, basePerms)
  })

  function hasPermission(perm: string): boolean {
    if (!currentUser.value) return false
    if (isSuperAdmin.value) return true
    return effectivePermissions.value.includes(perm)
  }

  const canCreateArsip = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('create_arsip')))
  const canUpdateArsip = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('update_arsip')))
  const canDeleteArsip = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('delete_arsip')))
  const canRestoreArsip = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('restore_arsip')))
  const canForceDeleteArsip = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('force_delete_arsip')))

  const canCreateKategori = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('create_kategori')))
  const canUpdateKategori = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('update_kategori')))
  const canDeleteKategori = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('delete_kategori')))
  const canManageKategori = computed(
    () => canCreateKategori.value || canUpdateKategori.value || canDeleteKategori.value
  )

  const canCreateSubjek = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('create_subjek')))
  const canUpdateSubjek = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('update_subjek')))
  const canDeleteSubjek = computed(() => isSuperAdmin.value || (isWriter.value && hasPermission('delete_subjek')))
  const canManageSubjek = computed(
    () => canCreateSubjek.value || canUpdateSubjek.value || canDeleteSubjek.value
  )

  const canWrite = computed(
    () =>
      isSuperAdmin.value ||
      (isWriter.value &&
        (canCreateArsip.value ||
          canUpdateArsip.value ||
          canDeleteArsip.value ||
          canRestoreArsip.value ||
          canForceDeleteArsip.value ||
          canManageKategori.value ||
          canManageSubjek.value))
  )

  const allowedViewKategoriIds = computed<number[]>(() =>
    isSuperAdmin.value ? [] : extractScopeIds(effectivePermissions.value, 'scope_view_kategori:')
  )
  const allowedEditKategoriIds = computed<number[]>(() =>
    isSuperAdmin.value ? [] : extractScopeIds(effectivePermissions.value, 'scope_edit_kategori:')
  )

  function canViewKategoriId(kategoriId?: number | null): boolean {
    if (isSuperAdmin.value) return true
    const allowed = allowedViewKategoriIds.value
    if (allowed.length === 0) return true
    if (!kategoriId) return false
    return allowed.includes(kategoriId)
  }

  function canEditKategoriId(kategoriId?: number | null): boolean {
    if (isSuperAdmin.value) return true
    if (!isWriter.value) return false
    if (!canViewKategoriId(kategoriId)) return false
    const allowed = allowedEditKategoriIds.value
    if (allowed.length === 0) return true
    if (!kategoriId) return false
    return allowed.includes(kategoriId)
  }

  function canEditArsipRecord(arsip: Partial<ArsipRecord>): boolean {
    return canUpdateArsip.value && canEditKategoriId(arsip.kategori_id)
  }

  function canDeleteArsipRecord(arsip: Partial<ArsipRecord>): boolean {
    return canDeleteArsip.value && canEditKategoriId(arsip.kategori_id)
  }

  const visibleKategoris = computed(() => kategoris.value.filter((k) => canViewKategoriId(k.id)))
  const editableKategoris = computed(() => kategoris.value.filter((k) => canEditKategoriId(k.id)))

  function canAccessPath(path: string): boolean {
    if (!currentUser.value) return false
    if (
      path.startsWith('/dashboard/users') ||
      path.startsWith('/dashboard/roles') ||
      path.startsWith('/dashboard/settings')
    ) {
      return isSuperAdmin.value
    }
    if (path.startsWith('/dashboard/audit-trails')) {
      return isSuperAdmin.value || hasPermission('view_audit_trail')
    }
    if (path === '/dashboard/arsip/create' || path.startsWith('/dashboard/picture-to-pdf')) {
      return canCreateArsip.value
    }
    if (/^\/dashboard\/arsip\/[^/]+\/edit/.test(path)) {
      return canUpdateArsip.value
    }
    if (path.startsWith('/dashboard/trash')) {
      return canRestoreArsip.value || canForceDeleteArsip.value
    }
    if (path.startsWith('/dashboard/kategori')) {
      return hasPermission('view_any_kategori')
    }
    if (path.startsWith('/dashboard/subjek')) {
      return hasPermission('view_any_subjek')
    }
    return true
  }

  // Computed active vs trashed arsips (filtered by permissions & category view scope)
  const activeArsips = computed(() => {
    if (!hasPermission('view_any_arsip')) return []
    return arsips.value.filter((a) => !a.deleted_at && canViewKategoriId(a.kategori_id))
  })
  const trashedArsips = computed(() => {
    if (!hasPermission('view_any_arsip')) return []
    return arsips.value.filter((a) => Boolean(a.deleted_at) && canViewKategoriId(a.kategori_id))
  })

  // CRUD Kategoris
  async function createKategori(payload: { nama: string; deskripsi?: string | null; color: string }) {
    if (!canCreateKategori.value) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk membuat kategori.')
    }
    return withActionLoading('Menyimpan fungsi arsip...', async () => {
      const sb = requireSupabase()
      const { data, error } = await sb.from('kategoris').insert(payload).select().single()
      if (error) throw error
      const rec = data as KategoriRecord
      kategoris.value.push(rec)
      await addActivityLog({
        log_name: 'kategori',
        description: 'created',
        subject_type: 'Kategori',
        subject_id: String(rec.id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { attributes: payload }
      })
      return rec
    })
  }

  async function updateKategori(id: number, payload: { nama: string; deskripsi?: string | null; color: string }) {
    if (!canUpdateKategori.value || !canEditKategoriId(id)) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk mengubah kategori ini.')
    }
    return withActionLoading('Memperbarui fungsi arsip...', async () => {
      const sb = requireSupabase()
      const existing = kategoris.value.find((k) => k.id === id)
      const oldData = existing ? { nama: existing.nama, deskripsi: existing.deskripsi, color: existing.color } : {}
      const { data, error } = await sb.from('kategoris').update(payload).eq('id', id).select().single()
      if (error) throw error
      const idx = kategoris.value.findIndex((k) => k.id === id)
      if (idx !== -1) kategoris.value[idx] = data as KategoriRecord
      await addActivityLog({
        log_name: 'kategori',
        description: 'updated',
        subject_type: 'Kategori',
        subject_id: String(id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { old: oldData, attributes: payload }
      })
    })
  }

  async function deleteKategori(id: number) {
    if (!canDeleteKategori.value || !canEditKategoriId(id)) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk menghapus kategori ini.')
    }
    return withActionLoading('Menghapus fungsi arsip...', async () => {
      const sb = requireSupabase()
      const existing = kategoris.value.find((k) => k.id === id)
      const { error } = await sb.from('kategoris').delete().eq('id', id)
      if (error) throw error
      kategoris.value = kategoris.value.filter((k) => k.id !== id)
      await addActivityLog({
        log_name: 'kategori',
        description: 'deleted',
        subject_type: 'Kategori',
        subject_id: String(id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { old: existing ? { nama: existing.nama, color: existing.color } : {} }
      })
    })
  }

  // CRUD Subjeks
  async function createSubjek(payload: { nama: string; deskripsi?: string | null; color: string }) {
    if (!canCreateSubjek.value) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk membuat subjek.')
    }
    return withActionLoading('Menyimpan subjek arsip...', async () => {
      const sb = requireSupabase()
      const { data, error } = await sb.from('subjeks').insert(payload).select().single()
      if (error) throw error
      const rec = data as SubjekRecord
      subjeks.value.push(rec)
      await addActivityLog({
        log_name: 'subjek',
        description: 'created',
        subject_type: 'Subjek',
        subject_id: String(rec.id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { attributes: payload }
      })
      return rec
    })
  }

  async function updateSubjek(id: number, payload: { nama: string; deskripsi?: string | null; color: string }) {
    if (!canUpdateSubjek.value) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk mengubah subjek.')
    }
    return withActionLoading('Memperbarui subjek arsip...', async () => {
      const sb = requireSupabase()
      const existing = subjeks.value.find((s) => s.id === id)
      const oldData = existing ? { nama: existing.nama, deskripsi: existing.deskripsi, color: existing.color } : {}
      const { data, error } = await sb.from('subjeks').update(payload).eq('id', id).select().single()
      if (error) throw error
      const idx = subjeks.value.findIndex((s) => s.id === id)
      if (idx !== -1) subjeks.value[idx] = data as SubjekRecord
      await addActivityLog({
        log_name: 'subjek',
        description: 'updated',
        subject_type: 'Subjek',
        subject_id: String(id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { old: oldData, attributes: payload }
      })
    })
  }

  async function deleteSubjek(id: number) {
    if (!canDeleteSubjek.value) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk menghapus subjek.')
    }
    return withActionLoading('Menghapus subjek arsip...', async () => {
      const sb = requireSupabase()
      const existing = subjeks.value.find((s) => s.id === id)
      const { error } = await sb.from('subjeks').delete().eq('id', id)
      if (error) throw error
      subjeks.value = subjeks.value.filter((s) => s.id !== id)
      await addActivityLog({
        log_name: 'subjek',
        description: 'deleted',
        subject_type: 'Subjek',
        subject_id: String(id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { old: existing ? { nama: existing.nama, color: existing.color } : {} }
      })
    })
  }

  // CRUD Arsips + Versioning + Soft Delete
  async function createArsip(payload: {
    judul: string
    deskripsi?: string | null
    kategori_id: number | null
    subjek_id?: number | null
    file_path: string
    original_file_name: string
    file_size?: number
    tanggal_arsip?: string
    created_at?: string
  }) {
    if (!canCreateArsip.value || !canEditKategoriId(payload.kategori_id)) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk membuat arsip pada kategori ini.')
    }
    return withActionLoading('Menyimpan dokumen arsip...', async () => {
      const sb = requireSupabase()
      const createdAt = payload.created_at ? new Date(payload.created_at).toISOString() : nowIso()
      const recordToInsert = {
        judul: payload.judul,
        deskripsi: payload.deskripsi || null,
        file_path: payload.file_path,
        original_file_name: payload.original_file_name,
        kategori_id: payload.kategori_id,
        subjek_id: payload.subjek_id || null,
        user_id: currentUser.value?.id || null,
        user_name: currentUser.value?.name || 'Administrator',
        tanggal_arsip: payload.tanggal_arsip || createdAt.slice(0, 10),
        version: 1,
        download_count: 0,
        share_count: 0,
        deleted_at: null,
        created_at: createdAt
      }

      const { data, error } = await sb.from('arsips').insert(recordToInsert).select().single()
      if (error) throw error
      const created = data as ArsipRecord
      arsips.value.unshift(created)

      await addActivityLog({
        log_name: 'arsip',
        description: 'created',
        subject_type: 'Arsip',
        subject_id: String(created.id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: {
          attributes: {
            judul: created.judul,
            kategori_id: created.kategori_id,
            subjek_id: created.subjek_id,
            original_file_name: created.original_file_name,
            tanggal_arsip: created.tanggal_arsip,
            deskripsi: created.deskripsi
          }
        }
      })
      return created
    })
  }

  async function updateArsip(
    id: number,
    payload: {
      judul: string
      deskripsi?: string | null
      kategori_id: number | null
      subjek_id?: number | null
      file_path?: string
      original_file_name?: string | null
      file_size?: number
      tanggal_arsip?: string | null
    }
  ) {
    return withActionLoading('Memperbarui dokumen arsip...', async () => {
      const sb = requireSupabase()
      const idx = arsips.value.findIndex((a) => a.id === id)
      if (idx === -1) throw new Error('Arsip tidak ditemukan.')
      const current = arsips.value[idx]
      if (!canUpdateArsip.value || !canEditKategoriId(current.kategori_id) || !canEditKategoriId(payload.kategori_id)) {
        throw new Error('Akses ditolak: Anda tidak memiliki izin untuk mengubah arsip pada kategori ini.')
      }

      const isDirty =
        current.judul !== payload.judul ||
        (current.deskripsi || null) !== (payload.deskripsi || null) ||
        current.kategori_id !== payload.kategori_id ||
        (current.subjek_id || null) !== (payload.subjek_id || null) ||
        (payload.file_path && payload.file_path !== current.file_path) ||
        (payload.tanggal_arsip && payload.tanggal_arsip !== current.tanggal_arsip)

      if (!isDirty) return current

      const versionSnapshot = {
        arsip_id: current.id,
        version: current.version,
        judul: current.judul,
        deskripsi: current.deskripsi,
        file_path: current.file_path,
        original_file_name: current.original_file_name,
        user_id: currentUser.value?.id || current.user_id,
        user_name: currentUser.value?.name || current.user_name || 'Administrator',
        created_at: current.updated_at || current.created_at
      }

      const nextVersion = current.version + 1
      const updateData = {
        judul: payload.judul,
        deskripsi: payload.deskripsi ?? null,
        kategori_id: payload.kategori_id,
        subjek_id: payload.subjek_id ?? null,
        file_path: payload.file_path || current.file_path,
        original_file_name: payload.original_file_name ?? current.original_file_name,
        tanggal_arsip: payload.tanggal_arsip ?? current.tanggal_arsip,
        version: nextVersion
      }

      const { data: vData } = await sb.from('arsip_versions').insert(versionSnapshot).select().single()
      if (vData) versions.value.unshift(vData as ArsipVersionRecord)
      const { data: aData, error } = await sb.from('arsips').update(updateData).eq('id', id).select().single()
      if (error) throw error
      arsips.value[idx] = aData as ArsipRecord

      await addActivityLog({
        log_name: 'arsip',
        description: 'updated',
        subject_type: 'Arsip',
        subject_id: String(id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: {
          old: {
            judul: current.judul,
            kategori_id: current.kategori_id,
            subjek_id: current.subjek_id,
            original_file_name: current.original_file_name,
            tanggal_arsip: current.tanggal_arsip,
            deskripsi: current.deskripsi
          },
          attributes: {
            judul: updateData.judul,
            kategori_id: updateData.kategori_id,
            subjek_id: updateData.subjek_id,
            original_file_name: updateData.original_file_name,
            tanggal_arsip: updateData.tanggal_arsip,
            deskripsi: updateData.deskripsi
          }
        }
      })
      return arsips.value[idx]
    })
  }

  async function softDeleteArsip(id: number) {
    const idx = arsips.value.findIndex((a) => a.id === id)
    if (idx === -1) return
    if (!canDeleteArsip.value || !canEditKategoriId(arsips.value[idx].kategori_id)) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk menghapus arsip ini.')
    }
    return withActionLoading('Memindahkan arsip ke Trash...', async () => {
      const sb = requireSupabase()
      const currentIdx = arsips.value.findIndex((a) => a.id === id)
      if (currentIdx === -1) return
      const deletedAt = nowIso()
      const { error } = await sb.from('arsips').update({ deleted_at: deletedAt }).eq('id', id)
      if (error) throw error
      arsips.value[currentIdx] = { ...arsips.value[currentIdx], deleted_at: deletedAt }
      await addActivityLog({
        log_name: 'arsip',
        description: 'deleted',
        subject_type: 'Arsip',
        subject_id: String(id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { old: { judul: arsips.value[currentIdx].judul } }
      })
    })
  }

  async function restoreArsip(id: number) {
    const idx = arsips.value.findIndex((a) => a.id === id)
    if (idx === -1) return
    if (!canRestoreArsip.value || !canEditKategoriId(arsips.value[idx].kategori_id)) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk memulihkan arsip ini.')
    }
    return withActionLoading('Memulihkan arsip dari Trash...', async () => {
      const sb = requireSupabase()
      const currentIdx = arsips.value.findIndex((a) => a.id === id)
      if (currentIdx === -1) return
      const { error } = await sb.from('arsips').update({ deleted_at: null }).eq('id', id)
      if (error) throw error
      arsips.value[currentIdx] = { ...arsips.value[currentIdx], deleted_at: null }
      await addActivityLog({
        log_name: 'arsip',
        description: 'restored',
        subject_type: 'Arsip',
        subject_id: String(id),
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { attributes: { judul: arsips.value[currentIdx].judul } }
      })
    })
  }

  async function forceDeleteArsip(id: number) {
    const target = arsips.value.find((a) => a.id === id)
    if (!target) return
    if (!canForceDeleteArsip.value || !canEditKategoriId(target.kategori_id)) {
      throw new Error('Akses ditolak: Anda tidak memiliki izin untuk menghapus permanen arsip ini.')
    }
    return withActionLoading('Menghapus permanen arsip...', async () => {
      const sb = requireSupabase()
      await deleteStoredFile(target.file_path)
      const { error } = await sb.from('arsips').delete().eq('id', id)
      if (error) throw error
      arsips.value = arsips.value.filter((a) => a.id !== id)
      versions.value = versions.value.filter((v) => v.arsip_id !== id)
    })
  }

  async function recordDownload(id: number) {
    const sb = requireSupabase()
    const idx = arsips.value.findIndex((a) => a.id === id)
    if (idx === -1) return
    const nextCount = (arsips.value[idx].download_count || 0) + 1
    arsips.value[idx] = { ...arsips.value[idx], download_count: nextCount }
    await sb.from('arsips').update({ download_count: nextCount }).eq('id', id)
  }

  async function recordShare(id: number) {
    const sb = requireSupabase()
    const idx = arsips.value.findIndex((a) => a.id === id)
    if (idx === -1) return
    const nextCount = (arsips.value[idx].share_count || 0) + 1
    arsips.value[idx] = { ...arsips.value[idx], share_count: nextCount }
    await sb.from('arsips').update({ share_count: nextCount }).eq('id', id)
  }

  async function downloadFile(filePath: string, downloadName?: string | null) {
    const url = getFileUrl(filePath)
    if (!url) return
    const link = document.createElement('a')
    link.href = url
    link.download = downloadName || filePath.split('/').pop() || 'arsip-file'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Users & Roles CRUD
  async function createUser(payload: { name: string; email: string; role: string; password?: string }) {
    if (!isSuperAdmin.value) {
      throw new Error('Akses ditolak: Hanya Super Admin yang memiliki hak akses ini.')
    }
    return withActionLoading('Menambahkan pengguna...', async () => {
      const sb = requireSupabase()
      const normalizedRole = normalizeRole(payload.role || 'writer')
      const cleanEmail = payload.email.trim().toLowerCase()
      const { data, error } = await sb
        .from('profiles')
        .insert({ name: payload.name.trim(), email: cleanEmail, role: normalizedRole })
        .select()
        .single()
      if (error) throw error
      const inserted: ProfileRecord = {
        ...(data as ProfileRecord),
        role: normalizeRole((data as ProfileRecord).role)
      }
      if (payload.password) {
        await saveUserCredential(inserted.id, payload.password)
      }
      users.value.unshift(inserted)
      await addActivityLog({
        log_name: 'user',
        description: 'created',
        subject_type: 'User',
        subject_id: inserted.id,
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { attributes: { name: inserted.name, email: inserted.email, role: inserted.role } }
      })
      return inserted
    })
  }

  async function updateUser(id: string, payload: { name: string; email: string; role: string; password?: string }) {
    if (!isSuperAdmin.value) {
      throw new Error('Akses ditolak: Hanya Super Admin yang memiliki hak akses ini.')
    }
    return withActionLoading('Memperbarui data pengguna...', async () => {
      const sb = requireSupabase()
      const idx = users.value.findIndex((u) => u.id === id)
      if (idx === -1) return
      const normalizedRole = normalizeRole(payload.role)
      const old = { name: users.value[idx].name, email: users.value[idx].email, role: users.value[idx].role }
      const { data, error } = await sb
        .from('profiles')
        .update({ name: payload.name, email: payload.email, role: normalizedRole })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      const updated: ProfileRecord = {
        ...(data as ProfileRecord),
        role: normalizeRole((data as ProfileRecord).role)
      }
      users.value[idx] = updated
      if (payload.password && payload.password.trim()) {
        await saveUserCredential(id, payload.password)
      }
      if (currentUser.value?.id === id) {
        currentUser.value = { ...currentUser.value, ...updated }
      }
      if (normalizedRole === 'superadmin') {
        await saveUserCustomPermissions(id, null)
      } else if (userAclMap.value[id]) {
        await saveUserCustomPermissions(id, userAclMap.value[id])
      }
      await addActivityLog({
        log_name: 'user',
        description: 'updated',
        subject_type: 'User',
        subject_id: id,
        causer_id: currentUser.value?.id || null,
        causer_name: currentUser.value?.name || 'System',
        properties: { old, attributes: { name: payload.name, email: payload.email, role: normalizedRole } }
      })
    })
  }

  async function deleteUser(id: string) {
    if (!isSuperAdmin.value) {
      throw new Error('Akses ditolak: Hanya Super Admin yang memiliki hak akses ini.')
    }
    return withActionLoading('Menghapus pengguna...', async () => {
      const sb = requireSupabase()
      const { error } = await sb.from('profiles').delete().eq('id', id)
      if (error) throw error
      await sb.from('roles').delete().eq('name', `user_acl:${id}`)
      await sb.from('roles').delete().eq('name', `user_cred:${id}`)
      const nextAcl = { ...userAclMap.value }
      delete nextAcl[id]
      userAclMap.value = nextAcl
      const nextCred = { ...userCredMap.value }
      delete nextCred[id]
      userCredMap.value = nextCred
      users.value = users.value.filter((u) => u.id !== id)
    })
  }

  function getUserCustomPermissions(userId: string): string[] | null {
    const entry = userAclMap.value[userId]
    return Array.isArray(entry) ? [...entry] : null
  }

  async function saveUserCustomPermissions(userId: string, permissions: string[] | null) {
    if (!isSuperAdmin.value) {
      throw new Error('Akses ditolak: Hanya Super Admin yang dapat mengatur akses data pengguna.')
    }
    return withActionLoading('Menyimpan hak akses pengguna...', async () => {
      const sb = requireSupabase()
      const targetUser = users.value.find((u) => u.id === userId)
      const targetRole = normalizeRole(targetUser?.role)
      const aclName = `user_acl:${userId}`

      if (targetRole === 'superadmin' || permissions === null) {
        const { error } = await sb.from('roles').delete().eq('name', aclName)
        if (error) throw error
        const nextAcl = { ...userAclMap.value }
        delete nextAcl[userId]
        userAclMap.value = nextAcl
        return null
      }

      const sanitized = sanitizePermissionsForRole(targetRole, permissions)
      const { error } = await sb
        .from('roles')
        .upsert({ name: aclName, permissions: sanitized }, { onConflict: 'name' })
        .select()
        .single()
      if (error) throw error
      userAclMap.value = { ...userAclMap.value, [userId]: sanitized }
      return sanitized
    })
  }

  async function createRole(_payload: { name: string; permissions: string[] }) {
    throw new Error('Konfigurasi sistem dikunci pada 3 role: superadmin, writer, dan viewer.')
  }

  async function updateRole(id: number, payload: { name: string; permissions: string[] }) {
    if (!isSuperAdmin.value) {
      throw new Error('Akses ditolak: Hanya Super Admin yang dapat mengubah konfigurasi role.')
    }
    return withActionLoading('Menyimpan konfigurasi role...', async () => {
      const sb = requireSupabase()
      const idx = roles.value.findIndex((r) => r.id === id)
      if (idx === -1) return
      const targetRole = normalizeRole(roles.value[idx].name)
      const sanitized =
        targetRole === 'superadmin'
          ? [...ALL_PERMISSIONS]
          : sanitizePermissionsForRole(targetRole, payload.permissions)

      const { data, error } =
        id > 0
          ? await sb.from('roles').update({ permissions: sanitized }).eq('id', id).select().single()
          : await sb
              .from('roles')
              .upsert({ name: targetRole, permissions: sanitized }, { onConflict: 'name' })
              .select()
              .single()
      if (error) throw error
      roles.value[idx] = {
        ...(data as RoleRecord),
        name: targetRole,
        permissions: sanitized
      }
    })
  }

  async function deleteRole(_id: number) {
    throw new Error('Konfigurasi sistem dikunci pada 3 role: superadmin, writer, dan viewer.')
  }

  // Settings
  async function updateSettings(payload: {
    name: string
    slogan: string | null
    logo?: string | null
    hero?: { title?: string; subtitle?: string | null; image?: string | null }
  }) {
    if (!isSuperAdmin.value) {
      throw new Error('Akses ditolak: Hanya Super Admin yang dapat mengubah pengaturan instansi.')
    }
    return withActionLoading('Menyimpan pengaturan instansi...', async () => {
      const sb = requireSupabase()
      const nextLogo = payload.logo !== undefined ? payload.logo : settings.value.logo
      const nextHero: HeroConfig = {
        title: payload.hero?.title?.trim() || heroConfig.value.title || DEFAULT_HERO_CONFIG.title,
        subtitle:
          payload.hero?.subtitle !== undefined
            ? payload.hero.subtitle ?? ''
            : heroConfig.value.subtitle,
        image: payload.hero?.image !== undefined ? payload.hero.image : heroConfig.value.image
      }

      const fullPayload: Record<string, any> = {
        name: payload.name,
        slogan: payload.slogan,
        logo: nextLogo
      }
      if (payload.hero) {
        fullPayload.hero_title = nextHero.title
        fullPayload.hero_subtitle = nextHero.subtitle || null
        fullPayload.hero_image = nextHero.image
      }

      let { data, error } = await sb
        .from('settings')
        .update(fullPayload)
        .eq('id', settings.value.id)
        .select()
        .single()

      // Fallback gracefully if hero_* columns haven't been added via SQL Editor yet
      if (error && payload.hero && /hero_|column|schema cache/i.test(error.message || '')) {
        const retry = await sb
          .from('settings')
          .update({
            name: payload.name,
            slogan: payload.slogan,
            logo: nextLogo
          })
          .eq('id', settings.value.id)
          .select()
          .single()
        data = retry.data
        error = retry.error
      }

      if (error) throw error
      settings.value = data as SettingRecord

      if (payload.hero) {
        await sb
          .from('roles')
          .upsert({ name: 'app_config:hero', permissions: [JSON.stringify(nextHero)] }, { onConflict: 'name' })
        heroConfig.value = nextHero
      }
    })
  }

  const companyLogoUrl = computed(() => {
    if (settings.value.logo) {
      return getFileUrl(settings.value.logo) || DEFAULT_PLACEHOLDER_LOGO
    }
    return DEFAULT_PLACEHOLDER_LOGO
  })

  const heroImageUrl = computed(() => {
    if (heroConfig.value.image) {
      return getFileUrl(heroConfig.value.image) || DEFAULT_HERO_IMAGE
    }
    return DEFAULT_HERO_IMAGE
  })

  function getKategori(id?: number | null): KategoriRecord | undefined {
    return kategoris.value.find((k) => k.id === id)
  }

  function getSubjek(id?: number | null): SubjekRecord | undefined {
    return subjeks.value.find((s) => s.id === id)
  }

  function getUserName(arsip: { user_id?: string | null; user_name?: string | null }): string {
    if (arsip.user_id) {
      const u = users.value.find((x) => x.id === arsip.user_id)
      if (u) return u.name
    }
    return arsip.user_name || 'N/A'
  }

  function formatFieldLabel(key: string | number): string {
    const raw = String(key)
    const labelMap: Record<string, string> = {
      judul: 'Judul Arsip',
      kategori_id: 'Kategori (Fungsi)',
      kategori: 'Kategori (Fungsi)',
      subjek_id: 'Subjek',
      subjek: 'Subjek',
      deskripsi: 'Deskripsi',
      original_file_name: 'Nama File',
      file_path: 'Path File',
      tanggal_arsip: 'Tanggal Arsip',
      user_id: 'Pengunggah',
      user_name: 'Pengunggah',
      nama: 'Nama',
      color: 'Warna Badge',
      name: 'Nama Pengguna',
      email: 'Email',
      role: 'Role',
      slogan: 'Slogan',
      version: 'Versi'
    }
    if (labelMap[raw]) return labelMap[raw]
    return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  function formatFieldValue(key: string | number, val: any): string {
    if (val === null || val === undefined || val === '') return '-'
    const k = String(key)
    if (k === 'kategori_id') {
      return getKategori(Number(val))?.nama || String(val)
    }
    if (k === 'subjek_id') {
      return getSubjek(Number(val))?.nama || '-'
    }
    if (k === 'user_id') {
      return users.value.find((u) => u.id === String(val))?.name || String(val)
    }
    return String(val)
  }

  function getActivitySubjectName(log: ActivityLogRecord): string {
    const attr = log.properties?.attributes || {}
    const old = log.properties?.old || {}
    let resolved =
      attr.judul ||
      old.judul ||
      attr.nama ||
      old.nama ||
      attr.name ||
      old.name ||
      ''

    if (!resolved && log.subject_id) {
      const sid = String(log.subject_id)
      if (log.subject_type === 'Arsip') {
        resolved = arsips.value.find((a) => String(a.id) === sid)?.judul || ''
      } else if (log.subject_type === 'Kategori') {
        resolved = kategoris.value.find((k) => String(k.id) === sid)?.nama || ''
      } else if (log.subject_type === 'Subjek') {
        resolved = subjeks.value.find((s) => String(s.id) === sid)?.nama || ''
      } else if (log.subject_type === 'User') {
        resolved = users.value.find((u) => String(u.id) === sid)?.name || ''
      }
    }

    if (resolved) {
      return log.subject_type ? `${log.subject_type}: ${resolved}` : String(resolved)
    }
    return `${log.subject_type || '-'}${log.subject_id ? ` #${log.subject_id}` : ''}`
  }

  return {
    isSupabase,
    loading,
    initialized,
    currentUser,
    roles,
    userAclMap,
    users,
    kategoris,
    subjeks,
    arsips,
    activeArsips,
    trashedArsips,
    versions,
    activityLogs,
    settings,
    companyLogoUrl,
    heroConfig,
    heroImageUrl,
    userRole,
    isSuperAdmin,
    isWriter,
    isViewer,
    canWrite,
    effectivePermissions,
    hasPermission,
    canCreateArsip,
    canUpdateArsip,
    canDeleteArsip,
    canRestoreArsip,
    canForceDeleteArsip,
    canCreateKategori,
    canUpdateKategori,
    canDeleteKategori,
    canManageKategori,
    canCreateSubjek,
    canUpdateSubjek,
    canDeleteSubjek,
    canManageSubjek,
    allowedViewKategoriIds,
    allowedEditKategoriIds,
    canViewKategoriId,
    canEditKategoriId,
    canEditArsipRecord,
    canDeleteArsipRecord,
    visibleKategoris,
    editableKategoris,
    canAccessPath,
    loadPublicSettings,
    init,
    login,
    registerDemoOrSupabase,
    logout,
    updateProfile,
    updatePassword,
    uploadFile,
    getFileUrl,
    getFileSize,
    deleteStoredFile,
    downloadFile,
    createKategori,
    updateKategori,
    deleteKategori,
    createSubjek,
    updateSubjek,
    deleteSubjek,
    createArsip,
    updateArsip,
    softDeleteArsip,
    restoreArsip,
    forceDeleteArsip,
    recordDownload,
    recordShare,
    createUser,
    updateUser,
    deleteUser,
    getUserCustomPermissions,
    saveUserCustomPermissions,
    createRole,
    updateRole,
    deleteRole,
    updateSettings,
    getKategori,
    getSubjek,
    getUserName,
    formatFieldLabel,
    formatFieldValue,
    getActivitySubjectName,
    confirmModalState,
    confirmDialog,
    resolveConfirmDialog,
    actionLoading,
    actionLoadingText,
    withActionLoading
  }
}
