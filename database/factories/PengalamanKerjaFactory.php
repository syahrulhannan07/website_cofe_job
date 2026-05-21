<?php

namespace Database\Factories;

use App\Models\PengalamanKerja;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model PengalamanKerja
class PengalamanKerjaFactory extends Factory
{
    protected $model = PengalamanKerja::class;

    public function definition(): array
    {
        return [
            'id_profil' => ProfilPelamarFactory::new(),
            'nama_perusahaan' => $this->faker->company(),
            'posisi' => $this->faker->jobTitle(),
            'tanggal_mulai' => $this->faker->date(),
            'tanggal_selesai' => $this->faker->date(),
            'deskripsi' => $this->faker->sentence(),
        ];
    }
}
