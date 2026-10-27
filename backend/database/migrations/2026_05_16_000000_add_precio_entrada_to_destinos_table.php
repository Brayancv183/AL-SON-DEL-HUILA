<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega precio_entrada a destinos en bases de datos existentes
     * (las cargadas desde los dumps .sql). En migrate:fresh la columna
     * ya viene creada por create_tablas_turisticas, por eso el guard.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('destinos', 'precio_entrada')) {
            Schema::table('destinos', function (Blueprint $table) {
                $table->decimal('precio_entrada', 10, 2)->nullable()->after('horario');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('destinos', 'precio_entrada')) {
            Schema::table('destinos', function (Blueprint $table) {
                $table->dropColumn('precio_entrada');
            });
        }
    }
};
