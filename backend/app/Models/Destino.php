<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Destino extends Model
{
    protected $table    = 'destinos';
    public    $timestamps = false;

    protected $fillable = [
        'nombre', 'descripcion', 'imagen',
        'latitud', 'longitud',
        'categoria_id', 'municipio_id', 'entorno_id',
        'direccion', 'horario', 'estado'
    ];

    // Relaciones
    public function categoria() {
        return $this->belongsTo(Categoria::class);
    }

    public function municipio() {
        return $this->belongsTo(Municipio::class);
    }

    public function entorno() {
        return $this->belongsTo(Entorno::class);
    }

    public function etiquetas() {
        return $this->belongsToMany(Etiqueta::class, 'destino_etiquetas');
    }

    public function tiposViajero() {
        return $this->belongsToMany(TipoViajero::class, 'destino_tipo_viajero', 'destino_id', 'tipo_viajero_id');
    }
}