<?php

namespace Database\Factories;

use App\Models\Lowongan;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model Lowongan
class LowonganFactory extends Factory
{
    protected $model = Lowongan::class;

    public function definition(): array
    {
        return [
            'id_perusahaan' => ProfilPerusahaanFactory::new()->state(['status_verifikasi' => 'Diterima']),
            'posisi' => $this->faker->jobTitle(),
            'deskripsi' => $this->faker->paragraph(),
            'persyaratan' => $this->faker->paragraph(),
            'lokasi' => $this->faker->city(),
            'gaji' => 'Rp 3.000.000 - Rp 5.000.000',
            'batas_awal' => now()->format('Y-m-d'),
            'batas_akhir' => now()->addDays(30)->format('Y-m-d'),
            'status' => 'Draft',
        ];
    }
}
