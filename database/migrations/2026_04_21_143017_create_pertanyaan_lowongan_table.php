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
        Schema::create('pertanyaan_lowongan', function (Blueprint $table) {
            $table->id('id_pertanyaan');
            $table->unsignedBigInteger('id_lowongan');
            $table->text('pertanyaan');
            $table->string('tipe_jawaban');
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_lowongan')->references('id_lowongan')->on('lowongan')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_lowongan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pertanyaan_lowongan');
    }
};
