<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profil_perusahaan', function (Blueprint $table) {
            $table->id('id_perusahaan');
            $table->unsignedBigInteger('id_pengguna');
            $table->string('logo_perusahaan')->nullable();
            $table->string('nama_perusahaan')->nullable();
            $table->text('alamat_perusahaan')->nullable();
            $table->string('dokumen_izin')->nullable();
            $table->text('deskripsi')->nullable();
            $table->enum('status_verifikasi', ['Pending', 'Diterima', 'Ditolak'])->default('Pending');
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_pengguna')->references('id_pengguna')->on('pengguna')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_pengguna');
            $table->index('status_verifikasi');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profil_perusahaan');
    }
};
