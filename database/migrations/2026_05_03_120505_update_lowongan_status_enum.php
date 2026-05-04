<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Ubah kolom menjadi string sementara agar tidak error saat update data
        Schema::table('lowongan', function (Blueprint $table) {
            $table->string('status')->change();
        });

        // 2. Update data lama ke format baru
        DB::table('lowongan')->where('status', 'Aktif')->update(['status' => 'Active']);
        DB::table('lowongan')->where('status', 'Ditutup')->update(['status' => 'Closed']);

        // 3. Kembalikan ke ENUM dengan format baru
        Schema::table('lowongan', function (Blueprint $table) {
            $table->enum('status', ['Draft', 'Active', 'Closed'])->default('Draft')->change();
        });
    }

    public function down(): void
    {
        Schema::table('lowongan', function (Blueprint $table) {
            $table->string('status')->change();
        });

        DB::table('lowongan')->where('status', 'Active')->update(['status' => 'Aktif']);
        DB::table('lowongan')->where('status', 'Closed')->update(['status' => 'Ditutup']);

        Schema::table('lowongan', function (Blueprint $table) {
            $table->enum('status', ['Draft', 'Aktif', 'Ditutup'])->default('Draft')->change();
        });
    }
};
