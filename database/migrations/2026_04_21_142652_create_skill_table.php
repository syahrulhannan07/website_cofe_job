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
        Schema::create('skill', function (Blueprint $table) {
            $table->id('id_skill');
            $table->unsignedBigInteger('id_profil');
            $table->string('nama_skill');
            $table->text('deskripsi')->nullable();
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_profil')->references('id_profil')->on('profil_pelamar')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_profil');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill');
    }
};
