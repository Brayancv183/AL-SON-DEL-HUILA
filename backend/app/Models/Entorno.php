<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entorno extends Model
{
    protected $table      = 'entornos';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}