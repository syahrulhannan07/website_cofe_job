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
        Schema::create('lowongan_dokumen', function (Blueprint $table) {
            $table->id('id_lowongan_dokumen');
            $table->unsignedBigInteger('id_lowongan');
            $table->unsignedBigInteger('id_jenis_dokumen');
            $table->boolean('wajib')->default(true);
            $table->timestamps();

            // Foreign Keys
            $table->foreign('id_lowongan')->references('id_lowongan')->on('lowongan')->onDelete('cascade');
            $table->foreign('id_jenis_dokumen')->references('id_jenis_dokumen')->on('jenis_dokumen')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_lowongan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lowongan_dokumen');
    }
};
