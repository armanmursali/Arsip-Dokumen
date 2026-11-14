-- ============================================================================
-- Digital Arsip - Supabase PostgreSQL Schema & Seeder
-- Porting dari Laravel 10 + Filament 3 ke Nuxt 3 + Supabase
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Roles
CREATE TABLE IF NOT EXISTS public.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'superadmin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Kategoris (Fungsi Arsip)
CREATE TABLE IF NOT EXISTS public.kategoris (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    color VARCHAR(20) NOT NULL DEFAULT '#F97316',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Subjeks (Subjek Arsip)
CREATE TABLE IF NOT EXISTS public.subjeks (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    color VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Arsips (Arsip Utama + Soft Deletes + Versioning + Stats)
CREATE TABLE IF NOT EXISTS public.arsips (
    id BIGSERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    file_path TEXT NOT NULL,
    original_file_name VARCHAR(255),
    kategori_id BIGINT REFERENCES public.kategoris(id) ON DELETE SET NULL,
    subjek_id BIGINT REFERENCES public.subjeks(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    tanggal_arsip DATE DEFAULT CURRENT_DATE,
    version INT NOT NULL DEFAULT 1,
    download_count INT NOT NULL DEFAULT 0,
    share_count INT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Arsip Versions (Riwayat Versi Dokumen)
CREATE TABLE IF NOT EXISTS public.arsip_versions (
    id BIGSERIAL PRIMARY KEY,
    arsip_id BIGINT NOT NULL REFERENCES public.arsips(id) ON DELETE CASCADE,
    version INT NOT NULL,
    judul VARCHAR(255),
    deskripsi TEXT,
    file_path TEXT,
    original_file_name VARCHAR(255),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Pictures (Temporary / Photo Capture Records)
CREATE TABLE IF NOT EXISTS public.pictures (
    id BIGSERIAL PRIMARY KEY,
    arsip_id BIGINT REFERENCES public.arsips(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Settings (Profil Perusahaan / Aplikasi & Hero)
CREATE TABLE IF NOT EXISTS public.settings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slogan TEXT,
    logo TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pastikan kolom Hero tersedia jika tabel settings sudah dibuat sebelumnya
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_title TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_image TEXT;

-- 9. Activity Logs (Audit Trail ala spatie/laravel-activitylog)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id BIGSERIAL PRIMARY KEY,
    log_name VARCHAR(100),
    description VARCHAR(100) NOT NULL,
    subject_type VARCHAR(100),
    subject_id VARCHAR(64),
    causer_id VARCHAR(64),
    causer_name VARCHAR(255),
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_arsips_kategori_id ON public.arsips(kategori_id);
CREATE INDEX IF NOT EXISTS idx_arsips_subjek_id ON public.arsips(subjek_id);
CREATE INDEX IF NOT EXISTS idx_arsips_deleted_at ON public.arsips(deleted_at);
CREATE INDEX IF NOT EXISTS idx_arsips_created_at ON public.arsips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_arsip_versions_arsip_id ON public.arsip_versions(arsip_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_subject ON public.activity_logs(subject_type, subject_id, created_at DESC);

-- Auto-update updated_at timestamp helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_kategoris_updated_at ON public.kategoris;
CREATE TRIGGER trg_kategoris_updated_at
    BEFORE UPDATE ON public.kategoris
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_subjeks_updated_at ON public.subjeks;
CREATE TRIGGER trg_subjeks_updated_at
    BEFORE UPDATE ON public.subjeks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_arsips_updated_at ON public.arsips;
CREATE TRIGGER trg_arsips_updated_at
    BEFORE UPDATE ON public.arsips
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated_at ON public.settings;
CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Sync Supabase Auth signup -> public.profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
    )
    ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Auto-confirm existing unconfirmed auth.users if run in Supabase SQL Editor
UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()) WHERE email_confirmed_at IS NULL;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arsips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arsip_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pictures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for anon and authenticated users (refine per role in production if needed)
DROP POLICY IF EXISTS "Authenticated read/write roles" ON public.roles;
CREATE POLICY "Authenticated read/write roles" ON public.roles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read/write profiles" ON public.profiles;
CREATE POLICY "Authenticated read/write profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read/write kategoris" ON public.kategoris;
CREATE POLICY "Authenticated read/write kategoris" ON public.kategoris FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read/write subjeks" ON public.subjeks;
CREATE POLICY "Authenticated read/write subjeks" ON public.subjeks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read/write arsips" ON public.arsips;
CREATE POLICY "Authenticated read/write arsips" ON public.arsips FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read/write arsip_versions" ON public.arsip_versions;
CREATE POLICY "Authenticated read/write arsip_versions" ON public.arsip_versions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read/write pictures" ON public.pictures;
CREATE POLICY "Authenticated read/write pictures" ON public.pictures FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated write settings" ON public.settings;
CREATE POLICY "Authenticated write settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read/write activity_logs" ON public.activity_logs;
CREATE POLICY "Authenticated read/write activity_logs" ON public.activity_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- Supabase Storage Buckets & Policies
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('arsip', 'arsip', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Arsip & Settings" ON storage.objects;
CREATE POLICY "Public Read Arsip & Settings"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('arsip', 'settings'));

DROP POLICY IF EXISTS "Authenticated Upload Arsip & Settings" ON storage.objects;
CREATE POLICY "Authenticated Upload Arsip & Settings"
    ON storage.objects FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id IN ('arsip', 'settings'));

DROP POLICY IF EXISTS "Authenticated Update Arsip & Settings" ON storage.objects;
CREATE POLICY "Authenticated Update Arsip & Settings"
    ON storage.objects FOR UPDATE TO anon, authenticated
    USING (bucket_id IN ('arsip', 'settings'));

DROP POLICY IF EXISTS "Authenticated Delete Arsip & Settings" ON storage.objects;
CREATE POLICY "Authenticated Delete Arsip & Settings"
    ON storage.objects FOR DELETE TO anon, authenticated
    USING (bucket_id IN ('arsip', 'settings'));

-- ============================================================================
-- Seed Data (Persis seperti KategoriSeeder, SubjekSeeder, Roles & Settings)
-- ============================================================================

-- Roles (Standardized 3 roles: superadmin, writer, viewer; preserve user_acl/user_cred/app_config)
DELETE FROM public.roles
WHERE name NOT IN ('superadmin', 'writer', 'viewer')
  AND name NOT LIKE 'user_acl:%'
  AND name NOT LIKE 'user_cred:%'
  AND name NOT LIKE 'app_config:%';

INSERT INTO public.roles (name, permissions) VALUES
    ('superadmin', '["view_any_arsip","view_arsip","create_arsip","update_arsip","delete_arsip","restore_arsip","force_delete_arsip","view_any_kategori","create_kategori","update_kategori","delete_kategori","view_any_subjek","create_subjek","update_subjek","delete_subjek","view_any_user","create_user","update_user","delete_user","view_any_role","create_role","update_role","delete_role","view_audit_trail","manage_settings"]'::jsonb),
    ('writer', '["view_any_arsip","view_arsip","create_arsip","update_arsip","delete_arsip","restore_arsip","force_delete_arsip","view_any_kategori","create_kategori","update_kategori","delete_kategori","view_any_subjek","create_subjek","update_subjek","delete_subjek"]'::jsonb),
    ('viewer', '["view_any_arsip","view_arsip","view_any_kategori","view_any_subjek"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;

-- Kategoris (Fungsi Arsip - KategoriSeeder.php)
INSERT INTO public.kategoris (nama, color, deskripsi)
SELECT v.nama, v.color, v.deskripsi
FROM (VALUES
    ('Surat Masuk', '#0EA5A4', 'Arsip surat-surat masuk instansi atau perusahaan.'),
    ('Surat Keluar', '#2563EB', 'Arsip surat keluar resmi yang diterbitkan.'),
    ('Laporan', '#7C3AED', 'Laporan berkala, laporan kegiatan, dan evaluasi.'),
    ('Notulen / Risalah', '#F97316', 'Catatan hasil rapat dan risalah pertemuan.'),
    ('Kontrak', '#DC2626', 'Dokumen kontrak kerja sama dan perjanjian.'),
    ('SOP / Prosedur', '#059669', 'Standar Operasional Prosedur dan panduan kerja.'),
    ('Keuangan', '#0B7A75', 'Dokumen keuangan, anggaran, dan transaksi.'),
    ('Personalia / SDM', '#EA580C', 'Dokumen kepegawaian dan sumber daya manusia.'),
    ('Proyek', '#7F1D1D', 'Dokumen administrasi dan teknis proyek.'),
    ('Presentasi / Materi', '#0F172A', 'Slide presentasi, materi pelatihan, dan paparan.')
) AS v(nama, color, deskripsi)
WHERE NOT EXISTS (SELECT 1 FROM public.kategoris k WHERE k.nama = v.nama);

-- Subjeks (SubjekSeeder.php)
INSERT INTO public.subjeks (nama, color, deskripsi)
SELECT v.nama, v.color, v.deskripsi
FROM (VALUES
    ('Administrasi Umum', '#0EA5A4', 'Dokumen administrasi umum seperti surat-menyurat, nota, memo.'),
    ('Keuangan', '#2563EB', 'Laporan keuangan, bukti pembayaran, invoice, kuitansi.'),
    ('Sumber Daya Manusia', '#7C3AED', 'Data karyawan, kontrak kerja, absensi, cuti.'),
    ('Hukum', '#DC2626', 'Perjanjian, kontrak, dokumen legal dan litigasi.'),
    ('Operasional', '#059669', 'Prosedur operasional, laporan operasional harian.'),
    ('IT & Infrastruktur', '#0B7A75', 'Dokumen teknis, spesifikasi, konfigurasi, tiket.'),
    ('Pengadaan / Logistik', '#EA580C', 'PO, kontrak vendor, faktur pembelian.'),
    ('Pemasaran & Komunikasi', '#F97316', 'Materi promosi, press release, kampanye marketing.'),
    ('Proyek', '#7F1D1D', 'Dokumen proyek, rencana, milestone, laporan progres.'),
    ('Audit & Kepatuhan', '#0F172A', 'Laporan audit, checklist kepatuhan, sertifikat.')
) AS v(nama, color, deskripsi)
WHERE NOT EXISTS (SELECT 1 FROM public.subjeks s WHERE s.nama = v.nama);

-- Settings (Default Company Profile)
INSERT INTO public.settings (name, slogan, logo)
SELECT 'PT. Tomo Teknologi Sinergi', 'Membangun Era Digital Indonesia', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

