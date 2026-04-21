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
        Schema::create('profil_pelamar', function (Blueprint $table) {
            $table->id('id_profil');
            $table->unsignedBigInteger('id_pengguna');
            $table->string('foto_profil')->nullable();
            $table->string('nama_lengkap');
            $table->text('tentang_saya')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('nomor_telepon')->nullable();
            $table->text('alamat')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_pengguna')->references('id_pengguna')->on('pengguna')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_pengguna');
            $table->index('id_profil');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profil_pelamar');
    }
};
