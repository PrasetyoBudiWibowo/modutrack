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
        Schema::create('riwayat_perusahaan', function (Blueprint $table) {
            $table->string('kd_riwayat_perusahaan')->primary();
            $table->string('kd_perusahaan');
            $table->string('kd_jenis_riwayat');
            $table->jsonb('nilai_lama')->nullable();
            $table->jsonb('nilai_baru')->nullable();
            $table->date('tgl_berlaku');
            $table->text('alasan')->nullable();

            $table->date('tgl_input');
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();

            $table->foreign('kd_perusahaan')->references('kd_perusahaan')->on('master_perusahaan')
                ->onUpdate('cascade')->onDelete('restrict');
            $table->foreign('kd_jenis_riwayat')->references('kd_jenis_riwayat')->on('master_jenis_riwayat_perusahaan')
                ->onUpdate('cascade')->onDelete('restrict');

            $table->index(['kd_perusahaan', 'tgl_berlaku']);
            $table->index('kd_jenis_riwayat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_perusahaan');
    }
};
