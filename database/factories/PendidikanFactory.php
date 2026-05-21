<?php

namespace Database\Factories;

use App\Models\Pendidikan;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model Pendidikan
class PendidikanFactory extends Factory
{
    protected $model = Pendidikan::class;

    public function definition(): array
    {
        return [
            'id_profil' => ProfilPelamarFactory::new(),
            'institusi' => $this->faker->company(),
            'jurusan' => $this->faker->word(),
            'tingkat' => $this->faker->randomElement(['SMA', 'D3', 'S1', 'S2']),
            'tahun_mulai' => $this->faker->date(),
            'tahun_selesai' => $this->faker->date(),
        ];
    }
}
