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
        Schema::create('master_hak_akses_menu', function (Blueprint $table) {
            $table->string('kd_hak_akses_menu')->primary();
            $table->string('kd_user');
            $table->string('kd_menu');
            $table->enum('bisa_lihat', ['YA', 'TIDAK'])->default('YA');
            $table->enum('bisa_insert', ['YA', 'TIDAK'])->default('TIDAK');
            $table->enum('bisa_edit', ['YA', 'TIDAK'])->default('TIDAK');
            $table->enum('bisa_hapus', ['YA', 'TIDAK'])->default('TIDAK');
            $table->enum('bisa_export', ['YA', 'TIDAK'])->default('TIDAK');
            $table->enum('status_akses', ['YA', 'TIDAK'])->default('YA');
            $table->date('tgl_input');
            $table->string('bln_input', 2);
            $table->string('thn_input', 4);
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();

            $table->foreign('kd_user')
                ->references('kd_user')
                ->on('tbl_user')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('kd_menu')
                ->references('kd_menu')
                ->on('master_menu')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_hak_akses_menu');
    }
};
