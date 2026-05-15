<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecomendadorController extends Controller
{
    public function recomendar(Request $request)
    {
        try {
            // Obtener parámetros (pueden venir del quiz)
            $dias = max(1, (int) $request->input('dias', 2));

            // Consulta principal: destinos activos con su categoría y municipio
            $destinos = DB::table('destinos as d')
                ->leftJoin('categorias as c', 'd.categoria_id', '=', 'c.id')
                ->leftJoin('municipios as m', 'd.municipio_id', '=', 'm.id')
                ->where('d.estado', 1)   // tus destinos activos tienen estado = 1
                ->select(
                    'd.id',
                    'd.nombre',
                    'd.descripcion',
                    'd.imagen',
                    'd.latitud',
                    'd.longitud',
                    'c.nombre as categoria',
                    'm.nombre as municipio'
                )
                ->inRandomOrder()      // por ahora solo muestra destinos al azar
                ->limit(12)            // límite de 12 destinos para el itinerario
                ->get();

            // Si por alguna razón no hay destinos, devolver array vacío
            if ($destinos->isEmpty()) {
                return response()->json([
                    'itinerario' => [],
                    'total' => 0
                ]);
            }

            // Distribuir los destinos en los días solicitados
            $itinerario = [];
            $porDia = ceil($destinos->count() / $dias);

            for ($i = 0; $i < $dias; $i++) {
                $inicio = $i * $porDia;
                $slice = $destinos->slice($inicio, $porDia)->values();
                if ($slice->count() > 0) {
                    $itinerario[] = [
                        'dia' => $i + 1,
                        'destinos' => $slice
                    ];
                }
            }

            return response()->json([
                'itinerario' => $itinerario,
                'total' => $destinos->count()
            ]);

        } catch (\Exception $e) {
            // Si algo falla, devolvemos un error controlado
            return response()->json([
                'itinerario' => [],
                'total' => 0,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}