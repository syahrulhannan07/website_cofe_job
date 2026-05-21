<?php

namespace Database\Factories;

use App\Models\LowonganDokumen;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model LowonganDokumen
class LowonganDokumenFactory extends Factory
{
    protected $model = LowonganDokumen::class;

    public function definition(): array
    {
        return [
            'id_lowongan' => LowonganFactory::new(),
            'id_jenis_dokumen' => JenisDokumenFactory::new(),
            'wajib' => 1,
        ];
    }
}
