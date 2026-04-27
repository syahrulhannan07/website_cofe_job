<?php

namespace App\Services\V1\Auth;

use App\Models\Pengguna;
use App\Repositories\V1\PenggunaRepository;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

/**
 * AuthService — Structural: Facade Pattern + Behavioral: Strategy Pattern.
 *
 * FACADE PATTERN:
 * Kelas ini menyederhanakan antarmuka yang kompleks dari proses autentikasi.
 * LoginController tidak perlu mengetahui detail tentang Hash::check(),
 * JWTAuth, atau struktur data Pengguna. Cukup panggil `prosesMasuk()`.
 *
 * STRATEGY PATTERN:
 * Metode `susunDataResponsBerdasarkanPeran()` menerapkan pola Strategy
 * di mana perilaku penyusunan data respons berbeda tergantung pada peran
 * pengguna (Pelamar, Admin_Perusahaan, Super_Admin) tanpa menggunakan
 * rangkaian if-else yang panjang di Controller.
 *
 * SOLID — Single Responsibility Principle (SRP):
 * Kelas ini satu-satunya yang bertanggung jawab atas logika autentikasi.
 */
class AuthService
{
    /**
     * Repositori pengguna — diinjeksi melalui konstruktor (Dependency Injection).
     * PenggunaRepository terdaftar sebagai Singleton di AppServiceProvider.
     */
    public function __construct(
        protected PenggunaRepository $penggunaRepository
    ) {}

    /**
     * Memproses seluruh alur masuk pengguna.
     *
     * @param  string $email
     * @param  string $kataSandi
     * @return array  Berisi status dan data respons.
     */
    public function prosesMasuk(string $email, string $kataSandi): array
    {
        // Langkah 1: Cari pengguna berdasarkan email via Repository
        $pengguna = $this->penggunaRepository->findByEmail($email);

        // Langkah 2: Validasi keberadaan akun
        if (!$pengguna) {
            return $this->galatRespons('Akun belum terdaftar.', 401);
        }

        // Langkah 3: Verifikasi kata sandi menggunakan Hash Facade
        if (!Hash::check($kataSandi, $pengguna->kata_sandi)) {
            return $this->galatRespons('Username atau password salah.', 401);
        }

        // Langkah 4: Periksa status akun pengguna
        if ($pengguna->status_akun === 'Diblokir') {
            return $this->galatRespons(
                'Akun Anda telah ditangguhkan. Silakan hubungi bantuan.',
                403
            );
        }

        // Langkah 5: Buat JWT token untuk pengguna yang valid
        $token = auth('api')->login($pengguna);

        // Langkah 6: Susun data respons berdasarkan peran (Strategy Pattern)
        $dataRespons = $this->susunDataResponsBerdasarkanPeran($pengguna, $token);

        return [
            'sukses'  => true,
            'data'    => $dataRespons,
            'pesan'   => 'Login berhasil.',
            'kode'    => 200,
        ];
    }

    /**
     * STRATEGY PATTERN — Menyusun data respons berdasarkan peran pengguna.
     *
     * Setiap peran memiliki strategi tersendiri dalam menyusun payload respons.
     * Tambahkan peran baru cukup dengan menambahkan kondisi baru di sini,
     * tanpa menyentuh Controller sama sekali (Open/Closed Principle - OCP).
     *
     * @param  Pengguna $pengguna Entitas pengguna yang telah terautentikasi.
     * @param  string   $token   JWT token yang telah dibuat.
     * @return array    Struktur data respons yang telah disusun.
     */
    private function susunDataResponsBerdasarkanPeran(Pengguna $pengguna, string $token): array
    {
        // Data dasar yang selalu ada untuk semua peran
        $dataRespons = [
            'token'    => $token,
            'pengguna' => [
                'id_pengguna'   => $pengguna->id_pengguna,
                'nama_pengguna' => $pengguna->nama_pengguna,
                'email'         => $pengguna->email,
                'peran'         => $pengguna->peran,
            ],
        ];

        // Strategi tambahan khusus untuk peran Admin_Perusahaan:
        // Sertakan status verifikasi profil perusahaan.
        if ($pengguna->peran === 'Admin_Perusahaan') {
            $profil = $pengguna->profilPerusahaan;
            $dataRespons['profil_perusahaan'] = [
                'status_verifikasi' => $profil ? $profil->status_verifikasi : 'Pending',
            ];
        }

        // Strategi untuk peran lain (Pelamar, Super_Admin) tidak memerlukan
        // data tambahan pada saat ini — hanya data dasar di atas yang dikembalikan.

        return $dataRespons;
    }

    /**
     * Membangun struktur array untuk kondisi respons error.
     *
     * @param  string $pesan Pesan galat.
     * @param  int    $kode  Kode HTTP untuk error.
     * @return array
     */
    private function galatRespons(string $pesan, int $kode): array
    {
        return [
            'sukses' => false,
            'pesan'  => $pesan,
            'kode'   => $kode,
        ];
    }
}
