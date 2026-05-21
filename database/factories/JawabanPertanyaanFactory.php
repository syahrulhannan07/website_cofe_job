<?php

namespace Database\Factories;

use App\Models\JawabanPertanyaan;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model JawabanPertanyaan
class JawabanPertanyaanFactory extends Factory
{
    protected $model = JawabanPertanyaan::class;

    public function definition(): array
    {
        return [
            'id_lamaran' => LamaranFactory::new(),
            'id_pertanyaan' => PertanyaanLowonganFactory::new(),
            'jawaban' => $this->faker->sentence(),
        ];
    }
}
