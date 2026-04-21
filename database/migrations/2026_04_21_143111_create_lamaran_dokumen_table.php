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
        Schema::create('lamaran_dokumen', function (Blueprint $table) {
            $table->id('id_lamaran_dokumen');
            $table->unsignedBigInteger('id_lamaran');
            $table->unsignedBigInteger('id_jenis_dokumen');
            $table->string('lokasi_file');
            $table->timestamps();

            // Foreign Keys
            $table->foreign('id_lamaran')->references('id_lamaran')->on('lamaran')->onDelete('cascade');
            $table->foreign('id_jenis_dokumen')->references('id_jenis_dokumen')->on('jenis_dokumen')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_lamaran');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lamaran_dokumen');
    }
};
