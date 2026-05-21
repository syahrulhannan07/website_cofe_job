<?php

namespace Tests\Feature;

use App\Models\Pengguna;
use App\Models\ProfilPelamar;
use Database\Factories\PenggunaFactory;
use Database\Factories\ProfilPelamarFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// [UPDATE LOGIC] - Test suite untuk Mengelola Profil Pelamar
class PelamarProfileTest extends TestCase
{
    use RefreshDatabase;

    private $pelamar;
    private $profil;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat user pelamar dan profilnya
        $this->pelamar = PenggunaFactory::new()->create([
            'peran' => 'Pelamar',
        ]);
        
        $this->profil = ProfilPelamarFactory::new()->create([
            'id_pengguna' => $this->pelamar->id_pengguna,
        ]);

        $this->token = auth('api')->login($this->pelamar);
    }

    /**
     * FR-03 (UC-03) - Mengelola Profil Pelamar Skenario Normal
     */
    public function test_mengelola_profil_pelamar_sukses()
    {
        // 1. Update Biodata
        $payloadUpdate = [
            'nama_lengkap' => 'Nama Baru Pelamar',
            'tentang_saya' => 'Saya adalah QA engineer berpengalaman.',
            'tanggal_lahir' => '1998-05-20',
            'nomor_telepon' => '081234567890',
            'alamat' => 'Jl. Testing No. 456',
            'jenis_kelamin' => 'Laki-laki',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/pelamar/profil/update', $payloadUpdate);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('profil_pelamar', [
            'id_profil' => $this->profil->id_profil,
            'nama_lengkap' => 'Nama Baru Pelamar',
            'tanggal_lahir' => '1998-05-20',
            'nomor_telepon' => '081234567890',
        ]);

        // 2. Tambah Skill (CD-03)
        $skillPayload = [
            'nama_skill' => 'PHPUnit Testing',
            'deskripsi' => 'Automated testing in Laravel',
        ];

        $responseSkill = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/pelamar/profil/skill', $skillPayload);

        $responseSkill->assertStatus(201);
        $this->assertDatabaseHas('skill', [
            'id_profil' => $this->profil->id_profil,
            'nama_skill' => 'PHPUnit Testing',
        ]);

        // 3. Tambah Pendidikan (CD-04)
        $pendidikanPayload = [
            'institusi' => 'Universitas Antigravity',
            'jurusan' => 'Teknik Informatika',
            'tingkat' => 'S1',
            'tahun_mulai' => '2016-09-01',
            'tahun_selesai' => '2020-09-01',
        ];

        $responsePendidikan = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/pelamar/profil/pendidikan', $pendidikanPayload);

        $responsePendidikan->assertStatus(201);
        $this->assertDatabaseHas('pendidikan', [
            'id_profil' => $this->profil->id_profil,
            'institusi' => 'Universitas Antigravity',
            'jurusan' => 'Teknik Informatika',
        ]);

        // 4. Tambah Pengalaman (CD-05)
        $pengalamanPayload = [
            'nama_perusahaan' => 'PT. QA Semesta',
            'posisi' => 'Junior QA Engineer',
            'tanggal_mulai' => '2021-01-01',
            'tanggal_selesai' => '2022-12-31',
            'deskripsi' => 'Melakukan testing aplikasi.',
        ];

        $responsePengalaman = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/pelamar/profil/pengalaman', $pengalamanPayload);

        $responsePengalaman->assertStatus(201);
        $this->assertDatabaseHas('pengalaman_kerja', [
            'id_profil' => $this->profil->id_profil,
            'nama_perusahaan' => 'PT. QA Semesta',
            'posisi' => 'Junior QA Engineer',
        ]);
    }

    /**
     * FR-03 (UC-03) - Mengelola Profil Pelamar Skenario Alternatif (Format Tanggal Salah)
     */
    public function test_mengelola_profil_pelamar_gagal_format_tanggal_lahir_salah()
    {
        $payloadUpdate = [
            'tanggal_lahir' => '20-05-1998', // Format salah
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/v1/pelamar/profil/update', $payloadUpdate);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['tanggal_lahir']);
    }
}
