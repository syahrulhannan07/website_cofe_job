<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UpdateTanggalBerdiriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $perusahaans = \App\Models\ProfilPerusahaan::all();
        $years = range(2010, 2023);
        $months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        foreach ($perusahaans as $perusahaan) {
            $randomYear = $years[array_rand($years)];
            $randomMonth = $months[array_rand($months)];
            $randomDay = rand(1, 28);
            
            $perusahaan->update([
                'tanggal_berdiri' => "$randomDay $randomMonth $randomYear"
            ]);
        }
    }
}
