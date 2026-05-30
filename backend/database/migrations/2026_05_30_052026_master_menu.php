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
        Schema::create('master_menu', function (Blueprint $table) {
            $table->string('kd_menu')->primary();
            $table->string('kd_module');
            $table->string('parent_menu')->nullable();
            $table->string('nama_menu');
            $table->string('icon_menu')->nullable();
            $table->string('url_menu')->nullable();
            $table->integer('urutan')->default(0);
            $table->enum('status_akses', ['AKTIF', 'TIDAK'])->default('AKTIF');
            $table->date('tgl_input');
            $table->string('bln_input', 2);
            $table->string('thn_input', 4);
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();

            $table->foreign('kd_module')
                ->references('kd_module')
                ->on('master_module')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });

        Schema::table('master_menu', function (Blueprint $table) {
            $table->foreign('parent_menu')
                ->references('kd_menu')
                ->on('master_menu')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_menu', function (Blueprint $table) {
            $table->dropForeign(['parent_menu']);
        });

        Schema::dropIfExists('master_menu');
    }
};
