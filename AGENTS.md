# AGENTS.md - C.A.F.E. Job Portal

## Quick Commands

```bash
composer setup          # install deps → copy .env → key:gen → migrate → npm i → npm run build
composer dev            # serve + queue:listen + pail + vite (concurrently, 4 panes)
composer test           # config:clear → php artisan test
php artisan test --filter=RecruitmentFlowTest
php artisan test --filter=test_full_recruitment_flow
vendor/bin/pint         # Laravel Pint (PSR-12 code style)
docker compose up -d    # app:8083, db:3306, reverb:8080
```

## Stack

**Laravel 12** (PHP 8.2+) + **React 19** (Vite 7) + Tailwind CSS 4 + MySQL  
**Auth**: JWT via `php-open-source-saver/jwt-auth` (guard: `api`)  
**Realtime**: Laravel Reverb (WebSocket)  
**Notify**: Firebase Cloud Messaging + SMTP Mail (`smtp.gmail.com`)  
**Formatters**: Laravel Pint, EditorConfig (4-space indent, LF)

## Backend Layout

```
app/
├── Http/Controllers/Api/V1/{Auth,Pelamar,Admin,SuperAdmin}/
├── Models/                     # Eloquent, Indonesian naming (Pengguna, Lowongan, etc.)
├── Services/                   # V1/{Auth,Admin}/ + NotifikasiService.php (root)
├── Repositories/V1/{Admin,SuperAdmin}/ + PenggunaRepository, NotifikasiRepository
├── Events/ + Listeners/ + Notifications/
├── Traits/ApiResponse.php
└── Http/Middleware/{CheckRole,CheckAccountStatus,CheckRolePelamar}.php
```

`PenggunaRepository` is registered as singleton in `AppServiceProvider`.

## Frontend Layout

```
resources/js/src/
├── halaman/            # beranda, lowongan, perusahaan, profil, status_lamaran, melamar
├── admin-perusahaan/   # Dashboard, profil, pelamar, lowongan, wawancara
├── super-admin/        # Dashboard, masuk, verifikasi, kelola-akun
├── layanan/            # api.js (axios), firebase.js, layanan{Autentikasi,Lamaran,etc}.js
├── pengait/            # Custom hooks (gunakanAutentikasi, etc.)
├── komponen/ + tata-letak/  # Shared components & layouts
└── ruter/              # react-router-dom setup
```

## Conventions

**Frontend**: Indonesian naming (`layanan/masuk()`, `pengait/gunakanAutentikasi()`, `tata-letak/`).

**Backend Models**: `Pengguna`, `Lowongan`, `Lamaran`, `Wawancara`. Table columns: `id_pengguna`, `kata_sandi`, `peran`, `status_akun`.

**Roles**: `Pelamar`, `Admin_Perusahaan`, `Super_Admin`  
**Account Status**: `Aktif`, `Nonaktif` (read-only GET), `Diblokir` (no access)

## API

**Format**: `{'status': 'success', 'message': '...', 'data': [...]}` / error: `{'status': 'error', 'message': '...'}`  
**Exception**: Google Auth returns `{'status': true, ...}` (boolean, not string).

**Auth Endpoints** (prefix `/api/v1/auth`):
| Endpoint | Notes |
|---|---|
| `POST /login` | body: `email`, `kata_sandi` — blocks `Super_Admin` |
| `POST /portal-pusat/login` | body: `username_email` (email OR nama_pengguna), `kata_sandi` |
| `POST /google-auth` | body: `nama_pengguna`, `email`, optional `fcm_token` |
| `POST /daftar-pelamar` | Register applicant |
| `POST /daftar-perusahaan` | Register company |
| `POST /forgot-password` | Sends reset link |
| `POST /reset-password` | Resets password |

**Token**: `localStorage` key `token`, header `Authorization: Bearer {token}`. 401 → redirect to `/masuk` (or `/auth/portal-pusat/login` for super-admin paths).

**Super Admin has two route prefixes**: `/api/v1/super-admin/` and `/api/v1/superadmin/` — both active with slightly different controller structures.

**Middleware**: `auth:api` + `role:{Pelamar|Admin_Perusahaan|Super_Admin}`. `CheckAccountStatus` enforces read-only for `Nonaktif`.

## Database

**Key Tables**: `pengguna` (PK `id_pengguna`), `profil_pelamar`, `profil_perusahaan` (has `status_verifikasi`), `lowongan` (has SoftDeletes, status: `Draft`/`Active`/`Closed`), `lamaran` (status flow: `Diproses` → `Dalam Review` → `Wawancara` → `Diterima`/`Ditolak`), `wawancara` (status: `Terjadwal`), `jenis_dokumen`, `log_status_lamaran`.

**Profil Perusahaan Verification**: `Pending` → `Diterima` / `Ditolak`. Unverified companies force vacancy to `Draft`.

**WhatsApp Routing**: `Pengguna::routeNotificationForWhatsApp()` transforms `08xx` → `628xx`. No WhatsApp channel loaded yet.

## Testing

- **SQLite in-memory** — `phpunit.xml` sets `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `QUEUE_CONNECTION=sync`.
- `RefreshDatabase` trait. `Notification::fake()` in `setUp()`.
- Test data is created inline — no seeders.
- Test user passwords in `RecruitmentFlowTest`: `cofe-job-sprama` (super admin), `password` (admin), `passoword` (pelamar — note typo).

## Environment

**Required**: `DB_CONNECTION=mysql`, `DB_DATABASE=cafe_db`, `JWT_SECRET` (generate: `php artisan jwt:secret`), `REVERB_*` keys, `VITE_FIREBASE_*` keys.

**Cache/Queue/Session** all use `database` driver (in config), but tests override to `array`/`sync`/`array`.

## Deployment (Docker)

- **Dockerfile**: `php:8.2-fpm-alpine` + nginx + supervisord. Port 80 exposed.
- **CI/CD**: GitHub Actions → test (PHP 8.2 + Node 20) → build Docker image → push to GHCR (`ghcr.io/syahrulhannan07/website_cofe_job`) → SSH deploy to VPS (port 8022) with `docker compose up -d` → `migrate` → `queue:restart`.
- `docker compose` runs `app` (port 8083:80, 8080:8080) + `db` (MySQL 8.0, port 3306).

## Gotchas

1. **Super Admin login field**: uses `username_email` (not `email`). Regular login uses `email`. Easy to mix up.
2. **Super Admin blocked from regular login**: `AuthService` rejects `Super_Admin` at `/auth/login` with generic "salah" message.
3. **Two Super Admin route prefixes**: both `/super-admin/` and `/superadmin/` work. Some endpoints exist under one but not the other.
4. **Google Auth returns boolean `status`**: `{'status': true, ...}` not `{'status': 'success', ...}`.
5. **Company verification forces Draft**: unverified/denied companies' vacancies always save as `Draft` regardless of input.
6. **Inactive = read-only**: `CheckAccountStatus` middleware blocks POST/PUT/DELETE for `Nonaktif`, allows GET.
7. **Blocked accounts**: cannot log in, returns 403 immediately.
8. **Lowongan has SoftDeletes**: query with `withTrashed()` if needed.
9. **JWT TTL**: 480 min (8h) in `config/jwt.php`. Refresh TTL: 20160 min (14d).
10. **Test password typo**: `RecruitmentFlowTest` uses `passoword` (not `password`) for the pelamar user.
11. **`Broadcast::routes` is declared in both `api.php` and `channels.php`**.
12. **Storage route**: `GET /storage/lamaran_dokumen/{id_lamaran}/{filename}` serves from `storage/app/local/lamaran_dokumen/`.
13. **E2E tools exist**: `@playwright/test` + `@axe-core/playwright` in devDeps but no test files yet.
14. **Vite ignores** `storage/framework/views/` in its watcher server config.
