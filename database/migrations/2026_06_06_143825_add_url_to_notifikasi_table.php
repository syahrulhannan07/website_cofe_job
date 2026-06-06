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
        // Lakukan pengecekan apakah kolom 'url' belum ada
        if (!Schema::hasColumn('notifikasi', 'url')) {
            Schema::table('notifikasi', function (Blueprint $table) {
                $table->string('url')->nullable(); // sesuaikan dengan tipe data asli kamu
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropColumn('url');
        });
    }
};
