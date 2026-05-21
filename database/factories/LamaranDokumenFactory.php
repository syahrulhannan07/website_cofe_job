<?php

namespace Database\Factories;

use App\Models\LamaranDokumen;
use Illuminate\Database\Eloquent\Factories\Factory;

// [UPDATE LOGIC] - Factory untuk model LamaranDokumen
class LamaranDokumenFactory extends Factory
{
    protected $model = LamaranDokumen::class;

    public function definition(): array
    {
        return [
            'id_lamaran' => LamaranFactory::new(),
            'id_jenis_dokumen' => JenisDokumenFactory::new(),
            'lokasi_file' => 'lamaran/dokumen_test.pdf',
        ];
    }
}
