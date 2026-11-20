<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_perusahaan', function (Blueprint $table) {
            $table->foreign('kd_provinsi')->references('kd_provinsi')->on('tbl_master_provinsi')
                ->onUpdate('cascade')->onDelete('restrict');

            $table->foreign('kd_kabupaten_kota')->references('kd_kabupaten_kota')->on('tbl_master_kabupaten_kota')
                ->onUpdate('cascade')->onDelete('restrict');

            $table->foreign('kd_kecamatan')->references('kd_kecamatan')->on('tbl_master_kecamatan')
                ->onUpdate('cascade')->onDelete('restrict');

            $table->foreign('kd_village')->references('kd_village')->on('tbl_master_village')
                ->onUpdate('cascade')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::table('master_perusahaan', function (Blueprint $table) {
            $table->dropForeign(['kd_provinsi']);
            $table->dropForeign(['kd_kabupaten_kota']);
            $table->dropForeign(['kd_kecamatan']);
            $table->dropForeign(['kd_village']);
        });
    }
};
