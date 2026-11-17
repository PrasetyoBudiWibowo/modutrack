<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_user_blokir', function (Blueprint $table) {
            $table->string('kd_blokir')->primary();
            $table->string('kd_user');
            $table->enum('jenis', ['SEMENTARA', 'PERMANEN']);
            $table->text('alasan');
            $table->timestamp('mulai_at');
            $table->timestamp('selesai_at')->nullable();      // kosong untuk permanen
            $table->enum('status', ['AKTIF', 'BERAKHIR', 'DICABUT'])->default('AKTIF');
            $table->timestamp('dicabut_at')->nullable();
            $table->string('dicabut_oleh')->nullable();
            $table->text('alasan_cabut')->nullable();

            $table->date('tgl_input');
            $table->string('bln_input', 2);
            $table->string('thn_input', 4);
            $table->time('waktu_input');
            $table->string('user_input');
            $table->text('alamat_device')->nullable();
            $table->string('type_device')->nullable();
            $table->string('device')->nullable();

            $table->foreign('kd_user')->references('kd_user')->on('tbl_user')
                ->onUpdate('cascade')->onDelete('cascade');

            $table->index(['kd_user', 'status']);
        });

        DB::statement("CREATE UNIQUE INDEX tbl_user_blokir_satu_aktif ON tbl_user_blokir (kd_user) WHERE status = 'AKTIF'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_user_blokir');
    }
};
