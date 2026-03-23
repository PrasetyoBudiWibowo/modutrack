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
        Schema::table('tbl_user', function (Blueprint $table) {
            $table->string('email', 150)->nullable()->after('user_name');
            $table->date('tgl_login_terakhir')->nullable()->after('format_img_user');
            $table->time('waktu_login_terakhir')->nullable()->after('tgl_login_terakhir');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_user', function (Blueprint $table) {
            $table->dropColumn([
                'email',
                'tgl_login_terakhir',
                'waktu_login_terakhir'
            ]);
        });
    }
};
