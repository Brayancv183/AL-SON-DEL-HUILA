<?php

namespace App\Http\Controllers\Api;

use App\Models\Ruta;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class RutaController extends Controller
{
    public function index()
    {
        $userId = auth('sanctum')->id();
        $query  = Ruta::orderBy('created_at', 'desc');

        if ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('publica', true)->orWhere('user_id', $userId);
            });
        } else {
            $query->where('publica', true);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $ruta = Ruta::create([
            'user_id' => auth('sanctum')->id(),
            'nombre' => $request->nombre,
            'dias' => $request->dias,
            'destinos' => $request->destinos,
            'publica' => $request->publica ?? true,
        ]);
        return response()->json($ruta, 201);
    }

    public function destroy($id)
    {
        $ruta = Ruta::where('user_id', auth('sanctum')->id())->findOrFail($id);
        $ruta->delete();
        return response()->json(['message' => 'Eliminada']);
    }
}