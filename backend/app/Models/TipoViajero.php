<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoViajero extends Model
{
    protected $table      = 'tipos_viajero';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}