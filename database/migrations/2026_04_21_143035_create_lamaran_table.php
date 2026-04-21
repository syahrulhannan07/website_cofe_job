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
        Schema::create('lamaran', function (Blueprint $table) {
            $table->id('id_lamaran');
            $table->unsignedBigInteger('id_lowongan');
            $table->unsignedBigInteger('id_profil');
            $table->enum('status', ['Diproses', 'Wawancara', 'Diterima', 'Ditolak'])->default('Diproses');
            $table->timestamps();

            // Foreign Keys
            $table->foreign('id_lowongan')->references('id_lowongan')->on('lowongan')->onDelete('cascade');
            $table->foreign('id_profil')->references('id_profil')->on('profil_pelamar')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_lowongan');
            $table->index('id_profil');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lamaran');
    }
};
