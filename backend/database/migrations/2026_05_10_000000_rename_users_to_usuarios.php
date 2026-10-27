<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Renombra la tabla users (Laravel por defecto) a usuarios
     * y la columna name a nombre, igualando el esquema real del proyecto.
     */
    public function up(): void
    {
        Schema::rename('users', 'usuarios');
        Schema::table('usuarios', function (Blueprint $table) {
            $table->renameColumn('name', 'nombre');
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->renameColumn('nombre', 'name');
        });
        Schema::rename('usuarios', 'users');
    }
};
