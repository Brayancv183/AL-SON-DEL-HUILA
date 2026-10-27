<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\LlamaGroq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    use LlamaGroq;

    // qwen3.6-27b ya no existe en Groq; qwen3.8-27b sirve para texto E imagen (131k ctx)
    private const MODELO_TEXTO  = 'qwen/qwen3.8-27b';
    private const MODELO_VISION = 'qwen/qwen3.8-27b';
    private const MAX_IMAGEN_BASE64 = 4_000_000; // ~3MB reales tras base64

    private const STOPWORDS = [
        'para', 'como', 'donde', 'cuando', 'sobre', 'entre', 'desde', 'hasta',
        'quiero', 'puedes', 'puede', 'dame', 'hola', 'gracias', 'pero', 'esta',
        'este', 'estos', 'estas', 'eso', 'aqui', 'alla', 'tambien', 'muy',
        'más', 'mas', 'menos', 'hacer', 'hacerme', 'viaje', 'viajar', 'viajero',
        'lugar', 'lugares', 'sitio', 'sitios', 'destino', 'destinos', 'turismo',
        'recomendar', 'recomienda', 'recomiendas', 'sugiere', 'sugerir', 'informacion',
        'información', 'necesito', 'quisiera', 'mejores', 'bonitos', 'bonitas',
    ];

    /**
     * Huella visual de destinos clave: rasgos discriminativos que la visión
     * debe comparar contra la foto (mejora la precisión de identificación).
     */
    private const HUELLAS_VISUALES = [
        111 => 'cañones y cárcavas de arcilla rojiza/ocre y gris, suelo árido casi sin árboles, cactus y matorral bajo, cauces secos',
        125 => 'cañones de arcilla rojiza y gris con vegetación xerófila dispersa, paisaje desértico tropical',
        115 => 'desierto de arcilla rojiza con estructura rústica de mirador/observatorio, cielo estrellado de noche',
        116 => 'desierto de arcilla rojiza con cúpula o telescopio, noche estrellada',
        118 => 'desierto de arcilla rojiza con edificio bajo de museo/interpretación',
        180 => 'estatuas y tumbas de piedra antropomorfas cubiertas bajo techos de guadua, césped recortado y colinas verdes',
        181 => 'río Magdalena ancho entre montañas escarpadas, rocas y vegetación de ribera',
        166 => 'río Magdalena ancho y azul entre cerros, estrecho con corriente visible',
        165 => 'mirador sobre cañón con monolitos o estatuas de piedra y vista panorámica',
        159 => 'relieve o escultura de una mano colosal tallada en la ladera de un cerro rocoso',
        161 => 'relieve o escultura de una mano colosal en ladera de cerro cerca del río',
        8   => 'catedral neogótica de ladrillo con aguja central puntiaguda y torres laterales, techo rojizo',
        1   => 'isla o peñasco con vegetación en medio del río Magdalena',
        4   => 'río Magdalena ancho con embarcaciones o muelle/malecón',
        10  => 'plaza urbana pavimentada con palmeras y edificios alrededor',
        5   => 'edificio histórico de esquina en ladrillo o adobe, arquitectura republicana',
        2   => 'edificio institucional de museo, fachada sobria en zona urbana',
        6   => 'monumento escultórico indígena en plaza urbana',
        67  => 'embalse grande de agua azul entre cerros verdes',
        160 => 'embalse grande de agua azul entre cerros, zona de ribera',
        131 => 'embalse/lago entre cerros con zona de playa o muelle',
        140 => 'cascada alta cayendo por pared rocosa en cañón verde',
        178 => 'laguna tranquila rodeada de cerros verdes',
        177 => 'valle agrícola verde con cultivos y quebradas',
        147 => 'cañón rocoso escarpado con paredes de roca volcánica',
        152 => 'cascada o salto de río entre montañas',
        78  => 'charcos de agua cristalina con formaciones rocosas claras',
        179 => 'cascada entre vegetación densa con caída de agua blanca',
        55  => 'cañón con formaciones rocosas y vegetación de ribera',
    ];

    /** Regiones geográficas del Huila → municipios (para priorizar por zona). */
    private const REGION_SUR = [
        'villavieja', 'san agustin', 'pitalito', 'rivera', 'algeciras',
        'campoalegre', 'hobo', 'garzon', 'yaguara', 'acevedo', 'isnos',
        'pital', 'saladoblanco', 'tarqui', 'guadalquivir', 'paicol', 'tesalia',
        'tello', 'villagarzon', 'iquira', 'colombia', 'santa maria', 'talimata',
    ];
    private const REGION_NORTE = [
        'pitalito', 'isnos', 'pital', 'saladoblanco', 'tarqui', 'guadalquivir',
        'acevedo', 'opon', 'san luis', 'citala',
    ];
    /** Municipios turísticos clave que SIEMPRE deben estar si se pide la región. */
    private const REGION_SUR_CLAVE = ['san agustin', 'pitalito', 'villavieja'];

    /**
     * POST /api/chat
     * Proxy del chat Huily a Groq con RAG sobre destinos reales.
     * Body: { messages: [{role, texto, imagen?}], contexto: {presupuesto?, dias?, ruta_activa?, destinos_ruta?} }
     */
    public function chat(Request $request)
    {
        $request->validate([
            'messages'                 => 'required|array|min:1|max:40',
            'messages.*.role'          => 'required|in:user,assistant',
            'messages.*.texto'         => 'nullable|string|max:6000',
            'messages.*.imagen'        => 'nullable|string',
            'contexto.presupuesto'     => 'nullable|integer|min:0|max:100000000',
            'contexto.dias'            => 'nullable|integer|min:1|max:30',
            'contexto.ruta_activa'     => 'nullable|string|max:150',
            'contexto.destinos_ruta'   => 'nullable|array|max:40',
            'contexto.destinos_ruta.*' => 'integer',
            'idioma'                   => 'nullable|in:es,en,pt',
        ]);

        $apiKey = config('services.groq.key');
        if (!$apiKey) {
            return response()->json([
                'respuesta' => 'El asistente no está configurado en el servidor (falta GROQ_API_KEY). Avisa al administrador.',
                'fuente'    => 'sin_config',
            ], 503);
        }

        $mensajes  = $request->input('messages');
        $contexto  = $request->input('contexto', []);
        $conImagen = collect($mensajes)->contains(fn ($m) => !empty($m['imagen']));

        // Validar tamaño de imágenes
        foreach ($mensajes as $m) {
            if (!empty($m['imagen']) && strlen($m['imagen']) > self::MAX_IMAGEN_BASE64) {
                return response()->json([
                    'respuesta' => 'La imagen es demasiado grande. El máximo permitido es de 3 MB.',
                    'fuente'    => 'validacion',
                ], 422);
            }
        }

        // 1. Última consulta del usuario (sin imagen)
        $ultimaConsulta = collect($mensajes)
            ->reverse()
            ->first(fn ($m) => $m['role'] === 'user' && !empty($m['texto']));
        $consulta = $ultimaConsulta['texto'] ?? '';

        // 2. RAG: destinos relevantes + ya mencionados en la conversación
        $destinos = $this->buscarDestinosParaContexto($consulta, $mensajes, $contexto);

        // 3. Prompt del sistema
        $sistema = $this->construirSistemaPrompt($destinos, $contexto, $conImagen, $request->input('idioma', 'es'));

        // 4. Mensajes hacia Groq
        $payload = [
            'model'           => $conImagen ? self::MODELO_VISION : self::MODELO_TEXTO,
            'temperature'     => 0.6,
            'max_tokens'      => 900,
            'reasoning_effort'=> 'none', // qwen3.8 razona en voz alta; lo silenciamos
            'messages'        => array_merge(
                [['role' => 'system', 'content' => $sistema]],
                $this->formatearMensajes($mensajes, $consulta)
            ),
        ];

        // 5. Llamar Groq (con reintento automático si hay rate limit)
        try {
            $response = $this->llamarGroqConReintento($payload, 60);

            if ($response->failed()) {
                Log::warning('Groq API error', [
                    'status' => $response->status(),
                    'body'   => substr($response->body(), 0, 500),
                ]);
                return response()->json([
                    'respuesta' => 'El servicio de IA devolvió un error (' . $response->status() . '). Intenta de nuevo en unos segundos.',
                    'fuente'    => 'groq_error',
                ], 502);
            }

            $respuesta = $response->json('choices.0.message.content') ?? '';
            if ($respuesta === '') {
                return response()->json([
                    'respuesta' => 'El asistente no generó respuesta. Intenta reformular tu pregunta.',
                    'fuente'    => 'groq_vacio',
                ], 502);
            }

            return response()->json([
                'respuesta' => $respuesta,
                'fuente'    => 'groq',
                'modelo'    => $conImagen ? self::MODELO_VISION : self::MODELO_TEXTO,
            ]);
        } catch (\Exception $e) {
            Log::error('Groq conexión fallida: ' . $e->getMessage());
            return response()->json([
                'respuesta' => 'No pude conectarme con el asistente de IA. Revisa tu conexión e intenta de nuevo.',
                'fuente'    => 'conexion',
            ], 502);
        }
    }

    /**
     * POST /api/identificar-lugar
     * Recibe una imagen (dataURL base64) y devuelve el lugar del Huila que
     * más se le parece, comparado contra el catálogo real de destinos.
     * Body: { imagen: "data:image/jpeg;base64,..." }
     */
    public function identificarLugar(Request $request)
    {
        $request->validate([
            'imagen' => 'required|string|max:' . self::MAX_IMAGEN_BASE64,
        ]);

        $apiKey = config('services.groq.key');
        if (!$apiKey) {
            return response()->json(['lugar' => null, 'error' => 'IA no configurada'], 503);
        }

        $catalogo = $this->catalogoDestinos();
        // Pasar el catálogo COMPLETO (formato compacto) para que la visión
        // pueda reconocer cualquier destino, no solo los primeros 80.
        // A los destinos con huella visual se le agrega su rasgo distintivo.
        $lista = $catalogo->map(function ($d) {
            $linea = "ID {$d->id}: {$d->nombre} ({$d->municipio})";
            $huella = self::HUELLAS_VISUALES[$d->id] ?? null;
            return $huella ? "{$linea} — {$huella}" : $linea;
        })->implode("\n");

        $prompt = "Eres un guía experto del departamento del Huila, Colombia. En esta imagen hay un lugar real del Huila (paisaje, monumento, escultura, río, montaña, edificio, sitio arqueológico, mirador, etc.).\n\n"
            . "Catálogo de destinos turísticos del Huila:\n{$lista}\n\n"
            . "Instrucciones:\n"
            . "1. Identifica qué lugar muestra la imagen.\n"
            . "2. Si coincide con uno del catálogo, usa su ID exacto en 'destino_id'.\n"
            . "3. Si NO está en el catálogo pero reconoces el lugar del Huila por tu conocimiento (por ejemplo: La Mano del Gigante, Salto del Indio, Catedral de Sal, etc.), pon 'destino_id': 0 e incluye su nombre real en 'lugar' y el municipio en 'municipio'.\n"
            . "4. Si no puedes identificarlo, pon 'destino_id': 0 y describe brevemente qué ves en 'lugar'.\n"
            . "5. 'confianza' es tu nivel de certeza real (0-100). Sé honesto.\n\n"
            . "Responde SOLO con este JSON exacto, sin texto adicional:\n"
            . '{"destino_id": <id del catálogo o 0>, "lugar": "<nombre real o descripción breve>", "municipio": "<municipio del Huila o vacío>", "confianza": <0-100>}';

        $payload = [
            'model'           => self::MODELO_VISION,
            'temperature'     => 0.2,
            'max_tokens'      => 300,
            'reasoning_effort'=> 'none',
            'messages'        => [[
                'role'    => 'user',
                'content' => [
                    ['type' => 'image_url', 'image_url' => ['url' => $request->imagen]],
                    ['type' => 'text', 'text' => $prompt],
                ],
            ]],
        ];

        try {
            $response = $this->llamarGroqConReintento($payload, 45);

            if ($response->failed()) {
                Log::warning('Groq identificar-lugar error', ['status' => $response->status()]);
                return response()->json(['lugar' => null, 'error' => 'ia_error'], 502);
            }

            $texto = trim($response->json('choices.0.message.content') ?? '');
            // Extraer JSON aunque el modelo lo envuelva en ``` o añada texto
            if (preg_match('/\{.*\}/s', $texto, $match)) {
                $datos = json_decode($match[0], true);
            } else {
                $datos = null;
            }

            if (!is_array($datos) || empty($datos['lugar'])) {
                return response()->json([
                    'lugar'      => null,
                    'municipio'  => null,
                    'destino_id' => 0,
                    'confianza'  => 0,
                ]);
            }

            $destinoId = (int) ($datos['destino_id'] ?? 0);
            $coincidencia = $destinoId > 0 ? $catalogo->firstWhere('id', $destinoId) : null;

            return response()->json([
                'lugar'      => $coincidencia ? $coincidencia->nombre : ($datos['lugar'] ?? 'Lugar no identificado'),
                'municipio'  => $coincidencia ? $coincidencia->municipio : ($datos['municipio'] ?? null),
                'destino_id' => $coincidencia ? $coincidencia->id : 0,
                'confianza'  => (int) ($datos['confianza'] ?? 0),
            ]);
        } catch (\Exception $e) {
            Log::error('identificar-lugar falló: ' . $e->getMessage());
            return response()->json(['lugar' => null, 'error' => 'conexion'], 502);
        }
    }

    // =========================================================
    // RAG
    // =========================================================

    /**
     * Catálogo completo en caché (10 min).
     * Se cachean arrays planos (no objetos Eloquent) para evitar
     * problemas de serialización/deserialización incompleta.
     */
    private function catalogoDestinos()
    {
        $filas = Cache::remember('chat.catalogo_destinos', 600, function () {
            return DB::table('destinos as d')
                ->leftJoin('categorias as c', 'd.categoria_id', '=', 'c.id')
                ->leftJoin('municipios as m', 'd.municipio_id', '=', 'm.id')
                ->leftJoin('entornos as e', 'd.entorno_id', '=', 'e.id')
                ->where('d.estado', true)
                ->select(
                    'd.id', 'd.nombre', 'd.descripcion', 'd.latitud', 'd.longitud',
                    'd.horario', 'd.direccion', 'd.precio_entrada', 'd.rating_promedio',
                    'c.nombre as categoria', 'm.nombre as municipio', 'e.nombre as entorno'
                )
                ->get()
                ->map(fn ($fila) => (array) $fila)
                ->all();
        });

        return collect($filas)->map(fn ($fila) => (object) $fila);
    }

    /**
     * Selecciona los destinos que van al contexto del modelo:
     * relevantes por palabras clave + ya mencionados + relleno popular.
     */
    private function buscarDestinosParaContexto(string $consulta, array $mensajes, array $contexto)
    {
        $catalogo = $this->catalogoDestinos();
        if ($catalogo->isEmpty()) {
            return collect();
        }

        $palabras = $this->extraerPalabrasClave($consulta);
        $consultaNorm = $this->normalizar($consulta);
        $scores  = [];

        // Detectar regiones mencionadas en la consulta
        $esSur  = str_contains($consultaNorm, 'sur');
        $esNorte = str_contains($consultaNorm, 'norte');

        foreach ($catalogo as $d) {
            $nombre      = $this->normalizar($d->nombre);
            $municipio   = $this->normalizar((string) $d->municipio);
            $categoria   = $this->normalizar((string) $d->categoria);
            $descripcion = $this->normalizar((string) $d->descripcion);
            $score = 0;

            foreach ($palabras as $p) {
                if ($p === '') continue;
                if (str_contains($nombre, $p))            $score += 5;
                if (str_contains($municipio, $p))         $score += 3;
                if (str_contains($categoria, $p))         $score += 3;
                if (str_contains($descripcion, $p))       $score += 1;
            }
            // Bonus por región: si el usuario pide "sur"/"norte", prioriza esos municipios
            if ($esSur && in_array($municipio, self::REGION_SUR, true))  $score += 8;
            if ($esNorte && in_array($municipio, self::REGION_NORTE, true)) $score += 8;
            $scores[$d->id] = $score;
        }

        // Destinos ya mencionados en la conversación (consistencia entre turnos)
        $mencionados = $this->destinosMencionados($mensajes);

        // Destinos de la ruta activa
        $enRuta = array_map('intval', $contexto['destinos_ruta'] ?? []);

        $seleccion = collect();
        $idsYa = [];

        // 1) Mencionados + ruta activa primero (orden del catálogo original)
        foreach ($catalogo as $d) {
            if (in_array($d->id, $mencionados) || in_array($d->id, $enRuta)) {
                $seleccion->push($d);
                $idsYa[] = $d->id;
            }
        }

        // 2) Top por score (más en modo ruta para cubrir toda la zona pedida)
        $limiteScore = !empty($contexto['dias']) ? 18 : 12;
        arsort($scores);
        foreach ($scores as $id => $score) {
            if ($score <= 0) break;
            if (in_array($id, $idsYa)) continue;
            $seleccion->push($catalogo->firstWhere('id', $id));
            $idsYa[] = $id;
            if (count($idsYa) >= $limiteScore) break;
        }

        // 2.5) Forzar municipios clave de la región pedida (sur/norte):
        // siempre incluir los 2 mejores destinos de San Agustín, Pitalito, Villavieja, etc.
        $regionClave = $esSur ? self::REGION_SUR_CLAVE : ($esNorte ? self::REGION_SUR_CLAVE : []);
        foreach ($regionClave as $mun) {
            $delMun = $catalogo
                ->filter(fn ($d) => $this->normalizar((string) $d->municipio) === $mun)
                ->sort(fn ($a, $b) => ($scores[$b->id] ?? 0) <=> ($scores[$a->id] ?? 0))
                ->take(2);
            foreach ($delMun as $d) {
                if (!in_array($d->id, $idsYa)) {
                    $seleccion->push($d);
                    $idsYa[] = $d->id;
                }
            }
        }

        // 3) Rellenar hasta el límite priorizando diversidad geográfica
        // y score (para que municipios del sur con rating 0 no queden fuera)
        $limite = !empty($contexto['dias']) ? 26 : 14;
        if ($seleccion->count() < $limite) {
            $municipiosYa = [];
            foreach ($seleccion as $s) {
                $municipiosYa[$s->municipio] = true;
            }
            // Ordenar restantes por score desc, luego rating desc
            $restantes = $catalogo->whereNotIn('id', $idsYa)->sort(function ($a, $b) use ($scores) {
                $cmp = ($scores[$b->id] ?? 0) <=> ($scores[$a->id] ?? 0);
                return $cmp !== 0 ? $cmp : ($b->rating_promedio <=> $a->rating_promedio);
            });
            // 1ª pasada: mejor puntuado de cada municipio nuevo
            foreach ($restantes as $d) {
                if ($seleccion->count() >= $limite) break;
                if (isset($municipiosYa[$d->municipio])) continue;
                $seleccion->push($d);
                $idsYa[] = $d->id;
                $municipiosYa[$d->municipio] = true;
            }
            // 2ª pasada: completar con los mejor puntuados restantes
            foreach ($restantes as $d) {
                if ($seleccion->count() >= $limite) break;
                if (in_array($d->id, $idsYa)) continue;
                $seleccion->push($d);
                $idsYa[] = $d->id;
            }
        }

        return $seleccion->take($limite)->values();
    }

    private function destinosMencionados(array $mensajes): array
    {
        $ids = [];
        foreach ($mensajes as $m) {
            if (($m['role'] ?? '') !== 'assistant' || empty($m['texto'])) continue;
            if (preg_match('/\[DESTINOS:\s*([\d,\s]+)\]/', $m['texto'], $match)) {
                foreach (explode(',', $match[1]) as $id) {
                    $id = trim($id);
                    if ($id !== '' && ctype_digit($id)) $ids[] = (int) $id;
                }
            }
        }
        return array_values(array_unique($ids));
    }

    private function extraerPalabrasClave(string $texto): array
    {
        $texto = $this->normalizar($texto);
        $texto = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $texto);
        $palabras = preg_split('/\s+/', $texto, -1, PREG_SPLIT_NO_EMPTY);
        return array_values(array_filter($palabras, function ($p) {
            return mb_strlen($p) >= 3 && !in_array($p, self::STOPWORDS, true);
        }));
    }

    private function normalizar(string $t): string
    {
        return mb_strtolower(
            strtr($t, [
                'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ñ'=>'n','ü'=>'u',
            ]),
            'UTF-8'
        );
    }

    // =========================================================
    // Prompt
    // =========================================================

    private function construirSistemaPrompt($destinos, array $contexto, bool $conImagen, string $idioma = 'es'): string
    {
        $lista = $destinos->map(function ($d) {
            $precio = $d->precio_entrada !== null
                ? '$' . number_format((float) $d->precio_entrada, 0, ',', '.') . ' COP por persona (entrada de referencia)'
                : 'precio no registrado (ofrece una referencia aproximada con disclaimer)';
            $desc = mb_substr((string) $d->descripcion, 0, 220);
            return "- ID {$d->id}: {$d->nombre} | Municipio: {$d->municipio} | Categoría: {$d->categoria}"
                . ($d->entorno ? " | Entorno: {$d->entorno}" : '')
                . "\n  Descripción: {$desc}"
                . "\n  Horario: {$d->horario} | Entrada: {$precio}";
        })->implode("\n\n");

        // Traductor turístico: fuerza el idioma de la respuesta (se inyecta al FINAL del prompt)
        $reglaIdioma = match ($idioma) {
            'en' => "\n\nIDIOMA DE LA RESPUESTA (CRÍTICO / RESPONSE LANGUAGE): The user activated the tourist translator and selected ENGLISH. You MUST reply ENTIRELY in English from this message on. Do NOT reply in Spanish. Keep Huila place names in Spanish with an English gloss on first mention. Keep COP prices with the $ symbol.\n",
            'pt' => "\n\nIDIOMA DA RESPOSTA (CRÍTICO / RESPONSE LANGUAGE): O usuário ativou o tradutor turístico e selecionou PORTUGUÊS. Você DEVE responder INTEGRALMENTE em português a partir desta mensagem. NÃO responda em espanhol. Mantenha os nomes próprios do Huila em espanhol com gloss na primeira menção.\n",
            default => '',
        };

        $ctx = "";
        if (!empty($contexto['presupuesto'])) {
            $presu = number_format((int) $contexto['presupuesto'], 0, ',', '.');
            $ctx .= "\nPresupuesto del viajero: {$presu} COP en total.";
        }
        if (!empty($contexto['dias'])) {
            $ctx .= "\nDuración del viaje: {$contexto['dias']} día(s).";
        }
        if (!empty($contexto['ruta_activa'])) {
            $nombres = collect($contexto['destinos_ruta'] ?? [])->isEmpty()
                ? ''
                : ' Destinos actuales de la ruta: IDs ' . implode(', ', $contexto['destinos_ruta']) . '.';
            $ctx .= "\nEl usuario tiene activa la ruta \"{$contexto['ruta_activa']}\".{$nombres}";
        }

        $reglaImagen = $conImagen
            ? "- El usuario adjuntó una imagen: descríbela, identifica si coincide con algún destino de la lista (por paisaje, clima, arquitectura) y sugiere destinos reales del Huila relacionados. Si no puedes identificarlo con certeza, di tus hipótesis con honestidad.\n"
            : '';

        return "Eres Huily, asistente experto en turismo del departamento del Huila (Colombia). Hablas español colombiano, eres cálido y preciso.

ESTILO (OBLIGATORIO):
- Sé CONCISO: máximo 3 párrafos o una lista corta. Ve directo al grano.
- NO uses frases de relleno ni preámbulos: nada de \"¡Claro!\", \"¡Por supuesto!\", \"¡Excelente pregunta!\", \"Como asistente de viajes...\". Empieza por la respuesta útil.
- NO seas redundante: no repitas el mismo dato dos veces en un mensaje, ni repitas en cada respuesta la advertencia de \"precios aproximados\" si ya la dijiste en el turno anterior (usa el historial como referencia).
- NO vuelvas a preguntar datos que el usuario ya dio (presupuesto, días, tipo de viajero).
- NUNCA muestres tu razonamiento interno, proceso de pensamiento, autocorrecciones, notas sobre qué destinos están o no en la lista, ni deliberaciones. Entrega SOLO el resultado final, limpio y ordenado, como lo haría un agente de viajes profesional. Si un destino pedido no está en la lista, sugiere en su lugar los más parecidos SIN explicar el proceso.

REGLAS ESTRICTAS DE CONTENIDO:
- SOLO puedes recomendar destinos que aparezcan en la lista de abajo. NUNCA inventes destinos ni precios oficiales falsos.
- Cuando menciones uno o varios destinos, termina tu mensaje con: [DESTINOS: id1,id2,id3]
- Especificaciones (horario, municipio, categoría, descripción, precio de entrada): salen de la lista; no las inventes.
- Precios: usa los de la lista cuando existan. Para transporte y comida da estimados realistas del Huila (ej: almuerzo local $12.000-$25.000 COP, moto/taxi $5.000-$15.000 por trayecto). Indica \"referencia\" una sola vez si hace falta.

ROADMAP / ITINERARIO (cuando el usuario pida una ruta o plan de viaje):
- Eres un agente de viajes: entrega un ROADMAP DÍA POR DÍA, con horarios sugeridos.
- Formato exacto por día (usa negritas y viñetas cortas):
  **Día N — [zona o municipio]**
  - 08:00 · Actividad (lugar, entrada \$X)
  - 10:30 · Traslado (ej: 25 min en moto) + Actividad
  - 13:00 · Almuerzo sugerido (\$X)
  ...
- Agrupa destinos cercanos por día (Neiva↔Villavieja↔San Agustín↔Pitalito = zona sur).
- Cierra el roadmap con: **Costo estimado del día N:** \$X COP (entradas + transporte + comida) y **Total:** \$X COP.
- Si el usuario dio un presupuesto, el plan DEBE caber dentro de ese monto; si es ajustado, prioriza gratuitos/baja entrada y dilo una sola vez.
- Termina EXACTAMENTE con el JSON en una sola línea:
[RUTA: {\"nombre\": \"Nombre creativo corto\", \"destinos\": [id1,id2], \"dias\": N, \"presupuesto_total\": numero}]
{$reglaImagen}
CONTEXTO DEL VIAJERO:{$ctx}

DESTINOS DISPONIBLES (solo estos, con datos reales):
" . ($lista !== '' ? $lista : 'Aún no hay destinos cargados en la base de datos. Discúlpate y sugiere intentar más tarde.') . "

Recuerda: SIEMPRE termina con [DESTINOS: ...] cuando recomiendes lugares, y con [RUTA: ...] cuando generes un itinerario." . $reglaIdioma;
    }

    /**
     * Convierte el historial del frontend al formato de Groq.
     */
    private function formatearMensajes(array $mensajes, string $ultimaConsulta): array
    {
        $out = [];
        foreach ($mensajes as $m) {
            $role = $m['role'] === 'assistant' ? 'assistant' : 'user';
            // Las etiquetas internas no deben viajar al modelo en roles assistant anteriores
            $texto = (string) ($m['texto'] ?? '');
            $texto = preg_replace('/\[DESTINOS:[^\]]*\]/', '', $texto);
            $texto = preg_replace('/\[RUTA:[^\]]*\]/', '', $texto);
            $texto = trim($texto);

            if (!empty($m['imagen'])) {
                $out[] = [
                    'role'    => 'user',
                    'content' => [
                        ['type' => 'image_url', 'image_url' => ['url' => $m['imagen']]],
                        ['type' => 'text', 'text' => $texto !== '' ? $texto : $ultimaConsulta],
                    ],
                ];
            } elseif ($texto !== '') {
                $out[] = ['role' => $role, 'content' => $texto];
            }
        }

        // Groq exige que el último mensaje sea del usuario
        if (empty($out) || end($out)['role'] !== 'user') {
            $out[] = ['role' => 'user', 'content' => $ultimaConsulta !== '' ? $ultimaConsulta : 'Hola'];
        }

        return $out;
    }

    // =========================================================
    // Acceso público para otras herramientas de IA (IaExtrasController)
    // =========================================================

    /** Catálogo completo de destinos (caché 10 min). */
    public function catalogoParaIA()
    {
        return $this->catalogoDestinos();
    }

    /**
     * Selección RAG de destinos para una consulta/días dados.
     * @return \Illuminate\Support\Collection<object>
     */
    public function destinosParaContextoIA(string $consulta, array $contexto = [])
    {
        return $this->buscarDestinosParaContexto($consulta, [], $contexto);
    }

    /**
     * Formatea destinos como lista de texto para prompts de herramientas IA.
     */
    public function formatearDestinosParaPrompt($destinos): string
    {
        return $destinos->map(function ($d) {
            $precio = $d->precio_entrada !== null
                ? '$' . number_format((float) $d->precio_entrada, 0, ',', '.') . ' COP'
                : 'precio no registrado';
            return "- ID {$d->id}: {$d->nombre} | Municipio: {$d->municipio} | Categoría: {$d->categoria} | Entrada: {$precio}";
        })->implode("\n");
    }
}
