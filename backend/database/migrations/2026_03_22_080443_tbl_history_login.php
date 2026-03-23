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
        Schema::create('tbl_history_login', function (Blueprint $table) {
            $table->string('kd_history_login', 50)->primary();

            $table->string('kd_user');
            $table->string('user_name');

            $table->date('tgl_login');
            $table->time('waktu_login');

            $table->string('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();

            $table->foreign('kd_user')
                ->references('kd_user')
                ->on('tbl_user')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_history_login');
    }
};
