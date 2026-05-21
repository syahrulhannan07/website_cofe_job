<?php

namespace Database\Factories;

use App\Models\ProfilPelamar;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model ProfilPelamar
class ProfilPelamarFactory extends Factory
{
    protected $model = ProfilPelamar::class;

    public function definition(): array
    {
        return [
            'id_pengguna' => PenggunaFactory::new(),
            'foto_profil' => 'profil/default.png',
            'nama_lengkap' => $this->faker->name(),
            'tentang_saya' => $this->faker->sentence(),
            'tanggal_lahir' => $this->faker->date(),
            'nomor_telepon' => $this->faker->phoneNumber(),
            'alamat' => $this->faker->address(),
            'jenis_kelamin' => $this->faker->randomElement(['Laki-laki', 'Perempuan']),
        ];
    }
}
