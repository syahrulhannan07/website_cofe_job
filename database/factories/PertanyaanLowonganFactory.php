<?php

namespace Database\Factories;

use App\Models\PertanyaanLowongan;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model PertanyaanLowongan
class PertanyaanLowonganFactory extends Factory
{
    protected $model = PertanyaanLowongan::class;

    public function definition(): array
    {
        return [
            'id_lowongan' => LowonganFactory::new(),
            'pertanyaan' => $this->faker->sentence() . '?',
            'tipe_jawaban' => 'Teks',
        ];
    }
}
