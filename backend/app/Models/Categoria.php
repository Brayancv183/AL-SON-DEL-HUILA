<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $table      = 'categorias';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];

    public function destinos() {
        return $this->hasMany(Destino::class);
    }
}