<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\LlamaGroq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Herramientas extra de IA de Huily:
 * caption, lista de empaque, auto-tags, optimizador de presupuesto,
 * planificador grupal, jerga huilense y generador de nombre de ruta.
 */
class IaExtrasController extends Controller
{
    use LlamaGroq;

    private const MODELO      = 'qwen/qwen3.8-27b';
    private const MAX_IMAGEN  = 4_000_000;

    public function __construct(private ChatController $chat)
    {
    }

    // =========================================================
    // 1) Generador de captions (visión)
    // POST /api/ia/caption
    // =========================================================
    public function generarCaption(Request $request)
    {
        $request->validate([
            'imagen'      => 'required|string|max:' . self::MAX_IMAGEN,
            'lugar'       => 'nullable|string|max:150',
            'descripcion' => 'nullable|string|max:300',
        ]);

        $lugar = trim((string) $request->input('lugar', ''));
        $extra = $lugar !== '' ? " El lugar mostrado es: {$lugar}." : '';
        $nota  = trim((string) $request->input('descripcion', ''));

        $prompt = "Eres community manager de turismo del Huila (Colombia). Escribe un caption para Instagram/Facebook de esta foto." . $extra
            . ($nota !== '' ? " Contexto del usuario: {$nota}." : '') . "\n\n"
            . "REGLAS:\n"
            . "- Máximo 2 frases naturales en español colombiano, auténticas y específicas.\n"
            . "- Última línea: de 3 a 5 hashtags relevantes separados por espacio (ej: #Huila #Tatacoa).\n"
            . "- Prohibido empezar con emojis ni con clichés tipo \"paraíso oculto\" o \"gemas escondidas\".\n"
            . "- Devuelve SOLO el caption, sin comillas ni explicaciones.";

        $payload = [
            'model'            => self::MODELO,
            'temperature'      => 0.8,
            'max_tokens'       => 180,
            'reasoning_effort' => 'none',
            'messages'         => [[
                'role'    => 'user',
                'content' => [
                    ['type' => 'image_url', 'image_url' => ['url' => $request->imagen]],
                    ['type' => 'text', 'text' => $prompt],
                ],
            ]],
        ];

        $r = $this->llamarGroq($payload);
        if (!$r['ok']) {
            return response()->json(['caption' => null, 'error' => 'ia_no_disponible'], 502);
        }
        return response()->json(['caption' => $r['texto']]);
    }

    // =========================================================
    // 2) Lista de empaque
    // POST /api/ia/empaque
    // =========================================================
    public function listaEmpaque(Request $request)
    {
        $request->validate([
            'destino'      => 'required|string|max:120',
            'dias'         => 'required|integer|min:1|max:30',
            'actividades'  => 'nullable|string|max:300',
        ]);

        $destino     = $request->destino;
        $dias        = (int) $request->dias;
        $actividades = trim((string) $request->input('actividades', ''));
        if ($actividades === '') {
            $actividades = 'turismo general: caminatas, visitas a atractivos y traslados';
        }

        $prompt = "Arma una lista de empaque PERSONALIZADA para un viaje de {$dias} día(s) a {$destino}, Huila (Colombia).\n"
            . "Actividades que hará: {$actividades}.\n\n"
            . "Consideera el clima real del destino y las actividades:\n"
            . "- Valle/termales (Neiva, Tatacoa, Garzón): calor 28-35°C → ropa fresca y ligera, bloqueador SPF 50, gorra o sombrero, gafas de sol, suficiente agua.\n"
            . "- Senderismo/trekking: calzado cerrado de montaña, medias técnicas, bastones si hay pendiente, botiquín básico, repelente de insectos, linterna frontal.\n"
            . "- Ríos/quebradas/termas: traje de baño, sandalias de agua, toalla rápida, bolsa estanca.\n"
            . "- Montaña/páramo frío (Pitalito alta, zonas >2800m): chaqueta ligera o impermeable, capas, pin de frío.\n"
            . "- Fotografía: cargador portátil, tarjeta de memoria extra, funda impermeable.\n"
            . "- Si viaja con niños: extras propios (snacks, protector solar infantil).\n"
            . "Cada item debe tener sentido para ESTE destino y ESTAS actividades; nada genérico.\n\n"
            . "Responde SOLO con este JSON exacto, sin texto adicional:\n"
            . '{"lista":[{"categoria":"Ropa","items":["item","item"]}]}\n\n'
            . "Exactamente 5 categorías en este orden: Ropa, Protección y salud, Higiene, Documentos y dinero, Extras.\n"
            . "Máximo 6 items por categoría, cortos y realistas.";

        $r = $this->llamarGroq($this->payloadTexto($prompt, 650, 0.3));
        if (!$r['ok']) {
            return response()->json(['lista' => null, 'error' => 'ia_no_disponible'], 502);
        }

        $datos = $this->extraerObjetoJson($r['texto']);
        if (!$datos || empty($datos['lista']) || !is_array($datos['lista'])) {
            return response()->json(['lista' => null, 'error' => 'ia_sin_json'], 502);
        }

        return response()->json(['lista' => $datos['lista']]);
    }

    // =========================================================
    // 3) Auto-tagging al subir foto (visión)
    // POST /api/ia/etiquetas
    // =========================================================
    public function sugerirEtiquetas(Request $request)
    {
        $request->validate([
            'imagen' => 'required|string|max:' . self::MAX_IMAGEN,
        ]);

        $categorias = Cache::remember('ia.categorias_nombres', 600, fn () =>
            DB::table('categorias')->orderBy('id')->pluck('nombre')->all()
        );
        $etiquetas = Cache::remember('ia.etiquetas_nombres', 600, fn () =>
            DB::table('etiquetas')->orderBy('id')->pluck('nombre')->all()
        );

        $prompt = "Eres un clasificador de fotos turísticas del Huila. Analiza la imagen y elige: "
            . "1) la CATEGORÍA que mejor encaja, y 2) hasta 3 ETIQUETAS.\n\n"
            . "Categorías válidas: " . implode(', ', $categorias) . "\n"
            . "Etiquetas válidas: " . implode(', ', $etiquetas) . "\n\n"
            . "Responde SOLO con este JSON:\n"
            . '{"categoria":"<una de las categorías exactas>","etiquetas":["<etiqueta exacta>"]}\n'
            . "Si ninguna etiqueta encaja, devuelve \"etiquetas\": [].";

        $payload = [
            'model'            => self::MODELO,
            'temperature'      => 0.2,
            'max_tokens'       => 160,
            'reasoning_effort' => 'none',
            'messages'         => [[
                'role'    => 'user',
                'content' => [
                    ['type' => 'image_url', 'image_url' => ['url' => $request->imagen]],
                    ['type' => 'text', 'text' => $prompt],
                ],
            ]],
        ];

        $r = $this->llamarGroq($payload);
        if (!$r['ok']) {
            return response()->json(['categoria' => null, 'etiquetas' => [], 'error' => 'ia_no_disponible'], 502);
        }

        $datos = $this->extraerObjetoJson($r['texto']) ?? [];

        // Validar contra la BD: solo aceptamos coincidencias exactas (case-insensitive)
        $cat = $this->coincidir($datos['categoria'] ?? '', $categorias);
        $ets = [];
        foreach ((array) ($datos['etiquetas'] ?? []) as $e) {
            $m = $this->coincidir($e, $etiquetas);
            if ($m !== null && !in_array($m, $ets, true)) {
                $ets[] = $m;
            }
        }

        return response()->json([
            'categoria' => $cat,
            'etiquetas' => array_slice($ets, 0, 3),
        ]);
    }

    // =========================================================
    // 4) Optimizador de presupuesto
    // POST /api/ia/optimizar
    // =========================================================
    public function optimizarPresupuesto(Request $request)
    {
        $request->validate([
            'presupuesto' => 'required|integer|min:50000|max:100000000',
            'dias'        => 'required|integer|min:1|max:15',
            'personas'    => 'nullable|integer|min:1|max:20',
        ]);

        $presupuesto = (int) $request->presupuesto;
        $dias        = (int) $request->dias;
        $personas    = (int) $request->input('personas', 1);
        $total       = $presupuesto * $personas;

        $destinos = $this->chat->destinosParaContextoIA('', ['dias' => $dias]);
        $lista    = $this->chat->formatearDestinosParaPrompt($destinos);

        $prompt = "Eres un agente de viajes experto del Huila. Tu misión: armar el MEJOR viaje posible DENTRO del presupuesto.\n\n"
            . "PRESUPUESTO TOTAL: $" . number_format($total, 0, ',', '.') . " COP para {$personas} persona(s), {$dias} día(s).\n"
            . "Costos de referencia del Huila: almuerzo local $12.000-$25.000 por persona, moto/taxi $5.000-$15.000 por trayecto, "
            . "hostal $40.000-$80.000 la noche. Usa los precios de entrada de la lista cuando existan.\n\n"
            . "ENTREGA un roadmap día por día (formato exacto):\n"
            . "**Día N — [zona]**\n"
            . "- 08:00 · Actividad (lugar, \$X)\n"
            . "- ...horarios reales...\n"
            . "**Costo estimado del día N:** \$X COP\n\n"
            . "Al final: **Total estimado:** \$X COP y **Sobrante para imprevistos/hospedaje:** \$X COP. "
            . "El plan DEBE caber en el presupuesto; prioriza destinos gratuitos o de baja entrada si es ajustado. "
            . "Sé conciso, sin preámbulos, sin razonamiento visible.\n\n"
            . "Termina EXACTAMENTE con una línea JSON:\n"
            . "[RUTA: {\"nombre\": \"Nombre corto\", \"destinos\": [ids], \"dias\": {$dias}, \"presupuesto_total\": numero}]\n\n"
            . "SOLO destinos de esta lista:\n{$lista}";

        $r = $this->llamarGroq($this->payloadTexto($prompt, 850, 0.5));
        if (!$r['ok']) {
            return response()->json(['respuesta' => 'No pude optimizar el viaje ahora (IA no disponible). Intenta en unos segundos.', 'error' => true], 502);
        }

        return response()->json(['respuesta' => $r['texto'], 'fuente' => 'groq']);
    }

    // =========================================================
    // 5) Planificador grupal
    // POST /api/ia/plan-grupal
    // =========================================================
    public function planGrupal(Request $request)
    {
        $request->validate([
            'perfiles'      => 'required|array|min:2|max:8',
            'perfiles.*.nombre'  => 'required|string|max:60',
            'perfiles.*.gustos'  => 'required|string|max:200',
            'dias'          => 'nullable|integer|min:1|max:15',
            'presupuesto'   => 'nullable|integer|min:50000|max:100000000',
        ]);

        $perfiles = collect($request->perfiles)->map(fn ($p) =>
            "- {$p['nombre']}: {$p['gustos']}"
        )->implode("\n");

        $dias      = (int) $request->input('dias', 3);
        $presup    = $request->input('presupuesto');
        $ctxPresu  = $presup
            ? "\nPresupuesto total: $" . number_format((int) $presup, 0, ',', '.') . " COP."
            : "\nSin presupuesto definido: sugiere opciones económicas.";

        $destinos = $this->chat->destinosParaContextoIA('', ['dias' => $dias]);
        $lista    = $this->chat->formatearDestinosParaPrompt($destinos);

        $prompt = "Eres un agente de viajes del Huila que planifica para GRUPOS. Debes encontrar destinos que le gusten a TODOS, priorizando intereses en común.\n\n"
            . "INTEGRANTES:\n{$perfiles}\n"
            . "Duración: {$dias} día(s).{$ctxPresu}\n\n"
            . "ENTREGA:\n"
            . "1) **Plan grupal día por día** con horarios (formato **Día N — zona** con viñetas - HH:MM · actividad).\n"
            . "2) **Costo por día y total** estimado (almuerzo $12.000-$25.000, traslados $5.000-$15.000 por trayecto).\n"
            . "3) Una línea final: **Consenso:** qué actividad es la que más satisface a todos.\n\n"
            . "Sé conciso, sin preámbulos, sin razonamiento visible. SOLO destinos de esta lista:\n{$lista}\n\n"
            . "Termina con: [DESTINOS: ids separados por coma]";

        $r = $this->llamarGroq($this->payloadTexto($prompt, 850, 0.5));
        if (!$r['ok']) {
            return response()->json(['respuesta' => 'No pude armar el plan grupal ahora (IA no disponible). Intenta en unos segundos.', 'error' => true], 502);
        }

        return response()->json(['respuesta' => $r['texto'], 'fuente' => 'groq']);
    }

    /**
     * Jerga y modismos del Huila (Colombia) para viajeros.
     * POST /api/ia/frases
     */
    public function frasesViaje(Request $request)
    {
        $request->validate([
            'contexto' => 'nullable|string|max:200',
        ]);

        $contexto = trim((string) $request->input('contexto', ''));
        $extra    = $contexto !== '' ? " Contexto: {$contexto}." : '';

        $prompt = "Eres un huilense orgulloso de Neiva/Pitalito/San Agustín. Enseña la JERGA real del Huila a un viajero." . $extra . "\n\n"
            . "Responde SOLO con este JSON:\n"
            . '{"jerga":[{"frase":"expresión real del Huila","significado":"qué significa","ejemplo":"ejemplo natural de uso"}]}\n\n'
            . "Exactamente 8 expresiones REALES y vivas del Huila (ej: ajo/ajo pues, ¿qué más pues?, chevere, enojao, "
            . "pela'o, mondá, gotero, parcero, nene/vena, ¿cómo amaneció?, ¿en qué la volamos?, bacano, ¡de una!, ¿sí o qué?).\n"
            . "Incluye mezcla: saludos, asentimiento, admiración, situaciones cotidianas.\n"
            . "Nada inventado ni genérico de otros países. Si no conoces bien una, no la inventes.";

        $r = $this->llamarGroq($this->payloadTexto($prompt, 700, 0.6));
        if (!$r['ok']) {
            return response()->json(['jerga' => [], 'error' => 'ia_no_disponible'], 502);
        }

        $datos = $this->extraerObjetoJson($r['texto']) ?? [];
        return response()->json([
            'jerga' => array_slice((array) ($datos['jerga'] ?? []), 0, 8),
        ]);
    }

    // =========================================================
    // 7) Generador de nombre de ruta
    // POST /api/ia/nombre-ruta
    // =========================================================
    public function nombrarRuta(Request $request)
    {
        $request->validate([
            'destinos' => 'required|array|min:1|max:15',
            'destinos.*' => 'string|max:120',
            'dias'     => 'nullable|integer|min:1|max:30',
        ]);

        $nombres = implode(', ', $request->destinos);
        $dias    = $request->input('dias');
        $ctx     = $dias ? " La ruta dura {$dias} día(s)." : '';

        $prompt = "Inventa un nombre creativo y corto para esta ruta turística del Huila: {$nombres}.{$ctx}\n\n"
            . "Responde SOLO con este JSON:\n"
            . '{"nombre":"Nombre creativo (máx 4 palabras)", "descripcion":"Frase de una línea que explique la esencia de la ruta"}\n'
            . "El nombre debe evocar el paisaje/cultura del Huila, ser original (nada de \"Ruta 1\" ni \"Tour del Huila\").";

        $r = $this->llamarGroq($this->payloadTexto($prompt, 150, 0.9));
        if (!$r['ok']) {
            return response()->json(['nombre' => null, 'error' => 'ia_no_disponible'], 502);
        }

        $datos = $this->extraerObjetoJson($r['texto']) ?? [];
        return response()->json([
            'nombre'      => $datos['nombre'] ?? null,
            'descripcion' => $datos['descripcion'] ?? null,
        ]);
    }

    // =========================================================
    // Helpers
    // =========================================================

    private function payloadTexto(string $prompt, int $maxTokens, float $temp): array
    {
        return [
            'model'            => self::MODELO,
            'temperature'      => $temp,
            'max_tokens'       => $maxTokens,
            'reasoning_effort' => 'none',
            'messages'         => [['role' => 'user', 'content' => $prompt]],
        ];
    }

    private function llamarGroq(array $payload): array
    {
        $apiKey = config('services.groq.key');
        if (!$apiKey) {
            return ['ok' => false, 'texto' => ''];
        }

        try {
            $response = $this->llamarGroqConReintento($payload, 60);

            if ($response->failed()) {
                Log::warning('IaExtras Groq error', [
                    'status' => $response->status(),
                    'body'   => substr($response->body(), 0, 400),
                ]);
                return ['ok' => false, 'texto' => ''];
            }

            $texto = trim($response->json('choices.0.message.content') ?? '');
            return ['ok' => $texto !== '', 'texto' => $texto];
        } catch (\Exception $e) {
            Log::error('IaExtras Groq falló: ' . $e->getMessage());
            return ['ok' => false, 'texto' => ''];
        }
    }

    /** Extrae el primer objeto JSON {...} de la respuesta del modelo. */
    private function extraerObjetoJson(string $texto): ?array
    {
        if (preg_match('/\{.*\}/s', $texto, $match)) {
            $datos = json_decode($match[0], true);
            return is_array($datos) ? $datos : null;
        }
        return null;
    }

    /** Coincidencia case-insensitive y sin acentos contra una lista de la BD. */
    private function coincidir(string $valor, array $lista): ?string
    {
        $normalizar = fn (string $t) => mb_strtolower(
            strtr($t, ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ñ' => 'n']),
            'UTF-8'
        );
        $v = $normalizar(trim($valor));
        foreach ($lista as $op) {
            if ($normalizar($op) === $v) {
                return $op;
            }
        }
        return null;
    }
}
