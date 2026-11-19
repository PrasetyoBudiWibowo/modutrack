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
        Schema::create('master_jenis_riwayat_perusahaan', function (Blueprint $table) {
            $table->string('kd_jenis_riwayat')->primary();
            $table->string('kode', 40);
            $table->string('nama', 100);
            $table->text('keterangan')->nullable();
            $table->enum('otomatis', ['YA', 'TIDAK'])->default('TIDAK'); // YA = dicatat sistem
            $table->enum('status', ['AKTIF', 'TIDAK'])->default('AKTIF');

            $table->date('tgl_input');
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();
        });

        DB::statement('CREATE UNIQUE INDEX master_jenis_riwayat_perusahaan_kode_unique ON master_jenis_riwayat_perusahaan (LOWER(kode))');
        DB::statement("ALTER TABLE master_jenis_riwayat_perusahaan ADD CONSTRAINT master_jenis_riwayat_perusahaan_kode_format
            CHECK (kode ~ '^[A-Z0-9_]+$')");

        DB::statement("ALTER TABLE master_jenis_riwayat_perusahaan ADD CONSTRAINT master_jenis_riwayat_perusahaan_otomatis_aktif
            CHECK (otomatis = 'TIDAK' OR status = 'AKTIF')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_jenis_riwayat_perusahaan');
    }
};
