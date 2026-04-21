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
        Schema::create('wawancara', function (Blueprint $table) {
            $table->id('id_wawancara');
            $table->unsignedBigInteger('id_lamaran');
            $table->dateTime('tanggal_wawancara');
            $table->string('lokasi');
            $table->text('catatan')->nullable();
            $table->enum('status', ['Terjadwal', 'Selesai', 'Dibatalkan'])->default('Terjadwal');
            $table->timestamps();

            // Foreign Key
            $table->foreign('id_lamaran')->references('id_lamaran')->on('lamaran')->onDelete('cascade');

            // Index tambahan sesuai permintaan
            $table->index('id_lamaran');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wawancara');
    }
};
