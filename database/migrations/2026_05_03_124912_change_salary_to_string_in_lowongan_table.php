<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lowongan', function (Blueprint $table) {
            $table->dropColumn(['gaji_min', 'gaji_max']);
            $table->string('gaji')->nullable()->after('lokasi');
        });
    }

    public function down(): void
    {
        Schema::table('lowongan', function (Blueprint $table) {
            $table->dropColumn('gaji');
            $table->decimal('gaji_min', 15, 2)->nullable()->after('lokasi');
            $table->decimal('gaji_max', 15, 2)->nullable()->after('gaji_min');
        });
    }
};
