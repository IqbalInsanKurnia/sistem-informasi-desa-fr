## Sistem Informasi Desa – Frontend (Vite + React)

Antarmuka web modern untuk layanan publik desa: publikasi artikel, profil desa, peta potensi/fasilitas, infografis APBDesa & IDM, pengajuan surat online, hingga panel admin lengkap. Dibangun sebagai PWA ringan dengan UX yang familier dan performa cepat.

[Lihat Backend (Laravel)](https://github.com/aqilamuzafa917/Sistem-Informasi-Desa-Backend)

![Made with Vite](https://img.shields.io/badge/Vite-6-blueviolet?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19_RC-61DAFB?logo=react&logoColor=061a23)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

### Cuplikan Layar

Tambahkan tangkapan layar ke folder `docs/images/`.

- Beranda — ![Home](docs/images/home.png)
- Peta/POI — ![Map](docs/images/map.png)
- Panel Admin — ![Admin](docs/images/admin.png)

## Fitur Utama

- Publik: Beranda, Artikel, Profil Desa, Peta Potensi/Fasilitas, Infografis APBDesa & IDM, Pengajuan Surat, Cek Status, Chatbot
- Admin: Dashboard, Surat (CRUD, verifikasi, unduh PDF), Artikel (CRUD, verifikasi), Pengaduan (verifikasi), Penduduk (CRUD, pencarian), APBDesa (pendapatan/belanja, ringkasan), Profil Desa (konten + geometri), Peta/POI, User & Config
- PWA: service worker, dynamic favicon/title/manifest, install prompt
- Data realtime: React Query untuk cache/fetch, React Router untuk navigasi
- Visual: Peta Leaflet/React-Leaflet, grafik Recharts

### Dampak Singkat

- Efisiensi layanan: pengajuan surat online, dokumen siap cetak (PDF backend)
- Transparansi: infografis APBDesa/IDM mudah dipahami
- Partisipasi: pengaduan dan artikel memperkuat komunikasi
- Data-driven: statistik penduduk/APBDesa/IDM bantu perencanaan
- Hemat biaya: PWA tanpa store, UI modern meminimalkan pelatihan

## Arsitektur Singkat

- Frontend SPA berbasis React + Vite, state query dengan `@tanstack/react-query`
- Integrasi ke Backend Laravel melalui REST API dengan `axios` (base URL dari `.env`)
- Proteksi rute admin menggunakan `ProtectedRoute` dengan Bearer token
- PWA untuk instalasi seperti aplikasi dan pengalaman offline dasar

## Teknologi

- Vite 6, React 19 RC, React Router 7, TypeScript
- Tailwind CSS 4, Prettier + `prettier-plugin-tailwindcss`
- Flowbite React, Radix UI, Lucide Icons
- Axios, `@tanstack/react-query` v5
- Leaflet/React-Leaflet, Recharts
- TipTap (editor konten)

## Prasyarat

- Node.js 20+ dan npm 10+
- Backend berjalan (Laravel 12). Lihat repo: [Sistem-Informasi-Desa-Backend](https://github.com/aqilamuzafa917/Sistem-Informasi-Desa-Backend)

## Quickstart

1) Install dependency

```bash
npm install
```

2) Buat file `.env` di root proyek

```env
VITE_API_URL=http://localhost:8000
```

3) Jalankan aplikasi dev

```bash
npm run dev
```

Dev server tersedia di `http://localhost:5173` (HMR aktif).

Catatan: dependency Flowbite akan otomatis dipatch via script `postinstall`.

## Konfigurasi Lingkungan

- `VITE_API_URL` dipakai sebagai `baseURL` axios, lihat `src/config/api.ts`
- Jika backend menggunakan prefix `api` (default Laravel), Anda bisa memakai `http://localhost:8000` dan tiap service menambahkan pathnya; atau set langsung ke `http://localhost:8000/api`
- Untuk tunneling (ngrok/localhost.run), header `ngrok-skip-browser-warning` sudah diset di `API_CONFIG`

## Skrip NPM

- `dev`: jalankan server dev Vite
- `build`: typecheck + build produksi
- `preview`: preview hasil build produksi
- `lint`: jalankan ESLint
- `format`: format file dengan Prettier
- `format:check`: cek format tanpa mengubah file

## Struktur Proyek

```
src/
  app/
  components/              # Komponen UI: navbar, footer, form, infografis, peta, dsb.
  config/api.ts            # Konfigurasi baseURL axios (VITE_API_URL)
  constants/               # Konstanta (jenis surat, dsb.)
  contexts/                # Context React (Desa, HomePage, User)
  hooks/                   # Hooks (React Query hooks, penduduk, dll.)
  lib/react-query.ts       # Inisialisasi QueryClient
  pages/                   # Halaman publik & admin
  services/                # Util service/API (opsional)
  styles/                  # Style tambahan
  types/                   # Tipe TypeScript
  utils/                   # Utilities (formatter, dsb.)
```

Beberapa halaman (di `src/pages`): `DashboardPage.tsx`, `SuratPage/*`, `ArtikelPage/*`, `PengaduanPage/*`, `PendudukPage/*`, `APBDesaPage/*`, `InfografisPage/*`, `PetaPage/*`, `ProfilPage/*`, `UserPage/*`, `HomePage.tsx`, `ArtikelDesa.tsx`, `ArtikelDetailPage.tsx`, `PengajuanSuratPage.tsx`, `CekStatusSuratPage.tsx`.

## Integrasi Backend

- Daftar endpoint lengkap ada di backend `README.md` di repo [Sistem-Informasi-Desa-Backend](https://github.com/aqilamuzafa917/Sistem-Informasi-Desa-Backend)
- Autentikasi admin: Bearer token dari endpoint login backend (Sanctum)
- Pastikan CORS dan domain stateful Sanctum dikonfigurasi saat frontend di domain/port berbeda (`http://localhost:5173`)

Contoh pengaturan CORS di backend `.env`:

```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Keamanan & Kepatuhan (Frontend)

- Proteksi rute admin via `ProtectedRoute` + Bearer token
- Validasi form dengan `react-hook-form` + `zod`
- Kesesuaian CORS/Sanctum dikelola di backend; frontend mematuhi domain yang diizinkan

## PWA

- Service worker: `public/service-worker.js`, registrasi di `src/main.tsx`
- Komponen pendukung: `DynamicManifest`, `DynamicFavicon`, `DynamicTitle`, `InstallPWA`

## Build & Deploy

```bash
npm run build
npm run preview # opsional
```

Output di folder `dist/`. Deploy ke hosting statik (Nginx, Apache, Netlify, Vercel). Pastikan rewrite SPA mengarahkan semua rute ke `index.html` jika memakai mode history React Router.

## Troubleshooting

- 401/419 rute admin: pastikan Bearer token dikirim dan konfigurasi Sanctum/CORS benar
- CORS error: cek `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, `CORS_ALLOWED_ORIGINS` di backend `.env` dan `VITE_API_URL` di frontend `.env`
- Peta tidak muncul: pastikan CSS Leaflet termuat, koneksi tiles tidak diblokir, kontainer memiliki tinggi
- Build gagal terkait tipe `next`/`@types/next`: update Node/npm dan jalankan ulang `npm install`

## Kontribusi

Kontribusi sangat diterima. Silakan buka Issue atau Pull Request.

Langkah umum:
1. Fork repo ini
2. Buat branch fitur: `git checkout -b feature/awesome`
3. Commit perubahan: `git commit -m "feat: add awesome"`
4. Push branch: `git push origin feature/awesome`
5. Buka Pull Request

## Lisensi

MIT. Lihat file `LICENSE`.