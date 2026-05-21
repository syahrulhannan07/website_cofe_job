<?php

namespace Tests\Feature;

use App\Models\JenisDokumen;
use App\Models\Lamaran;
use App\Models\Lowongan;
use App\Models\LowonganDokumen;
use App\Models\PertanyaanLowongan;
use App\Models\Wawancara;
use Database\Factories\JenisDokumenFactory;
use Database\Factories\LamaranFactory;
use Database\Factories\LowonganDokumenFactory;
use Database\Factories\LowonganFactory;
use Database\Factories\PenggunaFactory;
use Database\Factories\PertanyaanLowonganFactory;
use Database\Factories\ProfilPelamarFactory;
use Database\Factories\WawancaraFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// [UPDATE LOGIC] - Test suite untuk Lamaran Kerja dan Wawancara
class LamaranKerjaTest extends TestCase
{
    use RefreshDatabase;

    private $pelamar;
    private $profil;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pelamar = PenggunaFactory::new()->create([
            'peran' => 'Pelamar',
        ]);
        
        $this->profil = ProfilPelamarFactory::new()->create([
            'id_pengguna' => $this->pelamar->id_pengguna,
            'nama_lengkap' => 'Pelamar Test Lengkap',
            'nomor_telepon' => '0812345678',
        ]);

        $this->token = auth('api')->login($this->pelamar);
    }

    /**
     * FR-04 (UC-04) - Melamar Pekerjaan Skenario Normal
     */
    public function test_melamar_pekerjaan_sukses()
    {
        Storage::fake('local');
        $file = UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf');

        // Buat lowongan aktif
        $lowongan = LowonganFactory::new()->create([
            'status' => 'Active',
            'batas_akhir' => now()->addDays(10)->format('Y-m-d'),
        ]);

        // Buat dokumen wajib lowongan
        $jenisDoc = JenisDokumenFactory::new()->create([
            'nama_dokumen' => 'CV',
        ]);
        LowonganDokumenFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_jenis_dokumen' => $jenisDoc->id_jenis_dokumen,
            'wajib' => true,
        ]);

        // Buat pertanyaan seleksi lowongan
        $pertanyaan = PertanyaanLowonganFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'pertanyaan' => 'Mengapa Anda tertarik?',
            'tipe_jawaban' => 'Teks',
        ]);

        // 1. Inisiasi lamaran
        $responseMulai = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/lamaran/mulai', [
                'id_lowongan' => $lowongan->id_lowongan,
            ]);

        $responseMulai->assertStatus(201);
        $idLamaran = $responseMulai->json('data.id_lamaran');

        $this->assertDatabaseHas('lamaran', [
            'id_lamaran' => $idLamaran,
            'status' => 'Diproses',
        ]);

        // 2. Upload dokumen
        $responseDoc = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/lamaran/{$idLamaran}/dokumen", [
                'dokumen' => [$file],
                'id_jenis_dokumen' => [$jenisDoc->id_jenis_dokumen],
            ]);

        $responseDoc->assertStatus(200);

        // 3. Simpan jawaban pertanyaan
        $responseJawaban = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/lamaran/{$idLamaran}/jawaban", [
                'jawaban' => [
                    [
                        'id_pertanyaan' => $pertanyaan->id_pertanyaan,
                        'jawaban' => 'Saya ingin belajar banyak hal baru.',
                    ]
                ]
            ]);

        $responseJawaban->assertStatus(200);

        // 4. Kirim final
        $responseKirim = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/lamaran/{$idLamaran}/kirim");

        $responseKirim->assertStatus(200);
        $responseKirim->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('lamaran', [
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $this->profil->id_profil,
        ]);
    }

    /**
     * FR-04 (UC-04) - Melamar Pekerjaan Skenario Alternatif (Dokumen Wajib tidak diunggah)
     */
    public function test_melamar_pekerjaan_gagal_dokumen_wajib_kosong()
    {
        // Buat lowongan aktif
        $lowongan = LowonganFactory::new()->create([
            'status' => 'Active',
            'batas_akhir' => now()->addDays(10)->format('Y-m-d'),
        ]);

        $jenisDoc = JenisDokumenFactory::new()->create();
        LowonganDokumenFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_jenis_dokumen' => $jenisDoc->id_jenis_dokumen,
            'wajib' => true,
        ]);

        // Inisiasi lamaran
        $responseMulai = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/lamaran/mulai', [
                'id_lowongan' => $lowongan->id_lowongan,
            ]);

        $responseMulai->assertStatus(201);
        $idLamaran = $responseMulai->json('data.id_lamaran');

        // Langsung kirim tanpa upload dokumen wajib
        $responseKirim = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/v1/lamaran/{$idLamaran}/kirim");

        $responseKirim->assertStatus(422);
        $responseKirim->assertJsonPath('status', 'error');
        $responseKirim->assertJsonPath('message', 'Harap upload semua dokumen wajib terlebih dahulu.');
    }

    /**
     * FR-05 (UC-05) - Lihat Status Lamaran Skenario Normal
     */
    public function test_lihat_status_lamaran_sukses()
    {
        $lowongan = LowonganFactory::new()->create([
            'status' => 'Active',
        ]);

        $lamaran = LamaranFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $this->profil->id_profil,
            'status' => 'Diproses',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/pelamar/lamaran');

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonCount(1, 'data');
    }

    /**
     * FR-05 (UC-05) - Lihat Status Lamaran Skenario Alternatif (Empty State)
     */
    public function test_lihat_status_lamaran_empty_state()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/v1/pelamar/lamaran');

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('data', []);
    }

    /**
     * FR-05.01 (UC-05.01) - Lihat Jadwal Wawancara Skenario Normal
     */
    public function test_lihat_jadwal_wawancara_sukses()
    {
        $lowongan = LowonganFactory::new()->create();
        $lamaran = LamaranFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $this->profil->id_profil,
            'status' => 'Wawancara',
        ]);

        $wawancara = WawancaraFactory::new()->create([
            'id_lamaran' => $lamaran->id_lamaran,
            'tanggal_wawancara' => now()->addDays(2),
            'status' => 'Terjadwal',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/v1/pelamar/lamaran/{$lamaran->id_lamaran}/wawancara");

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('data.is_expired', false);
    }

    /**
     * FR-05.01 (UC-05.01) - Lihat Jadwal Wawancara Skenario Alternatif (Kedaluwarsa)
     */
    public function test_lihat_jadwal_wawancara_expired()
    {
        $lowongan = LowonganFactory::new()->create();
        $lamaran = LamaranFactory::new()->create([
            'id_lowongan' => $lowongan->id_lowongan,
            'id_profil' => $this->profil->id_profil,
            'status' => 'Wawancara',
        ]);

        $wawancara = WawancaraFactory::new()->create([
            'id_lamaran' => $lamaran->id_lamaran,
            'tanggal_wawancara' => now()->subDays(2),
            'status' => 'Terjadwal',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/v1/pelamar/lamaran/{$lamaran->id_lamaran}/wawancara");

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('data.is_expired', true);
        $response->assertJsonPath('data.label_expired', 'Kedaluwarsa');
    }
}
