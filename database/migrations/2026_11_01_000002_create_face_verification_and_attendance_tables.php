<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_wajah', function (Blueprint $table) {
            $table->id('id_data_wajah');
            $table->foreignId('id_profil')->unique()->constrained('profil_pelamar', 'id_profil')->cascadeOnDelete();
            $table->string('referensi_wajah');
            $table->timestamps();
        });

        Schema::create('verifikasi_wajah', function (Blueprint $table) {
            $table->id('id_verifikasi');
            $table->foreignId('id_pengguna')->constrained('pengguna', 'id_pengguna')->cascadeOnDelete();
            $table->foreignId('id_lamaran')->nullable()->constrained('lamaran', 'id_lamaran')->cascadeOnDelete();
            $table->foreignId('id_wawancara')->nullable()->constrained('wawancara', 'id_wawancara')->cascadeOnDelete();
            $table->string('jenis_verifikasi', 30);
            $table->decimal('skor_kemiripan', 6, 2)->nullable();
            $table->decimal('ambang_batas', 6, 2)->nullable();
            $table->string('status_verifikasi', 30);
            $table->string('referensi_wajah');
            $table->dateTime('jadwal_wawancara')->nullable();
            $table->timestamps();
            $table->index(['id_lamaran', 'id_pengguna', 'jenis_verifikasi'], 'verifikasi_lamaran_pengguna_jenis');
        });

        Schema::create('presensi_wawancara', function (Blueprint $table) {
            $table->id('id_presensi');
            $table->foreignId('id_wawancara')->unique()->constrained('wawancara', 'id_wawancara')->cascadeOnDelete();
            $table->foreignId('id_pengguna')->constrained('pengguna', 'id_pengguna')->cascadeOnDelete();
            $table->foreignId('id_verifikasi_wajah')->unique()->constrained('verifikasi_wajah', 'id_verifikasi')->cascadeOnDelete();
            $table->dateTime('waktu_presensi');
            $table->string('status_kehadiran', 30);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensi_wawancara');
        Schema::dropIfExists('verifikasi_wajah');
        Schema::dropIfExists('data_wajah');
    }
};
