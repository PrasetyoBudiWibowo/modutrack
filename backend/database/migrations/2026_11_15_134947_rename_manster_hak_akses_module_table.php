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
        if (Schema::hasTable('manster_hak_akses_module') && !Schema::hasTable('master_hak_akses_module')) {
            Schema::rename('manster_hak_akses_module', 'master_hak_akses_module');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('master_hak_akses_module') && !Schema::hasTable('manster_hak_akses_module')) {
            Schema::rename('master_hak_akses_module', 'manster_hak_akses_module');
        }
    }
};
