<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use Illuminate\Http\Request;

class DestinoController extends Controller
{
    // GET /api/destinos
    public function index(Request $request)
    {
        // Eliminamos 'etiquetas' y 'tiposViajero' (causan error 500)
        $query = Destino::with(['categoria', 'municipio', 'entorno'])
            ->where('estado', true);

        // Filtro por categoría
        if ($request->has('categoria')) {
            $query->where('categoria_id', $request->categoria);
        }

        // Filtro por entorno
        if ($request->has('entorno')) {
            $query->where('entorno_id', $request->entorno);
        }

        // Filtro por municipio
        if ($request->has('municipio')) {
            $query->where('municipio_id', $request->municipio);
        }

        // Filtro por etiquetas (pivote destinos_etiquetas)
        if ($request->has('etiquetas')) {
            $etiquetas = array_filter(array_map('intval', explode(',', $request->etiquetas)));
            if (!empty($etiquetas)) {
                $query->whereHas('etiquetas', function ($q) use ($etiquetas) {
                    $q->whereIn('etiquetas.id', $etiquetas);
                });
            }
        }

        // Búsqueda por texto
        if ($request->has('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function($q) use ($busqueda) {
                $q->where('nombre',      'like', "%$busqueda%")
                  ->orWhere('descripcion','like', "%$busqueda%");
            });
        }

        $limit = min((int) $request->input('limit', 0), 200);
        if ($limit > 0) {
            $query->limit($limit);
        }

        return response()->json($query->get());
    }

    // GET /api/destinos/{id}
    public function show($id)
    {
        // También eliminamos 'tiposViajero' (tabla no existe) y 'etiquetas' (opcional)
        $destino = Destino::with(['categoria', 'municipio', 'entorno'])
            ->findOrFail($id);

        return response()->json($destino);
    }

    // GET /api/destinos/buscar?q=aventura+rio
public function buscar(Request $request)
{
    $query = $request->input('q', '');
    if (mb_strlen($query) < 2) {
        return response()->json([]);
    }

    // Divide la consulta en palabras clave (sin acentos) para una búsqueda más útil
    $palabras = preg_split('/\s+/u', mb_strtolower($query, 'UTF-8'), -1, PREG_SPLIT_NO_EMPTY);
    $palabras = array_filter($palabras, fn ($p) => mb_strlen($p) >= 2);

    $destinos = Destino::with(['categoria', 'municipio'])
        ->where('estado', true)
        ->where(function ($q) use ($palabras, $query) {
            // Frase completa
            $q->where(function ($qq) use ($query) {
                $qq->where('nombre', 'like', "%{$query}%")
                   ->orWhere('descripcion', 'like', "%{$query}%");
            });
            // O al menos 2 palabras clave en nombre/categoría/municipio
            $q->orWhere(function ($qq) use ($palabras) {
                foreach ($palabras as $p) {
                    $qq->orWhere('nombre', 'like', "%{$p}%")
                       ->orWhereHas('categoria', fn ($cat) => $cat->where('nombre', 'like', "%{$p}%"))
                       ->orWhereHas('municipio', fn ($mun) => $mun->where('nombre', 'like', "%{$p}%"));
                }
            });
        })
        ->limit(min((int) $request->input('limit', 10), 20))
        ->get();

    return response()->json($destinos);
}
}