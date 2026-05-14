<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('publicaciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id'); // ← coincide con int(11) sin unsigned
            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->string('imagen');
            $table->string('descripcion')->nullable();
            $table->string('ubicacion')->nullable();
            $table->integer('likes')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('publicaciones');
    }
};