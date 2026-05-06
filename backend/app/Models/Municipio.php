<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Municipio extends Model
{
    protected $table      = 'municipios';
    public    $timestamps = false;
    protected $fillable   = ['nombre'];
}