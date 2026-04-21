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
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id('id_notifikasi');
            $table->unsignedBigInteger('id_pengguna');
            $table->string('judul');
            $table->text('pesan');
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_pengguna')->references('id_pengguna')->on('pengguna')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_pengguna');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
    }
};
