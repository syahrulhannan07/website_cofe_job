<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deteksi_log', function (Blueprint $table) {
            $table->id('id_deteksi');
            $table->unsignedBigInteger('id_pengguna');
            $table->unsignedBigInteger('id_lowongan')->nullable();
            $table->integer('skor_total')->default(0);
            $table->enum('tindakan', ['aman', 'flagged', 'warning', 'suspended'])->default('aman');
            $table->json('detail_signal')->nullable();
            $table->text('catatan')->nullable();
            $table->string('dieksekusi_oleh')->default('system');
            $table->timestamp('dibuat_pada')->useCurrent();

            $table->foreign('id_pengguna')->references('id_pengguna')->on('pengguna')->onDelete('cascade');
            $table->foreign('id_lowongan')->references('id_lowongan')->on('lowongan')->onDelete('set null');
            $table->index(['id_pengguna', 'dibuat_pada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deteksi_log');
    }
};
