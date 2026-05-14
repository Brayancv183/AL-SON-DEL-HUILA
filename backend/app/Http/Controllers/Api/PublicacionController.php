<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\PublicacionLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PublicacionController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $publicaciones = Publicacion::with('user')->orderBy('created_at', 'desc')->get();

        foreach ($publicaciones as $pub) {
            $pub->likes = PublicacionLike::where('publicacion_id', $pub->id)->count();
            if ($user) {
                $pub->liked_by_user = PublicacionLike::where('usuario_id', $user->id)
                                                    ->where('publicacion_id', $pub->id)
                                                    ->exists();
            } else {
                $pub->liked_by_user = false;
            }
        }

        return response()->json($publicaciones);
    }

    public function store(Request $request)
    {
        $request->validate([
            'imagen' => 'required|image|max:5120',
            'descripcion' => 'nullable|string|max:255',
            'ubicacion' => 'nullable|string|max:100',
        ]);

        $path = $request->file('imagen')->store('publicaciones', 'public');
        $filename = basename($path);
        $url = url('/imagenes/publicaciones/' . $filename);

        $publicacion = Publicacion::create([
            'user_id' => $request->user()->id,
            'imagen' => $url,
            'descripcion' => $request->descripcion,
            'ubicacion' => $request->ubicacion,
        ]);

        return response()->json($publicacion->load('user'), 201);
    }

    public function like($id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $publicacion = Publicacion::findOrFail($id);

        $like = PublicacionLike::where('usuario_id', $user->id)
                              ->where('publicacion_id', $publicacion->id)
                              ->first();

        if ($like) {
            $like->delete();
            $likesCount = PublicacionLike::where('publicacion_id', $publicacion->id)->count();
            return response()->json(['likes' => $likesCount, 'liked' => false]);
        } else {
            PublicacionLike::create([
                'usuario_id' => $user->id,
                'publicacion_id' => $publicacion->id,
            ]);
            $likesCount = PublicacionLike::where('publicacion_id', $publicacion->id)->count();
            return response()->json(['likes' => $likesCount, 'liked' => true]);
        }
    }
}