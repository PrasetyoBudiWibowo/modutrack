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
        Schema::create('master_module', function (Blueprint $table) {
            $table->string('kd_module')->primary();
            $table->string('nama_module');
            $table->string('icon_module')->nullable();
            $table->string('url_module')->nullable();
            $table->integer('urutan')->default(0);
            $table->enum('status_module', ['AKTIF', 'TIDAK'])->default('AKTIF');
            $table->date('tgl_input');
            $table->string('bln_input', 2);
            $table->string('thn_input', 4);
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_module');
    }
};
