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
        Schema::create('master_tipe_perusahaan', function (Blueprint $table) {
            $table->string('kd_tipe_perusahaan')->primary();
            $table->string('nama', 100);
            $table->enum('boleh_badan_hukum', ['YA', 'TIDAK'])->default('TIDAK');
            $table->enum('status', ['AKTIF', 'TIDAK'])->default('AKTIF');

            $table->date('tgl_input');
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();
        });

        DB::statement('CREATE UNIQUE INDEX master_tipe_perusahaan_nama_unique ON master_tipe_perusahaan (LOWER(nama))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_tipe_perusahaan');
    }
};
