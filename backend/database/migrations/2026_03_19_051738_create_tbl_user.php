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
        Schema::create('tbl_user', function (Blueprint $table) {
            $table->string('kd_user', 50)->primary();
            $table->string('user_name', 100)->unique();
            $table->string('password', 255);
            $table->string('password_tampil', 255);
            $table->string('status_user', 20);
            $table->string('blokir', 10)->default('TIDAK');
            $table->unsignedBigInteger('level_user_id');
            $table->string('img_user', 255)->nullable();
            $table->string('format_img_user', 20)->nullable();
            $table->date('tgl_input');
            $table->time('waktu_input');

            $table->foreign('level_user_id')->references('id')->on('tbl_level_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_user');
    }
};
