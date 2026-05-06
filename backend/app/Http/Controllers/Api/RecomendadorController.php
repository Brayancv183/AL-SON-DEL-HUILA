<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecomendadorController extends Controller
{
    // POST /api/recomendar
    public function recomendar(Request $request)
    {
        $categorias   = $request->input('categorias',   []);
        $entornos     = $request->input('entornos',     []);
        $etiquetas    = $request->input('etiquetas',    []);
        $tipoViajero  = $request->input('tipo_viajero', null);
        $dias         = $request->input('dias',         2);

        // Sistema de scoring — sin IA
        $destinos = DB::table('destinos as d')
            ->leftJoin('destino_etiquetas as de',      'd.id', '=', 'de.destino_id')
            ->leftJoin('destino_tipo_viajero as dtv',  'd.id', '=', 'dtv.destino_id')
            ->leftJoin('destino_entorno as den',       'd.id', '=', 'den.destino_id')
            ->leftJoin('categorias as c',              'd.categoria_id', '=', 'c.id')
            ->leftJoin('municipios as m',              'd.municipio_id', '=', 'm.id')
            ->select(
                'd.id', 'd.nombre', 'd.descripcion',
                'd.imagen', 'd.latitud', 'd.longitud',
                'c.nombre as categoria',
                'm.nombre as municipio',
                DB::raw('
                    SUM(
                        CASE WHEN de.etiqueta_id IN (' . (count($etiquetas) ? implode(',', $etiquetas) : '0') . ') THEN 2 ELSE 0 END +
                        CASE WHEN dtv.tipo_viajero_id = ' . ($tipoViajero ?? 0) . ' THEN 3 ELSE 0 END +
                        CASE WHEN den.entorno_id IN (' . (count($entornos) ? implode(',', $entornos) : '0') . ') THEN 2 ELSE 0 END +
                        CASE WHEN d.categoria_id IN (' . (count($categorias) ? implode(',', $categorias) : '0') . ') THEN 3 ELSE 0 END
                    ) as score
                ')
            )
            ->where('d.estado', true)
            ->groupBy('d.id', 'd.nombre', 'd.descripcion', 'd.imagen', 'd.latitud', 'd.longitud', 'c.nombre', 'm.nombre')
            ->orderByDesc('score')
            ->limit(20)
            ->get();

        // Agrupar por días
        $itinerario = [];
        $porDia     = max(2, ceil(count($destinos) / $dias));

        for ($i = 0; $i < $dias; $i++) {
            $slice = $destinos->slice($i * $porDia, $porDia)->values();
            if ($slice->count() > 0) {
                $itinerario[] = [
                    'dia'      => $i + 1,
                    'destinos' => $slice
                ];
            }
        }

        return response()->json([
            'itinerario' => $itinerario,
            'total'      => count($destinos)
        ]);
    }
}