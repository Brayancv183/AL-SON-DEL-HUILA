<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class PerfilController extends Controller
{
    // GET /api/perfil
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'           => $user->id,
            'nombre'       => $user->name,
            'email'        => $user->email,
            'bio'          => $user->bio,
            'ubicacion'    => $user->ubicacion,
            'foto'         => $user->foto,
            'foto_portada' => $user->foto_portada,
            'provider'     => $user->provider ?? 'local',
            'fecha_registro' => $user->created_at,
        ]);
    }

    // PUT /api/perfil
    public function update(Request $request)
    {
        $request->validate([
            'nombre'    => 'sometimes|string|max:100',
            'bio'       => 'sometimes|nullable|string|max:255',
            'ubicacion' => 'sometimes|nullable|string|max:100',
        ]);

        $user = $request->user();
        $user->name      = $request->nombre    ?? $user->name;
        $user->bio       = $request->bio       ?? $user->bio;
        $user->ubicacion = $request->ubicacion ?? $user->ubicacion;
        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado',
            'user'    => $user
        ]);
    }

    // POST /api/perfil/foto
    public function subirFoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:2048',
            'tipo' => 'required|in:perfil,portada'
        ]);

        $user = $request->user();
        $path = $request->file('foto')->store('fotos', 'public');
        $url  = asset('storage/' . $path);

        if ($request->tipo === 'portada') {
            $user->foto_portada = $url;
        } else {
            $user->foto = $url;
        }
        $user->save();

        return response()->json([
            'message' => 'Foto actualizada',
            'url'     => $url
        ]);
    }

    // PUT /api/perfil/password
    public function cambiarPassword(Request $request)
    {
        $request->validate([
            'password_actual' => 'required',
            'password_nuevo'  => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password_actual, $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta'
            ], 422);
        }

        $user->password = Hash::make($request->password_nuevo);
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada']);
    }

    // GET /api/perfil/favoritos
    public function favoritos(Request $request)
    {
        // Próximamente cuando conectemos favoritos
        return response()->json([]);
    }
}