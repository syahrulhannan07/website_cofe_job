<?php

namespace Database\Factories;

use App\Models\JenisDokumen;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model JenisDokumen
class JenisDokumenFactory extends Factory
{
    protected $model = JenisDokumen::class;

    public function definition(): array
    {
        return [
            'nama_dokumen' => $this->faker->word() . ' Document',
            'keterangan' => $this->faker->sentence(),
        ];
    }
}
