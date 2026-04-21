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
        Schema::create('pengguna', function (Blueprint $table) {
            $table->id('id_pengguna');
            $table->string('nama_pengguna');
            $table->string('email')->unique();
            $table->string('kata_sandi');
            $table->enum('peran', ['Pelamar', 'Admin_Perusahaan', 'Super_Admin']);
            $table->timestamps();

            // Index tambahan sesuai permintaan
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengguna');
    }
};
