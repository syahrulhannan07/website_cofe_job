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
        Schema::create('lowongan', function (Blueprint $table) {
            $table->id('id_lowongan');
            $table->unsignedBigInteger('id_perusahaan');
            $table->string('posisi');
            $table->text('deskripsi');
            $table->text('persyaratan');
            $table->date('batas_awal');
            $table->date('batas_akhir');
            $table->enum('status', ['Draft', 'Aktif', 'Ditutup'])->default('Draft');
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_perusahaan')->references('id_perusahaan')->on('profil_perusahaan')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_lowongan');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lowongan');
    }
};
