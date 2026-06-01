<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            // Menambahkan kolom fcm_token (nullable karena saat daftar awal token belum ada)
            $table->string('fcm_token')->nullable()->after('status_akun');
        });
    }

    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn('fcm_token');
        });
    }
};