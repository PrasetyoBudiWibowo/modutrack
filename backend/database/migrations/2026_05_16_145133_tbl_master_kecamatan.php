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
        Schema::create('tbl_master_kecamatan', function (Blueprint $table) {
            $table->string('kd_kecamatan')->primary();
            $table->string('id_kecamatan')->unique();
            $table->string('kd_kabupaten_kota')->nullable();
            $table->string('regency_id')->nullable();
            $table->string('nama_kecamatan');
            $table->enum('status_tampil', ['YA', 'TIDAK'])->default('YA');
            $table->date('tgl_input');
            $table->string('bln_input', 2);
            $table->string('thn_input', 4);
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();

            $table->foreign('kd_kabupaten_kota')
                ->references('kd_kabupaten_kota')
                ->on('tbl_master_kabupaten_kota')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_master_kecamatan');
    }
};
