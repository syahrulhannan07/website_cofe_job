<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            // Modify the ENUM directly using DB statement because doctrine/dbal has issues with ENUMs sometimes
            DB::statement("ALTER TABLE lamaran MODIFY status ENUM('Diproses', 'Dalam Review', 'Wawancara', 'Diterima', 'Ditolak') DEFAULT 'Diproses'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            // Revert back
            // Warning: if there are rows with 'Dalam Review', this might fail or truncate data
            DB::statement("ALTER TABLE lamaran MODIFY status ENUM('Diproses', 'Wawancara', 'Diterima', 'Ditolak') DEFAULT 'Diproses'");
        }
    }
};
