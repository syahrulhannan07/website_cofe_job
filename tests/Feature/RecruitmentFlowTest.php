<?php

namespace Tests\Feature;

use App\Enums\StatusScreening;
use App\Models\Nib;
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
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;
use Illuminate\Support\Facades\Notification;
use Mockery;

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

        // Put Notification::fake() di sini agar ALL test ter-mocking dari Firebase API secara global
        Notification::fake();

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

        // Create NIB record for test company
        Nib::create([
            'id_perusahaan' => $this->profilPerusahaan->id_perusahaan,
            'dokumen_nib' => 'legalitas/nib.pdf',
            'status_screening' => StatusScreening::Belum_Diperiksa,
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

        // Simulasikan verifikasi wajah yang sudah lolos (wajib sebelum kirim lamaran)
        Cache::put(
            "lamaran_face_verified_{$idLamaran}_{$this->profilPelamar->id_profil}",
            [
                'verified' => true,
                'confidence' => 95.5,
                'threshold' => 85,
                'verified_at' => now()->toIso8601String(),
            ],
            now()->addMinutes(30)
        );

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

        // Simpan sebagai 'Draft' terlebih dahulu mengikuti alur controller asli
        $lowonganResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/lowongan', [
                'posisi' => 'Barista Shift Malam',
                'deskripsi' => 'Deskripsi barista',
                'persyaratan' => 'Persyaratan barista',
                'batas_awal' => now()->format('Y-m-d'),
                'batas_akhir' => now()->addMonth()->format('Y-m-d'),
                'status' => 'Draft', 
                'dokumen_dibutuhkan' => [
                    ['id_jenis_dokumen' => $this->jenisDoc->id_jenis_dokumen, 'wajib' => true],
                ],
            ]);
        $idLowongan = $lowonganResponse->json('data.id');

        // MODIFIKASI: Wajib di-publish lewat endpoint agar statusnya valid menjadi 'Active'
        $publishResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson("/api/v1/admin/lowongan/{$idLowongan}/publish");
        $publishResponse->assertStatus(200);

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
        
        // Memastikan inisiasi lamaran sukses
        $mulaiLamaran->assertStatus(201);
        $idLamaran = $mulaiLamaran->json('data.id_lamaran');

        // 3. Langsung kirim lamaran tanpa upload file dokumen wajib
        $kirimResponse = $this->withHeader('Authorization', 'Bearer ' . $pelamarToken)
            ->postJson("/api/v1/lamaran/{$idLamaran}/kirim");

        // Harap kembalikan validasi gagal 422 karena dokumen wajib belum diunggah
        $kirimResponse->assertStatus(422);
        $kirimResponse->assertJsonPath('status', 'error');
        // Gunakan where/like atau assertJson fragment jika nama dokumen dinamis,
        // tapi berdasarkan output test, dokumennya adalah 'CV'.
        $this->assertStringContainsString('Sebelum kamu dapat melanjutkan proses lamaran, harap upload dokumen berikut', $kirimResponse->json('message'));
    }

    /**
     * Skenario Tambahan: Admin Perusahaan yang Diblokir sama sekali tidak bisa login
     */
    public function test_admin_perusahaan_blocked_cannot_login()
    {
        $this->adminPerusahaan->update(['status_akun' => 'Diblokir']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'ramadhansanjaya24@student.polindra.ac.id',
            'kata_sandi' => 'password',
        ]);

        $response->assertStatus(403);
        $response->assertJsonPath('status', 'error');
        $response->assertJsonPath('message', 'Akun Anda telah ditangguhkan. Silakan hubungi bantuan.');
    }

    /**
     * Skenario Tambahan: Admin Perusahaan Nonaktif hanya bisa login secara read-only
     */
    public function test_admin_perusahaan_nonaktif_readonly_operations()
    {
        $this->profilPerusahaan->update(['status_verifikasi' => 'Diterima']);
        $this->adminPerusahaan->update(['status_akun' => 'Nonaktif']);

        // Login tetap bisa berhasil
        $adminLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'ramadhansanjaya24@student.polindra.ac.id',
            'kata_sandi' => 'password',
        ]);
        $adminLogin->assertStatus(200);
        $adminToken = $adminLogin->json('data.token');

        // Coba lakukan GET request (read-only) - harus berhasil
        $getResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson('/api/v1/admin/lowongan');
        $getResponse->assertStatus(200);

        // Coba lakukan POST request (write) - harus gagal (403)
        $postResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/lowongan', [
                'posisi' => 'Barista',
                'deskripsi' => 'Deskripsi barista',
                'persyaratan' => 'Persyaratan barista',
                'batas_awal' => now()->format('Y-m-d'),
                'batas_akhir' => now()->addMonth()->format('Y-m-d'),
                'status' => 'Draft',
            ]);
        $postResponse->assertStatus(403);
        $postResponse->assertJsonPath('status', 'error');
        $postResponse->assertJsonPath('message', 'Akun Anda dinonaktifkan. Anda hanya dapat melihat data (read-only).');
    }

    /**
     * Skenario Tambahan: Jika status perusahaan pending/ditolak, lowongan terpaksa draft
     */
    public function test_admin_perusahaan_pending_or_rejected_lowongan_only_draft()
    {
        // Set status perusahaan ke Pending
        $this->profilPerusahaan->update(['status_verifikasi' => 'Pending']);
        $this->adminPerusahaan->update(['status_akun' => 'Aktif']);

        $adminLogin = $this->postJson('/api/v1/auth/login', [
            'email' => 'ramadhansanjaya24@student.polindra.ac.id',
            'kata_sandi' => 'password',
        ]);
        $adminToken = $adminLogin->json('data.token');

        // Coba buat lowongan baru
        $storeResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson('/api/v1/admin/lowongan', [
                'posisi' => 'Barista Pending',
                'deskripsi' => 'Deskripsi barista',
                'persyaratan' => 'Persyaratan barista',
                'batas_awal' => now()->format('Y-m-d'),
                'batas_akhir' => now()->addMonth()->format('Y-m-d'),
                'status' => 'Active', // Mencoba set Active
            ]);

        // Status di database harus tersimpan sebagai Draft, dan status_label yang dikembalikan adalah Draft
        $storeResponse->assertStatus(201);
        $idLowongan = $storeResponse->json('data.id');
        $this->assertDatabaseHas('lowongan', [
            'id_lowongan' => $idLowongan,
            'status' => 'Draft',
        ]);
        $this->assertEquals('Draft', $storeResponse->json('data.status'));
    }

    /**
     * Skenario Positif: Registrasi Perusahaan Aktif Membuat Record NIB
     */
    public function test_company_registration_creates_nib_record()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('nib_document.pdf', 100, 'application/pdf');

        $response = $this->postJson('/api/v1/auth/register/perusahaan', [
            'nama_kafe' => 'Test Cafe NIB',
            'nama_pengelola' => 'Owner Test',
            'email' => 'nibtest@test.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
            'alamat' => '-6.123, 106.456',
            'deskripsi' => 'Test cafe for NIB registration',
            'dokumen_legalitas' => $file,
            'foto_outlet' => UploadedFile::fake()->image('outlet.jpg'),
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', 'Pendaftaran berhasil. Akun Anda sedang ditinjau oleh Super Admin. Harap tunggu persetujuan.');

        // Verify Pengguna created
        $this->assertDatabaseHas('pengguna', [
            'email' => 'nibtest@test.com',
            'peran' => 'Admin_Perusahaan',
        ]);

        $pengguna = Pengguna::where('email', 'nibtest@test.com')->first();
        $this->assertNotNull($pengguna);

        // Verify ProfilPerusahaan created
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_pengguna' => $pengguna->id_pengguna,
            'nama_perusahaan' => 'Test Cafe NIB',
            'status_verifikasi' => 'Pending',
        ]);

        $profilPerusahaan = ProfilPerusahaan::where('id_pengguna', $pengguna->id_pengguna)->first();
        $this->assertNotNull($profilPerusahaan);
        $this->assertNotNull($profilPerusahaan->dokumen_izin);

        // Verify NIB record created
        $this->assertDatabaseHas('nib', [
            'id_perusahaan' => $profilPerusahaan->id_perusahaan,
            'dokumen_nib' => $profilPerusahaan->dokumen_izin,
            'status_screening' => StatusScreening::Belum_Diperiksa->value,
        ]);

        $nib = Nib::where('id_perusahaan', $profilPerusahaan->id_perusahaan)->first();
        $this->assertNotNull($nib);
        $this->assertEquals($profilPerusahaan->id_perusahaan, $nib->id_perusahaan);
        $this->assertEquals($profilPerusahaan->dokumen_izin, $nib->dokumen_nib);
        $this->assertEquals(StatusScreening::Belum_Diperiksa, $nib->status_screening);
        $this->assertNull($nib->nomor_nib);
        $this->assertNull($nib->data_qr);
        $this->assertNull($nib->hasil_screening);
        $this->assertNull($nib->diperiksa_pada);
        $this->assertNotNull($nib->dibuat_pada);
        $this->assertNotNull($nib->diperbarui_pada);

        // Verify file stored only once on public disk
        $this->assertTrue(Storage::disk('public')->exists($profilPerusahaan->dokumen_izin));
        $files = Storage::disk('public')->allFiles();
        $this->assertCount(1, array_filter($files, fn($f) => str_contains($f, $profilPerusahaan->dokumen_izin)));
    }

    /**
     * Skenario Negatif: File dibersihkan saat validasi gagal
     */
    public function test_registration_validation_failure_cleans_uploaded_file()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('nib_document.pdf', 100, 'application/pdf');

        // Missing required field 'nama_kafe' to trigger validation failure
        $response = $this->postJson('/api/v1/auth/register/perusahaan', [
            'nama_pengelola' => 'Owner Test',
            'email' => 'validationfail@test.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
            'alamat' => '-6.123, 106.456',
            'dokumen_legalitas' => $file,
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('status', 'error');
        $response->assertJsonValidationErrors(['nama_kafe']);

        // Verify file was cleaned up
        $files = Storage::disk('public')->allFiles();
        $nibFiles = array_filter($files, fn($f) => str_contains($f, 'legalitas/'));
        $this->assertEmpty($nibFiles, 'File should be cleaned up on validation failure');
    }

    /**
     * Skenario Negatif: Rollback dan Cleanup Saat Pembuatan NIB Gagal di Transaksi
     */
    public function test_registration_nib_creation_failure_rollbacks_and_cleans_file()
    {
        Storage::fake('public');

        // Create pre-existing file in fake storage
        $existingFilePath = 'legalitas/existing.pdf';
        Storage::disk('public')->put($existingFilePath, 'existing file content');

        // Create a pre-existing company to verify it doesn't get deleted
        $existingPengguna = Pengguna::create([
            'nama_pengguna' => 'Existing Owner',
            'email' => 'existing@test.com',
            'kata_sandi' => Hash::make('password'),
            'peran' => 'Admin_Perusahaan',
        ]);

        $existingProfil = ProfilPerusahaan::create([
            'id_pengguna' => $existingPengguna->id_pengguna,
            'nama_perusahaan' => 'Existing Cafe',
            'alamat_perusahaan' => 'Jl. Existing',
            'dokumen_izin' => $existingFilePath,
            'status_verifikasi' => 'Pending',
        ]);

        Nib::create([
            'id_perusahaan' => $existingProfil->id_perusahaan,
            'dokumen_nib' => $existingFilePath,
            'status_screening' => StatusScreening::Belum_Diperiksa,
        ]);

        // Use a model observer to simulate failure
        $observer = new class {
            public function creating($model)
            {
                if ($model instanceof \App\Models\Nib) {
                    throw new \Exception('Simulated NIB creation failure');
                }
            }
        };

        \App\Models\Nib::observe($observer);

        $file = UploadedFile::fake()->create('nib_document.pdf', 100, 'application/pdf');

        $response = $this->postJson('/api/v1/auth/register/perusahaan', [
            'nama_kafe' => 'Test Cafe NIB Fail',
            'nama_pengelola' => 'Owner Fail',
            'email' => 'nibfail@test.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
            'alamat' => '-6.123, 106.456',
            'deskripsi' => 'Test cafe for NIB creation failure',
            'dokumen_legalitas' => $file,
        ]);

        // Remove observer after test (not strictly needed due to RefreshDatabase, but good practice)
        // Note: Laravel doesn't have a forgetObserver method, observer persists for test duration
        // RefreshDatabase will reset state for next test

        // Should return 500 error
        $response->assertStatus(500);
        $response->assertJsonPath('status', 'error');
        $response->assertJsonPath('message', 'Terjadi kesalahan saat pendaftaran');

        // Verify rollback: no new Pengguna for this request
        $this->assertDatabaseMissing('pengguna', [
            'email' => 'nibfail@test.com',
        ]);

        // Verify rollback: no new ProfilPerusahaan for this request
        $this->assertDatabaseMissing('profil_perusahaan', [
            'nama_perusahaan' => 'Test Cafe NIB Fail',
        ]);

        // Verify rollback: no new NIB for the new company (would have 'nib_document' in path)
        $this->assertDatabaseMissing('nib', [
            'dokumen_nib' => 'legalitas/nib_document',
        ]);

        // Verify existing data still exists
        $this->assertDatabaseHas('pengguna', [
            'email' => 'existing@test.com',
        ]);
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $existingProfil->id_perusahaan,
        ]);
        $this->assertDatabaseHas('nib', [
            'id_perusahaan' => $existingProfil->id_perusahaan,
            'dokumen_nib' => $existingFilePath,
        ]);

        // Verify file cleanup: new file should be deleted
        $files = Storage::disk('public')->allFiles();
        $newFiles = array_filter($files, fn($f) => str_contains($f, 'nib_document'));
        $this->assertEmpty($newFiles, 'New uploaded file should be cleaned up on NIB creation failure');

        // Verify existing file still exists
        $this->assertTrue(
            Storage::disk('public')->exists($existingFilePath),
            'Pre-existing file should not be deleted'
        );
    }
}