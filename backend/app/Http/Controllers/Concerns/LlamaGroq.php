<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Llamadas a la API de Groq con reintento automático ante 429 (rate limit).
 * Los límites del plan gratuito son por minuto, así que esperamos lo que pide
 * la API y volvemos a intentar antes de devolver error al usuario.
 */
trait LlamaGroq
{
    protected const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    /**
     * POST a Groq reintentando automáticamente cuando responde 429.
     * Devuelve la última respuesta (exitosa o no).
     */
    protected function llamarGroqConReintento(array $payload, int $timeout = 60, int $reintentos = 3)
    {
        $response = null;

        for ($intento = 1; $intento <= $reintentos; $intento++) {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.groq.key'),
                'Content-Type'  => 'application/json',
            ])->timeout($timeout)->post(self::GROQ_API_URL, $payload);

            if ($response->status() !== 429) {
                return $response;
            }

            if ($intento < $reintentos) {
                $espera = $this->esperaRateLimit($response->body(), $intento);
                Log::warning("Groq 429 rate limit, reintento {$intento}/{$reintentos} en {$espera}s");
                sleep($espera);
            }
        }

        return $response;
    }

    /** Segundos a esperar: usa los que sugiere la API si viene en el body. */
    private function esperaRateLimit(string $body, int $intento): int
    {
        if (preg_match('/try again in ([\d.]+)s/', $body, $m)) {
            return (int) ceil(min(30, max(3, (float) $m[1])));
        }
        return min(30, 5 * $intento + 3);
    }
}
