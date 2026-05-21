<?php

namespace Database\Factories;

use App\Models\ProfilPerusahaan;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model ProfilPerusahaan
class ProfilPerusahaanFactory extends Factory
{
    protected $model = ProfilPerusahaan::class;

    public function definition(): array
    {
        return [
            'id_pengguna' => PenggunaFactory::new()->state(['peran' => 'Admin_Perusahaan']),
            'logo_perusahaan' => 'logo/default.png',
            'nama_perusahaan' => $this->faker->company(),
            'alamat_perusahaan' => $this->faker->address(),
            'dokumen_izin' => 'legalitas/nib.pdf',
            'deskripsi' => $this->faker->paragraph(),
            'status_verifikasi' => 'Pending',
        ];
    }
}
