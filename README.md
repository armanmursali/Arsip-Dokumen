# Nuxt Digital Arsip (Nuxt 3 + Tailwind CSS + Supabase)

Porting penuh dari aplikasi **Digital Arsip** (Laravel 10 + Filament 3) ke ekosistem **Nuxt 3 + Vue 3 + Tailwind CSS + Supabase**.

## Fitur Utama

- **Dual-Mode Otomatis:**
  - **Mode Supabase (Production):** Terhubung langsung ke PostgreSQL, Auth, dan Storage Supabase saat `NUXT_PUBLIC_SUPABASE_URL` & `NUXT_PUBLIC_SUPABASE_ANON_KEY` diisi di `.env`.
  - **Mode Lokal / Demo:** Jika `.env` Supabase belum diisi, aplikasi otomatis berjalan menggunakan `LocalStorage` dengan data awal persis seperti `KategoriSeeder.php`, `SubjekSeeder.php`, dan sampel `Arsip` sehingga bisa langsung dicoba.
- **Dashboard & Analytics:** Company Profile Widget, Stats Overview (dengan delta bulanan & sparkline 8 bulan), Bar Chart arsip per bulan, Doughnut Chart tipe dokumen & kategori, dan tabel Aktivitas Upload Pengguna.
- **Manajemen Arsip + Riwayat Versi + Soft Delete (Trash):**
  - CRUD lengkap dengan badge warna otomatis (*luminance check*).
  - Pratinjau file langsung di browser (`.pdf`, gambar, `.mp4`, `.txt`/`.md`, serta tabel `.xlsx`/`.xls` via SheetJS).
  - Bagikan tautan arsip dengan **QR Code** dan penghitung *download_count* / *share_count*.
  - Pembuatan snapshot versi otomatis (`arsip_versions`) saat arsip diedit.
  - Halaman **Trash Arsip** dengan Restore & Permanent Delete.
- **Picture to PDF:** Mengambil foto langsung dari kamera browser (atau memilih beberapa gambar) lalu menggabungkannya menjadi 1 file PDF A4 Portrait dengan `jsPDF` dan mengarsipkannya otomatis.
- **Metadata & Export Excel:** Tabel metadata dengan filter lengkap dan tombol **Export Excel (.xlsx)**.
- **Users, Roles, Audit Trails, Settings & Petunjuk Penggunaan.**

---

## Cara Menjalankan Langsung (Mode Lokal / Demo)

```bash
cd nuxt-digital-arsip
npm install
npm run dev
```

Buka `http://localhost:3000` di browser, lalu klik **Dashboard** dan pilih tombol **Login Cepat** (`admin@digitalarsip.test` / `password`).

---

## Cara Menghubungkan ke Supabase

1. Buat proyek baru di [Supabase](https://supabase.com/).
2. Buka **SQL Editor** di dashboard Supabase Anda, lalu salin dan jalankan seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql). Script ini otomatis membuat:
   - Semua tabel (`roles`, `profiles`, `kategoris`, `subjeks`, `arsips`, `arsip_versions`, `pictures`, `settings`, `activity_logs`)
   - Row Level Security (RLS) policies
   - Bucket Storage (`arsip` dan `settings`)
   - Data seeder awal (10 Fungsi Arsip, 10 Subjek Arsip, 4 Roles, dan Settings default)
3. Salin `.env.example` menjadi `.env` dan isi kredensial Supabase Anda:
   ```env
   NUXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. Jalankan ulang `npm run dev`. Badge di pojok kanan atas dashboard akan berubah menjadi **Supabase Connected**.

