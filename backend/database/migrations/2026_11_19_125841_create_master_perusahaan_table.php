<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_perusahaan', function (Blueprint $table) {
            // Identitas
            $table->string('kd_perusahaan')->primary();
            $table->string('kode_cabang', 30);
            $table->string('nama', 150);
            $table->string('singkatan', 30)->nullable();
            $table->string('kd_tipe_perusahaan');
            $table->string('kd_induk')->nullable();
            $table->enum('badan_hukum_sendiri', ['YA', 'TIDAK'])->default('TIDAK');
            $table->string('nama_badan_hukum', 150)->nullable();
            $table->string('npwp', 25)->nullable();
            $table->string('no_akta', 60)->nullable();
            $table->string('kd_provinsi')->nullable();
            $table->string('kd_kabupaten_kota')->nullable();
            $table->string('kd_kecamatan')->nullable();
            $table->enum('mode_desa', ['PILIH', 'MANUAL'])->nullable();
            $table->string('kd_village')->nullable();          // mode PILIH
            $table->string('nama_desa_manual', 150)->nullable(); // mode MANUAL
            $table->text('alamat_rinci')->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->string('telepon', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->date('tgl_berdiri')->nullable();
            $table->date('tgl_tutup')->nullable();
            $table->enum('status', ['AKTIF', 'TIDAK'])->default('AKTIF');
            $table->date('tgl_input');
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();
            $table->foreign('kd_tipe_perusahaan')->references('kd_tipe_perusahaan')->on('master_tipe_perusahaan')
                ->onUpdate('cascade')->onDelete('restrict');
            $table->index('kd_induk');
            $table->index('kd_tipe_perusahaan');
            $table->index('kd_provinsi');
            $table->index('kd_kabupaten_kota');
            $table->index('kd_kecamatan');
            $table->index('kd_village');
            $table->index('status');
        });

        Schema::table('master_perusahaan', function (Blueprint $table) {
            $table->foreign('kd_induk')->references('kd_perusahaan')->on('master_perusahaan')
                ->onUpdate('cascade')->onDelete('restrict');
        });

        DB::statement('CREATE UNIQUE INDEX master_perusahaan_satu_akar ON master_perusahaan ((true)) WHERE kd_induk IS NULL');

        DB::statement('CREATE UNIQUE INDEX master_perusahaan_kode_cabang_unique ON master_perusahaan (LOWER(kode_cabang))');

        DB::statement("ALTER TABLE master_perusahaan ADD CONSTRAINT master_perusahaan_kode_cabang_format
            CHECK (kode_cabang ~ '^[A-Za-z0-9-]+$')");

        DB::statement('ALTER TABLE master_perusahaan ADD CONSTRAINT master_perusahaan_bukan_induk_sendiri
            CHECK (kd_induk IS NULL OR kd_induk <> kd_perusahaan)');

        DB::statement("ALTER TABLE master_perusahaan ADD CONSTRAINT master_perusahaan_akar_berbadan_hukum
            CHECK (kd_induk IS NOT NULL OR badan_hukum_sendiri = 'YA')");

        DB::statement("ALTER TABLE master_perusahaan ADD CONSTRAINT master_perusahaan_legal_konsisten
            CHECK (badan_hukum_sendiri = 'YA'
                OR (nama_badan_hukum IS NULL AND npwp IS NULL AND no_akta IS NULL))");

        DB::statement("ALTER TABLE master_perusahaan ADD CONSTRAINT master_perusahaan_alamat_konsisten CHECK (
            (kd_provinsi IS NULL AND kd_kabupaten_kota IS NULL AND kd_kecamatan IS NULL
                AND mode_desa IS NULL AND kd_village IS NULL AND nama_desa_manual IS NULL)
            OR (kd_provinsi IS NOT NULL AND kd_kabupaten_kota IS NOT NULL AND kd_kecamatan IS NOT NULL
                AND (
                    (mode_desa = 'PILIH' AND kd_village IS NOT NULL AND nama_desa_manual IS NULL)
                    OR (mode_desa = 'MANUAL' AND kd_village IS NULL AND nama_desa_manual IS NOT NULL)
                ))
        )");

        DB::statement('ALTER TABLE master_perusahaan ADD CONSTRAINT master_perusahaan_tanggal_wajar
            CHECK (tgl_berdiri IS NULL OR tgl_tutup IS NULL OR tgl_tutup >= tgl_berdiri)');
    }

    public function down(): void
    {
        Schema::dropIfExists('master_perusahaan');
    }
};
