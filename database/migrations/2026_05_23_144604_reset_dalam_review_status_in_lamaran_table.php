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
        // Reset any existing lamaran that has status 'Dalam Review' back to 'Diproses'
        DB::table('lamaran')->where('status', 'Dalam Review')->update(['status' => 'Diproses']);

        if (DB::getDriverName() !== 'sqlite') {
            // Alter the column enum to remove 'Dalam Review'
            DB::statement("ALTER TABLE lamaran MODIFY status ENUM('Diproses', 'Wawancara', 'Diterima', 'Ditolak') DEFAULT 'Diproses'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE lamaran MODIFY status ENUM('Diproses', 'Dalam Review', 'Wawancara', 'Diterima', 'Ditolak') DEFAULT 'Diproses'");
        }
    }
};
