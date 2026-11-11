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
        Schema::table('nib', function (Blueprint $table) {
            $table->string('status_proses_screening')->default('Belum_Dimulai')->after('status_screening');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nib', function (Blueprint $table) {
            $table->dropColumn('status_proses_screening');
        });
    }
};
