<?php

namespace Database\Factories;

use App\Models\Wawancara;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model Wawancara
class WawancaraFactory extends Factory
{
    protected $model = Wawancara::class;

    public function definition(): array
    {
        return [
            'id_lamaran' => LamaranFactory::new(),
            'tanggal_wawancara' => now()->addDays(2),
            'lokasi' => $this->faker->address(),
            'catatan' => $this->faker->sentence(),
            'status' => 'Pending',
        ];
    }
}
