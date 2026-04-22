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
        Schema::create('log_status_lamaran', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_lamaran');
            $table->string('status_lama')->nullable();
            $table->string('status_baru');
            $table->text('keterangan')->nullable();
            $table->timestamp('dibuat_pada')->useCurrent();

            // Foreign Key
            $table->foreign('id_lamaran')->references('id_lamaran')->on('lamaran')->onDelete('cascade');

            // Index
            $table->index('id_lamaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_status_lamaran');
    }
};
