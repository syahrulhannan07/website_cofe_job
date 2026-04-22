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
        Schema::table('pengguna', function (Blueprint $table) {
            $table->enum('status_akun', ['Aktif', 'Nonaktif', 'Diblokir'])->default('Aktif')->after('peran');
        });

        Schema::table('profil_perusahaan', function (Blueprint $table) {
            $table->text('alasan_penolakan')->nullable()->after('status_verifikasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn('status_akun');
        });

        Schema::table('profil_perusahaan', function (Blueprint $table) {
            $table->dropColumn('alasan_penolakan');
        });
    }
};
