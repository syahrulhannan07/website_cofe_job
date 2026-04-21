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
        Schema::create('pendidikan', function (Blueprint $table) {
            $table->id('id_pendidikan');
            $table->unsignedBigInteger('id_profil');
            $table->string('institusi');
            $table->string('jurusan');
            $table->string('tingkat');
            $table->date('tahun_mulai');
            $table->date('tahun_selesai')->nullable();
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_profil')->references('id_profil')->on('profil_pelamar')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_profil');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pendidikan');
    }
};
