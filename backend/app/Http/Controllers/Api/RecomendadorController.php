<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecomendadorController extends Controller
{
    /**
     * POST /api/recomendar
     * Scoring real según preferencias del quiz + agrupación por días.
     * Body: { categorias: [ids], entornos: [ids], etiquetas: [ids], tipo_viajero: id, dias: N }
     */
    public function recomendar(Request $request)
    {
        try {
            $categorias  = array_values(array_filter(array_map('intval', $request->input('categorias', []))));
            $entornos    = array_values(array_filter(array_map('intval', $request->input('entornos', []))));
            $etiquetas   = array_values(array_filter(array_map('intval', $request->input('etiquetas', []))));
            $tipoViajero = (int) $request->input('tipo_viajero', 0);
            $dias        = max(1, min(30, (int) $request->input('dias', 2)));

            $destinos = DB::table('destinos as d')
                ->leftJoin('destinos_etiquetas as de', 'd.id', '=', 'de.destino_id')
                ->leftJoin('destinos_tipos_viajero as dtv', 'd.id', '=', 'dtv.destino_id')
                ->leftJoin('categorias as c', 'd.categoria_id', '=', 'c.id')
                ->leftJoin('municipios as m', 'd.municipio_id', '=', 'm.id')
                ->leftJoin('entornos as e', 'd.entorno_id', '=', 'e.id')
                ->where('d.estado', true)
                ->select(
                    'd.id', 'd.nombre', 'd.descripcion', 'd.imagen',
                    'd.latitud', 'd.longitud', 'd.horario', 'd.direccion',
                    'd.precio_entrada', 'd.rating_promedio',
                    'c.nombre as categoria', 'm.nombre as municipio', 'e.nombre as entorno'
                )
                ->selectRaw('
                    (
                        COALESCE(SUM(CASE WHEN de.etiqueta_id IN (' . $this->ids($etiquetas) . ') THEN 2 ELSE 0 END), 0) +
                        COALESCE(SUM(CASE WHEN dtv.tipo_viajero_id = ' . $tipoViajero . ' THEN 3 ELSE 0 END), 0) +
                        COALESCE(SUM(CASE WHEN d.entorno_id IN (' . $this->ids($entornos) . ') THEN 2 ELSE 0 END), 0) +
                        COALESCE(SUM(CASE WHEN d.categoria_id IN (' . $this->ids($categorias) . ') THEN 3 ELSE 0 END), 0) +
                        COALESCE(d.rating_promedio, 0)
                    ) as score
                ')
                ->groupBy(
                    'd.id', 'd.nombre', 'd.descripcion', 'd.imagen',
                    'd.latitud', 'd.longitud', 'd.horario', 'd.direccion',
                    'd.precio_entrada', 'd.rating_promedio',
                    'c.nombre', 'm.nombre', 'e.nombre'
                )
                ->orderByDesc('score')
                ->limit(20)
                ->get();

            // Distribuir los mejores en los días solicitados
            $itinerario = [];
            $porDia     = max(1, (int) ceil($destinos->count() / $dias));

            for ($i = 0; $i < $dias; $i++) {
                $slice = $destinos->slice($i * $porDia, $porDia)->values();
                if ($slice->count() > 0) {
                    $itinerario[] = [
                        'dia'      => $i + 1,
                        'destinos' => $slice,
                    ];
                }
            }

            return response()->json([
                'itinerario' => $itinerario,
                'total'      => $destinos->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'itinerario' => [],
                'total'      => 0,
                'error'      => $e->getMessage(),
            ], 500);
        }
    }

    /** Lista de enteros segura para inyectar en SQL (siempre al menos 0). */
    private function ids(array $ids): string
    {
        $ids = array_filter(array_map('intval', $ids), fn ($i) => $i > 0);
        return $ids ? implode(',', $ids) : '0';
    }
}
