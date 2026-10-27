<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\PublicacionLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PublicacionController extends Controller
{
    /**
     * Listar todas las publicaciones (feed público)
     * Si el usuario está autenticado, devuelve liked_by_user para cada publicación
     */
    public function index()
    {
        // Guard sanctum: el token Bearer se resuelve aunque la ruta sea "pública"
        $user = auth('sanctum')->user();
        
        $publicaciones = Publicacion::with('user')
            ->withCount('likes')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($user) {
            $publicaciones->each(function ($pub) use ($user) {
                $pub->liked_by_user = $pub->isLikedByUser($user->id);
            });
        } else {
            $publicaciones->each(function ($pub) {
                $pub->liked_by_user = false;
            });
        }

        return response()->json($publicaciones);
    }

    /**
     * Crear una nueva publicación (solo usuarios autenticados)
     */
    public function store(Request $request)
    {
        $request->validate([
            'imagen' => 'required|image|max:5120',
            'descripcion' => 'nullable|string|max:255',
            'ubicacion' => 'nullable|string|max:100',
        ]);

        $path = $request->file('imagen')->store('publicaciones', 'public');
        $filename = basename($path);
        $url = asset('storage/publicaciones/' . $filename);

        $publicacion = Publicacion::create([
            'user_id' => $request->user()->id,
            'imagen' => $url,
            'descripcion' => $request->descripcion,
            'ubicacion' => $request->ubicacion,
        ]);

        return response()->json($publicacion->load('user'), 201);
    }

    /**
     * Toggle like (dar o quitar like) – solo usuarios autenticados
     */
    public function like($id)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $publicacion = Publicacion::findOrFail($id);
        $like = PublicacionLike::where('usuario_id', $user->id)
                              ->where('publicacion_id', $publicacion->id)
                              ->first();

        if ($like) {
            $like->delete();
            $likesCount = $publicacion->likes()->count();
            return response()->json(['likes' => $likesCount, 'liked' => false]);
        } else {
            PublicacionLike::create([
                'usuario_id' => $user->id,
                'publicacion_id' => $publicacion->id,
            ]);
            $likesCount = $publicacion->likes()->count();
            return response()->json(['likes' => $likesCount, 'liked' => true]);
        }
    }

    /**
     * Obtener las publicaciones del usuario autenticado (para el perfil)
     */
    public function misPublicaciones(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $publicaciones = Publicacion::where('user_id', $user->id)
            ->with('user')
            ->withCount('likes')
            ->orderBy('created_at', 'desc')
            ->get();

        $publicaciones->each(function ($pub) use ($user) {
            $pub->liked_by_user = $pub->isLikedByUser($user->id);
        });

        return response()->json($publicaciones);
    }

    /**
     * Actualizar una publicación (solo el dueño)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $publicacion = Publicacion::findOrFail($id);

        if ($publicacion->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'descripcion' => 'nullable|string|max:255',
            'ubicacion'   => 'nullable|string|max:100',
        ]);

        $publicacion->descripcion = $request->descripcion ?? $publicacion->descripcion;
        $publicacion->ubicacion   = $request->ubicacion ?? $publicacion->ubicacion;
        $publicacion->save();

        return response()->json($publicacion);
    }

    /**
     * Eliminar una publicación (solo el dueño)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $publicacion = Publicacion::findOrFail($id);

        if ($publicacion->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $publicacion->delete();

        return response()->json(['message' => 'Publicación eliminada']);
    }
}