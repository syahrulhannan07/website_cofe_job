<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nib', function (Blueprint $table) {
            $table->id('id_nib');
            $table->unsignedBigInteger('id_perusahaan')->unique();
            $table->string('nomor_nib')->nullable();
            $table->string('dokumen_nib')->nullable();
            $table->json('data_qr')->nullable();
            $table->text('hasil_screening')->nullable();
            $table->enum('status_screening', [
                'Belum_Diperiksa',
                'Lulus',
                'Ditolak',
                'Perlu_Review'
            ])->default('Belum_Diperiksa');
            $table->timestamp('diperiksa_pada')->nullable();
            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_perusahaan')
                ->references('id_perusahaan')
                ->on('profil_perusahaan')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nib');
    }
};