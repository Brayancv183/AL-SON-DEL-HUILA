<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('publicacion_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('publicacion_id')->constrained('publicaciones')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['usuario_id', 'publicacion_id']); // Evita likes duplicados
        });
    }

    public function down()
    {
        Schema::dropIfExists('publicacion_likes');
    }
};