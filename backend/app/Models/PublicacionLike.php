<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicacionLike extends Model
{
    protected $table = 'publicacion_likes';
    protected $fillable = ['usuario_id', 'publicacion_id'];
}