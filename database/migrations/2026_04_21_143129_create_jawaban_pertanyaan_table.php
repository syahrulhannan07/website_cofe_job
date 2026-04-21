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
        Schema::create('jawaban_pertanyaan', function (Blueprint $table) {
            $table->id('id_jawaban');
            $table->unsignedBigInteger('id_lamaran');
            $table->unsignedBigInteger('id_pertanyaan');
            $table->text('jawaban');
            $table->timestamps();

            // Foreign Keys
            $table->foreign('id_lamaran')->references('id_lamaran')->on('lamaran')->onDelete('cascade');
            $table->foreign('id_pertanyaan')->references('id_pertanyaan')->on('pertanyaan_lowongan')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_lamaran');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jawaban_pertanyaan');
    }
};
