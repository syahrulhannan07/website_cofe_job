<?php

namespace Database\Factories;

use App\Models\Lamaran;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model Lamaran
class LamaranFactory extends Factory
{
    protected $model = Lamaran::class;

    public function definition(): array
    {
        return [
            'id_lowongan' => LowonganFactory::new()->state(['status' => 'Aktif']),
            'id_profil' => ProfilPelamarFactory::new(),
            'status' => 'Diproses',
        ];
    }
}
