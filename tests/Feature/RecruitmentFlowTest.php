<?php

namespace Tests\Feature;

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use App\Models\ProfilPelamar;
use App\Models\Lowongan;
use App\Models\Lamaran;
use App\Models\JenisDokumen;
use App\Models\PertanyaanLowongan;
use App\Models\Wawancara;
use App\Models\LogStatusLamaran;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RecruitmentFlowTest extends TestCase
{
    use RefreshDatabase;

    private $superAdmin;
    private $adminPerusahaan;
    private $profilPerusahaan;
    private $pelamar;
    private $profilPelamar;
    private $jenisDoc;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Seed Jenis Dokumen
        $this->jenisDoc = JenisDokumen::create([
            'nama_dokumen' => 'CV',
            'keterangan' => 'Curriculum Vitae',
        ]);

        // 2. Setup Super Admin
        $this->superAdmin = Pengguna::create([
            'nama_pengguna' => 'Super Admin',
            'email' => 'ramadhansanjaya18@gmail.com',
            'kata_sandi' => Hash::make('cofe-job-sprama'),
            'peran' => 'Super_Admin',
            'status_akun' => 'Aktif',
        ]);

        // 3. Setup Admin Perusahaan (Pending status initially)
        $this->adminPerusahaan = Pengguna::create([
            'nama_pengguna' => 'Owner Sanjaya',
            'email' => 'ramadhansanjaya24@student.polindra.ac.id',
            'kata_sandi' => Hash::make('password'),
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Nonaktif',
        ]);

        $this->profilPerusahaan = ProfilPerusahaan::create([
            'id_pengguna' => $this->adminPerusahaan->id_pengguna,
            'logo_perusahaan' => 'logo/company.png',
            'nama_perusahaan' => 'Sanjaya Coffee Shop',
            'alamat_perusahaan' => 'Jl. Polindra No. 24 Indramayu',
            'dokumen_izin' => 'legalitas/nib.pdf',
            'status_verifikasi' => 'Pending',
        ]);

        // 4. Setup Pelamar
        $this->pelamar = Pengguna::create([
            'nama_pengguna' => 'Sanjaya Jaya Pelamar',
            'email' => 'sanjayajaya4140@gmail.com',
            'kata_sandi' => Hash::make('passoword'), // Note: password spelled 'passoword' per prompt
            'peran' => 'Pelamar',
            'status_akun' => 'Aktif',
        ]);

        $this->profilPelamar = ProfilPelamar::create([
            'id_pengguna' => $this->pelamar->id_pengguna,
            'nama_lengkap' => 'Sanjaya Jaya',
            'nomor_telepon' => '081234567890',
            'alamat' => 'Jl. Raya Indramayu No. 41',
            'jenis_kelamin' => 'Laki-laki',
        ]);
    }

    /**
     * Audit Aksesibilitas Halaman Utama
     */
    public function test_accessibility_audit()
    {
        $response = $this->get('/');
        $response->assertStatus(200);

        $html = $response->getContent();
        
        $dom = new \DOMDocument();
        // Suppress HTML5 tag warnings
        @$dom->loadHTML($html);

        // 1. Memastikan tag html memiliki atribut lang
        $htmlElement = $dom->getElementsByTagName('html')->item(0);
        $this->assertNotNull($htmlElement, 'Tag <html> tidak ditemukan.');
        $this->assertTrue($htmlElement->hasAttribute('lang'), 'Tag <html> tidak memiliki atribut lang.');
        $this->assertNotEmpty($htmlElement->getAttribute('lang'), 'Atribut lang pada tag <html> kosong.');

        // 2. Memastikan tag title ada dan tidak kosong
        $titleElement = $dom->getElementsByTagName('title')->item(0);
        $this->assertNotNull($titleElement, 'Tag <title> tidak ditemukan.');
        $this->assertNotEmpty($titleElement->nodeValue, 'Tag <title> kosong.');

        // 3. Memastikan tag meta viewport ada untuk responsivitas/aksesibilitas mobile
        $metaElements = $dom->getElementsByTagName('meta');
        $hasViewport = false;
        foreach ($metaElements as $meta) {
            if ($meta->getAttribute('name') === 'viewport') {
                $hasViewport = true;
                $this->assertNotEmpty($meta->getAttribute('content'), 'Konten meta viewport kosong.');
                break;
            }
        }
        $this->assertTrue($hasViewport, 'Tag meta viewport tidak ditemukan.');
    }

    /**
     * Skenario E2E Positif: Alur Rekrutmen Lengkap
     */
    public function test_full_recruitment_flow()
    {
        // === 1. AKSES & LOGIN SUPER ADMIN ===
        $superAdminLogin = $this->postJson('/api/v1/auth/portal-pusat/login', [
            'username_email' => 'ramadhansanjaya18@gmail.com',
            'kata_sandi' => 'cofe-job-sprama',
        ]);
        $superAdminLogin->assertStatus(200);
        $superAdminToken = $superAdminLogin->json('data.token');
        $this->assertNotEmpty($superAdminToken);

        // Akses dashboard super admin
        $superDashboard = $this->withHeader('Authorization', 'Bearer ' . $superAdminToken)
            ->getJson('/api/v1/superadmin/dashboard');
        $superDashboard->assertStatus(200);

        // === 2. VERIFIKASI PERUSAHAAN ===
        // Setujui pendaftaran perusahaan
        $approveCompany = $this->withHeader('Authorization', 'Bearer ' . $superAdminToken)
            ->putJson("/api/v1/super-admin/verifikasi/{$this->profilPerusahaan->id_perusahaan}/setuju");
        $approveCompany->assertStatus(200);
        $approveCompany->assertJsonPath('status', 'success');

        // Verifikasi status akun di database
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $this->profilPerusahaan->id_perusahaan,
            'status_verifikasi' => 'Diterima',
        ]);
        $this->assertDatabaseHas('pengguna', [
            'id_pengguna' => $this->adminPerusahaan->id_pengguna,
            'status_akun' => 'Aktif',
        ]);

        // === 3. LOGIN ADMIN PERUSAHAAN & BUAT LOWONGAN ===
        app('auth')->forgetGuards();
        $adminLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'ramadhansanjaya24@student.polindra.ac.id',
            'kata_sandi' => 'password',
        ]);
        $adminLogin->assertStatus(200);
        $adminToken = $adminLogin->json('data.token');
        $this->assertNotEmpty($adminToken);

        // Buat lowongan baru
        $lowonganPayload = [
            'posisi' => 'Barista Senior',
            'deskripsi' => 'Mampu membuat espresso dan latte art berkualitas tinggi.',
            'persyaratan' => 'Pengalaman minimal 1 tahun di bidang Food & Beverages.',
            'batas_awal' => now()->format('Y-m-d'),
            'batas_akhir' => now()->addMonth()->format('Y-m-d'),
            'status' => 'Draft',
            'dokumen_dibutuhkan' => [
                ['id_jenis_dokumen' => $this->jenisDoc->id_jenis_dokumen, 'wajib' => true],
            ],
            'pertanyaan' => [
                ['pertanyaan' => 'Apakah Anda memiliki sertifikat Barista?', 'tipe_jawaban' => 'text'],
            ],
        ];

        $lowonganResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/lowongan', $lowonganPayload);
        $lowonganResponse->assertStatus(201);
        $idLowongan = $lowonganResponse->json('data.id');
        $this->assertNotNull($idLowongan);

        // Publikasikan lowongan agar berstatus Active (Aktif)
        $publishResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson("/api/v1/admin/lowongan/{$idLowongan}/publish");
        $publishResponse->assertStatus(200);

        // Verifikasi di database status lowongan ter-update ke Active
        $this->assertDatabaseHas('lowongan', [
            'id_lowongan' => $idLowongan,
            'status' => 'Active',
        ]);

        // === 4. LOGIN PELAMAR & MELAMAR KERJA ===
        app('auth')->forgetGuards();
        $pelamarLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'sanjayajaya4140@gmail.com',
            'kata_sandi' => 'passoword',
        ]);
        $pelamarLogin->assertStatus(200);
        $pelamarToken = $pelamarLogin->json('data.token');
        $this->assertNotEmpty($pelamarToken);

        // Mulai lamaran (Inisiasi)
        $mulaiLamaran = $this->withHeader('Authorization', 'Bearer ' . $pelamarToken)
            ->postJson('/api/v1/lamaran/mulai', [
                'id_lowongan' => $idLowongan,
            ]);
        $mulaiLamaran->assertStatus(201);
        $idLamaran = $mulaiLamaran->json('data.id_lamaran');
        $this->assertNotNull($idLamaran);

        // Upload dokumen wajib (CV)
        Storage::fake('local');
        $dummyDoc = UploadedFile::fake()->create('sanjaya_cv.pdf', 100, 'application/pdf');
        
        $uploadDoc = $this->withHeader('Authorization', 'Bearer ' . $pelamarToken)
            ->postJson("/api/v1/lamaran/{$idLamaran}/dokumen", [
                'dokumen' => [$dummyDoc],
                'id_jenis_dokumen' => [$this->jenisDoc->id_jenis_dokumen],
            ]);
        $uploadDoc->assertStatus(200);

        // Simpan jawaban pertanyaan
        $pertanyaan = PertanyaanLowongan::where('id_lowongan', $idLowongan)->first();
        $simpanJawaban = $this->withHeader('Authorization', 'Bearer ' . $pelamarToken)
            ->postJson("/api/v1/lamaran/{$idLamaran}/jawaban", [
                'jawaban' => [
                    [
                        'id_pertanyaan' => $pertanyaan->id_pertanyaan,
                        'jawaban' => 'Ya, saya memiliki sertifikat barista tingkat nasional.',
                    ]
                ]
            ]);
        $simpanJawaban->assertStatus(200);

        // Submit final lamaran
        $kirimLamaran = $this->withHeader('Authorization', 'Bearer ' . $pelamarToken)
            ->postJson("/api/v1/lamaran/{$idLamaran}/kirim");
        $kirimLamaran->assertStatus(200);

        // Verifikasi relasi lamaran terbentuk dengan status 'Diproses'
        $this->assertDatabaseHas('lamaran', [
            'id_lamaran' => $idLamaran,
            'id_lowongan' => $idLowongan,
            'id_profil' => $this->profilPelamar->id_profil,
            'status' => 'Diproses',
        ]);

        // === 5. PROSES LAMARAN & JADWALKAN WAWANCARA ===
        // Admin Perusahaan masuk kembali untuk melihat detail lamaran pelamar
        app('auth')->forgetGuards();
        auth('api')->setToken($adminToken);
        $detailLamaran = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson("/api/v1/admin/lamaran/{$idLamaran}");
        $detailLamaran->assertStatus(200);

        // Jadwalkan Wawancara (Tanggal harus lebih dari hari ini)
        $tanggalWawancara = now()->addDays(2)->format('Y-m-d H:i');
        $wawancaraPayload = [
            'tanggal' => now()->addDays(2)->format('Y-m-d'),
            'waktu' => '10:00',
            'tempat_link' => 'https://meet.google.com/abc-defg-hij',
            'tanggal_wawancara' => $tanggalWawancara,
            'lokasi' => 'Google Meet',
            'catatan' => 'Silakan hadir 10 menit sebelum jadwal dimulai.',
        ];

        $scheduleInterview = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson("/api/v1/admin/lamaran/{$idLamaran}/wawancara", $wawancaraPayload);
        $scheduleInterview->assertStatus(201);

        // Verifikasi status pelamar ter-update ke 'Wawancara' di database
        $this->assertDatabaseHas('lamaran', [
            'id_lamaran' => $idLamaran,
            'status' => 'Wawancara',
        ]);

        // Verifikasi data jadwal wawancara tersimpan di database
        $this->assertDatabaseHas('wawancara', [
            'id_lamaran' => $idLamaran,
            'lokasi' => 'Google Meet',
            'status' => 'Terjadwal',
        ]);
    }

    /**
     * Skenario Negatif 1: Akses Ilegal (Bypass Hak Akses)
     */
    public function test_illegal_access_by_pelamar()
    {
        $pelamarLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'sanjayajaya4140@gmail.com',
            'kata_sandi' => 'passoword',
        ]);
        $pelamarLogin->assertStatus(200);
        $pelamarToken = $pelamarLogin->json('data.token');

        // Mencoba mengakses rute verifikasi Super Admin menggunakan token pelamar
        $illegalRequest = $this->withHeader('Authorization', 'Bearer ' . $pelamarToken)
            ->getJson('/api/v1/super-admin/verifikasi');
        
        $illegalRequest->assertStatus(403);
    }

    /**
     * Skenario Negatif 2: Login Gagal (Kredensial Salah)
     */
    public function test_login_failure_invalid_credentials()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'sanjayajaya4140@gmail.com',
            'kata_sandi' => 'salahpassword',
        ]);

        $response->assertStatus(401);
        $response->assertJsonPath('status', 'error');
    }

    /**
     * Skenario Negatif 3: Pembuatan Lowongan Gagal (Validasi Payload Kosong)
     */
    public function test_create_lowongan_validation_fails()
    {
        // Jadikan admin perusahaan status Diterima terlebih dahulu agar tidak memicu error 403
        $this->profilPerusahaan->update(['status_verifikasi' => 'Diterima']);
        $this->adminPerusahaan->update(['status_akun' => 'Aktif']);

        $adminLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'ramadhansanjaya24@student.polindra.ac.id',
            'kata_sandi' => 'password',
        ]);
        $adminToken = $adminLogin->json('data.token');

        // Kirim payload pembuatan lowongan dengan field wajib kosong
        $payloadKosong = [
            'posisi' => '', // Kosong
            'deskripsi' => '',
            'persyaratan' => '',
            'batas_awal' => '',
            'batas_akhir' => '',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/lowongan', $payloadKosong);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['posisi', 'deskripsi', 'persyaratan', 'batas_awal', 'batas_akhir']);
    }

    /**
     * Skenario Negatif 4: Bypass Dokumen Wajib Lamaran
     */
    public function test_bypass_required_documents_fails()
    {
        // 1. Login Admin Perusahaan untuk membuat lowongan dengan dokumen wajib
        $this->profilPerusahaan->update(['status_verifikasi' => 'Diterima']);
        $this->adminPerusahaan->update(['status_akun' => 'Aktif']);
        
        $adminLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'ramadhansanjaya24@student.polindra.ac.id',
            'kata_sandi' => 'password',
        ]);
        $adminToken = $adminLogin->json('data.token');

        $lowonganResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/lowongan', [
                'posisi' => 'Barista Shift Malam',
                'deskripsi' => 'Deskripsi barista',
                'persyaratan' => 'Persyaratan barista',
                'batas_awal' => now()->format('Y-m-d'),
                'batas_akhir' => now()->addMonth()->format('Y-m-d'),
                'status' => 'Active',
                'dokumen_dibutuhkan' => [
                    ['id_jenis_dokumen' => $this->jenisDoc->id_jenis_dokumen, 'wajib' => true],
                ],
            ]);
        $idLowongan = $lowonganResponse->json('data.id');

        // 2. Login Pelamar & Inisiasi lamaran
        app('auth')->forgetGuards();
        $pelamarLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'sanjayajaya4140@gmail.com',
            'kata_sandi' => 'passoword',
        ]);
        $pelamarToken = $pelamarLogin->json('data.token');

        $mulaiLamaran = $this->withHeader('Authorization', 'Bearer ' . $pelamarToken)
            ->postJson('/api/v1/lamaran/mulai', [
                'id_lowongan' => $idLowongan,
            ]);
        $idLamaran = $mulaiLamaran->json('data.id_lamaran');

        // 3. Langsung kirim lamaran tanpa upload file dokumen wajib
        $kirimResponse = $this->withHeader('Authorization', 'Bearer ' . $pelamarToken)
            ->postJson("/api/v1/lamaran/{$idLamaran}/kirim");

        // Harap kembalikan validasi gagal 422 karena dokumen wajib belum diunggah
        $kirimResponse->assertStatus(422);
        $kirimResponse->assertJsonPath('status', 'error');
        $kirimResponse->assertJsonPath('message', 'Harap upload semua dokumen wajib terlebih dahulu.');
    }
}
