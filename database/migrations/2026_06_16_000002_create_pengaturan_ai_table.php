<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaturan_ai', function (Blueprint $table) {
            $table->id();
            $table->string('kunci')->unique();
            $table->string('nilai');
            $table->timestamp('diperbarui_pada')->useCurrent()->useCurrentOnUpdate();
        });

        DB::table('pengaturan_ai')->insert([
            ['kunci' => 'threshold_flagged', 'nilai' => '35'],
            ['kunci' => 'threshold_warning', 'nilai' => '65'],
            ['kunci' => 'threshold_suspend', 'nilai' => '100'],
            ['kunci' => 'bobot_tinggi',      'nilai' => '30'],
            ['kunci' => 'bobot_sedang',      'nilai' => '15'],
            ['kunci' => 'bobot_rendah',      'nilai' => '5'],
            ['kunci' => 'penalty_riwayat',   'nilai' => '20'],
            ['kunci' => 'deskripsi_min_char','nilai' => '100'],
            ['kunci' => 'persyaratan_min_char','nilai' => '30'],
            ['kunci' => 'interval_sweep_jam','nilai' => '6'],
            ['kunci' => 'akun_min_hari',     'nilai' => '7'],
            ['kunci' => 'lonjakan_maks_per_hari','nilai' => '3'],
            ['kunci' => 'rentang_maks_hari', 'nilai' => '90'],
            ['kunci' => 'rentang_min_hari',  'nilai' => '3'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan_ai');
    }
};
