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
        Schema::create('manster_hak_akses_module', function (Blueprint $table) {
            $table->string('kd_hak_akses_module')->primary();
            $table->string('kd_user');
            $table->string('kd_module');
            $table->enum('status_akses', ['YA', 'TIDAK'])->default('YA');
            $table->date('tgl_input');
            $table->string('bln_input', 2);
            $table->string('thn_input', 4);
            $table->time('waktu_input');
            $table->string('user_input');

            $table->foreign('kd_user')
                ->references('kd_user')
                ->on('tbl_user')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('kd_module')
                ->references('kd_module')
                ->on('master_module')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manster_hak_akses_module');
    }
};
