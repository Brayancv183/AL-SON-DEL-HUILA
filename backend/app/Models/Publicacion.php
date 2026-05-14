<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publicacion extends Model
{
    use HasFactory;

    protected $table = 'publicaciones';
    protected $fillable = ['user_id', 'imagen', 'descripcion', 'ubicacion'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function likes()
    {
        return $this->hasMany(PublicacionLike::class, 'publicacion_id');
    }

    public function isLikedByUser($usuarioId)
    {
        return $this->likes()->where('usuario_id', $usuarioId)->exists();
    }
}