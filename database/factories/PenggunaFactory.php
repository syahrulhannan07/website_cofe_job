<?php

namespace Database\Factories;

use App\Models\Pengguna;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

// [UPDATE LOGIC] - Factory untuk model Pengguna
class PenggunaFactory extends Factory
{
    protected $model = Pengguna::class;

    public function definition(): array
    {
        return [
            'nama_pengguna' => $this->faker->userName(),
            'email' => $this->faker->unique()->safeEmail(),
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar',
            'status_akun' => 'Aktif',
        ];
    }
}
