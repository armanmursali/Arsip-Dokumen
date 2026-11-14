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
  'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/company-logo-design-template-e089327a5c476ce5c70c74f7359c5898_screen.jpg?ts=1672291305'

const PENDING_USER_STORAGE_KEY = 'digital_arsip_supabase_pending_user'

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

export function computeBadgeStyle(hex?: string | null): {
  backgroundColor: string
  color: string
  borderColor: string
  borderWidth: string
  borderStyle: string
} {
  let clean = (hex || '').replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
  }
  if (clean.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(clean)) {
    clean = '64748b'
  }
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  const textR = luminance > 0.62 ? Math.round(r * 0.52) : r
  const textG = luminance > 0.62 ? Math.round(g * 0.52) : g
  const textB = luminance > 0.62 ? Math.round(b * 0.52) : b

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
    color: `rgb(${textR}, ${textG}, ${textB})`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.28)`,
    borderWidth: '1px',
    borderStyle: 'solid',
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

export function useArsipApp() {
  const supabase = useSupabaseClient()
  const isSupabase = computed(() => Boolean(supabase))

  const initialized = useState<boolean>('arsip_initialized', () => false)
  const loading = useState<boolean>('arsip_loading', () => false)
  const currentUser = useState<ProfileRecord | null>('arsip_current_user', () => null)
  const roles = useState<RoleRecord[]>('arsip_roles', () => [])
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
          ? (profileData as ProfileRecord)
          : {
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              role: authUser.user_metadata?.role || 'operator',
              created_at: authUser.created_at,
              updated_at: authUser.created_at
            }
        localStorage.removeItem(PENDING_USER_STORAGE_KEY)
      } else {
        const savedPending = localStorage.getItem(PENDING_USER_STORAGE_KEY)
        currentUser.value = savedPending ? (JSON.parse(savedPending) as ProfileRecord) : null
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
      users.value = (uRes.data || []) as ProfileRecord[]
      roles.value = (rRes.data || []) as RoleRecord[]
      if (setRes.data) {
        settings.value = setRes.data as SettingRecord
      }
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  // Auth helpers
  async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const sb = requireSupabase()
    await init()
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PENDING_USER_STORAGE_KEY)
    }
    if (data.user) {
      await init(true)
    }
    return { ok: true }
  }

  async function registerDemoOrSupabase(name: string, email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const sb = requireSupabase()
    await init()
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'operator' } }
    })
    if (error) return { ok: false, error: error.message }
    if (data.user && !data.session) {
      const pendingProfile: ProfileRecord = {
        id: data.user.id,
        name: name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || email,
        role: 'operator',
        created_at: data.user.created_at || nowIso(),
        updated_at: data.user.created_at || nowIso()
      }
      currentUser.value = pendingProfile
      if (typeof window !== 'undefined') {
        localStorage.setItem(PENDING_USER_STORAGE_KEY, JSON.stringify(pendingProfile))
      }
      await init(true)
      return { ok: true }
    }
    await init(true)
    return { ok: true }
  }

  async function logout() {
    const sb = requireSupabase()
    await sb.auth.signOut()
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PENDING_USER_STORAGE_KEY)
    }
    currentUser.value = null
  }

  async function updateProfile(payload: { name: string; email: string }) {
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
  }

  async function updatePassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
    if (!currentUser.value) return { ok: false, error: 'Tidak ada sesi pengguna.' }
    const sb = requireSupabase()
    const { error } = await sb.auth.updateUser({ password: newPassword })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }

  // Storage helpers
  async function uploadFile(
    file: File | Blob,
    originalName: string,
    bucket: 'arsip' | 'settings' = 'arsip',
    folder = 'arsip'
  ): Promise<{ path: string; original_file_name: string; size: number }> {
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

  // Computed active vs trashed arsips
  const activeArsips = computed(() => arsips.value.filter((a) => !a.deleted_at))
  const trashedArsips = computed(() => arsips.value.filter((a) => Boolean(a.deleted_at)))

  // CRUD Kategoris
  async function createKategori(payload: { nama: string; deskripsi?: string | null; color: string }) {
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
  }

  async function updateKategori(id: number, payload: { nama: string; deskripsi?: string | null; color: string }) {
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
  }

  async function deleteKategori(id: number) {
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
  }

  // CRUD Subjeks
  async function createSubjek(payload: { nama: string; deskripsi?: string | null; color: string }) {
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
  }

  async function updateSubjek(id: number, payload: { nama: string; deskripsi?: string | null; color: string }) {
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
  }

  async function deleteSubjek(id: number) {
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
    const sb = requireSupabase()
    const idx = arsips.value.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Arsip tidak ditemukan.')
    const current = arsips.value[idx]

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
  }

  async function softDeleteArsip(id: number) {
    const sb = requireSupabase()
    const idx = arsips.value.findIndex((a) => a.id === id)
    if (idx === -1) return
    const deletedAt = nowIso()
    const { error } = await sb.from('arsips').update({ deleted_at: deletedAt }).eq('id', id)
    if (error) throw error
    arsips.value[idx] = { ...arsips.value[idx], deleted_at: deletedAt }
    await addActivityLog({
      log_name: 'arsip',
      description: 'deleted',
      subject_type: 'Arsip',
      subject_id: String(id),
      causer_id: currentUser.value?.id || null,
      causer_name: currentUser.value?.name || 'System',
      properties: { old: { judul: arsips.value[idx].judul } }
    })
  }

  async function restoreArsip(id: number) {
    const sb = requireSupabase()
    const idx = arsips.value.findIndex((a) => a.id === id)
    if (idx === -1) return
    const { error } = await sb.from('arsips').update({ deleted_at: null }).eq('id', id)
    if (error) throw error
    arsips.value[idx] = { ...arsips.value[idx], deleted_at: null }
    await addActivityLog({
      log_name: 'arsip',
      description: 'restored',
      subject_type: 'Arsip',
      subject_id: String(id),
      causer_id: currentUser.value?.id || null,
      causer_name: currentUser.value?.name || 'System',
      properties: { attributes: { judul: arsips.value[idx].judul } }
    })
  }

  async function forceDeleteArsip(id: number) {
    const sb = requireSupabase()
    const target = arsips.value.find((a) => a.id === id)
    if (!target) return
    await deleteStoredFile(target.file_path)
    const { error } = await sb.from('arsips').delete().eq('id', id)
    if (error) throw error
    arsips.value = arsips.value.filter((a) => a.id !== id)
    versions.value = versions.value.filter((v) => v.arsip_id !== id)
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
    const sb = requireSupabase()
    const { data, error } = await sb
      .from('profiles')
      .insert({ name: payload.name, email: payload.email, role: payload.role || 'operator' })
      .select()
      .single()
    if (error) throw error
    const inserted = data as ProfileRecord
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
  }

  async function updateUser(id: string, payload: { name: string; email: string; role: string; password?: string }) {
    const sb = requireSupabase()
    const idx = users.value.findIndex((u) => u.id === id)
    if (idx === -1) return
    const old = { name: users.value[idx].name, email: users.value[idx].email, role: users.value[idx].role }
    const { data, error } = await sb
      .from('profiles')
      .update({ name: payload.name, email: payload.email, role: payload.role })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    users.value[idx] = data as ProfileRecord
    await addActivityLog({
      log_name: 'user',
      description: 'updated',
      subject_type: 'User',
      subject_id: id,
      causer_id: currentUser.value?.id || null,
      causer_name: currentUser.value?.name || 'System',
      properties: { old, attributes: { name: payload.name, email: payload.email, role: payload.role } }
    })
  }

  async function deleteUser(id: string) {
    const sb = requireSupabase()
    const { error } = await sb.from('profiles').delete().eq('id', id)
    if (error) throw error
    users.value = users.value.filter((u) => u.id !== id)
  }

  async function createRole(payload: { name: string; permissions: string[] }) {
    const sb = requireSupabase()
    const { data, error } = await sb.from('roles').insert(payload).select().single()
    if (error) throw error
    roles.value.push(data as RoleRecord)
    return data as RoleRecord
  }

  async function updateRole(id: number, payload: { name: string; permissions: string[] }) {
    const sb = requireSupabase()
    const idx = roles.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    const { data, error } = await sb.from('roles').update(payload).eq('id', id).select().single()
    if (error) throw error
    roles.value[idx] = data as RoleRecord
  }

  async function deleteRole(id: number) {
    const sb = requireSupabase()
    const { error } = await sb.from('roles').delete().eq('id', id)
    if (error) throw error
    roles.value = roles.value.filter((r) => r.id !== id)
  }

  // Settings
  async function updateSettings(payload: { name: string; slogan: string | null; logo?: string | null }) {
    const sb = requireSupabase()
    const { data, error } = await sb
      .from('settings')
      .update({
        name: payload.name,
        slogan: payload.slogan,
        logo: payload.logo !== undefined ? payload.logo : settings.value.logo
      })
      .eq('id', settings.value.id)
      .select()
      .single()
    if (error) throw error
    settings.value = data as SettingRecord
  }

  const companyLogoUrl = computed(() => {
    if (settings.value.logo) {
      return getFileUrl(settings.value.logo) || DEFAULT_PLACEHOLDER_LOGO
    }
    return DEFAULT_PLACEHOLDER_LOGO
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
    createRole,
    updateRole,
    deleteRole,
    updateSettings,
    getKategori,
    getSubjek,
    getUserName,
    formatFieldLabel,
    formatFieldValue,
    getActivitySubjectName
  }
}
