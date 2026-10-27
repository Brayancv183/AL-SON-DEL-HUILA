<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ===== Catálogos =====
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
        });

        Schema::create('municipios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
        });

        Schema::create('entornos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
        });

        Schema::create('etiquetas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
        });

        Schema::create('tipos_viajero', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
        });

        // ===== Destinos =====
        Schema::create('destinos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('imagen', 255)->nullable();
            $table->decimal('latitud', 10, 8);
            $table->decimal('longitud', 11, 8);
            $table->foreignId('categoria_id')->constrained('categorias');
            $table->foreignId('municipio_id')->constrained('municipios');
            $table->foreignId('entorno_id')->nullable()->constrained('entornos');
            $table->string('direccion', 255)->nullable();
            $table->string('horario', 100)->nullable();
            $table->decimal('precio_entrada', 10, 2)->nullable();
            $table->boolean('accesibilidad')->default(false);
            $table->decimal('rating_promedio', 3, 2)->default(0);
            $table->integer('total_reseñas')->default(0);
            $table->boolean('estado')->default(true);
            $table->dateTime('fecha_creacion')->nullable()->useCurrent();

            $table->index(['latitud', 'longitud']);
            $table->index('categoria_id');
            $table->index('municipio_id');
            $table->index('accesibilidad');
        });

        // ===== Pivotes (nombres usados por los modelos de Eloquent) =====
        Schema::create('destinos_etiquetas', function (Blueprint $table) {
            $table->foreignId('destino_id')->constrained('destinos')->cascadeOnDelete();
            $table->foreignId('etiqueta_id')->constrained('etiquetas')->cascadeOnDelete();
            $table->primary(['destino_id', 'etiqueta_id']);
        });

        Schema::create('destinos_tipos_viajero', function (Blueprint $table) {
            $table->foreignId('destino_id')->constrained('destinos')->cascadeOnDelete();
            $table->foreignId('tipo_viajero_id')->constrained('tipos_viajero')->cascadeOnDelete();
            $table->primary(['destino_id', 'tipo_viajero_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destinos_tipos_viajero');
        Schema::dropIfExists('destinos_etiquetas');
        Schema::dropIfExists('destinos');
        Schema::dropIfExists('tipos_viajero');
        Schema::dropIfExists('etiquetas');
        Schema::dropIfExists('entornos');
        Schema::dropIfExists('municipios');
        Schema::dropIfExists('categorias');
    }
};
