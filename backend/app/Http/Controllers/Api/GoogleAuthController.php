<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                $user->update([
                    'google_id'    => $googleUser->getId(),
                    'provider'     => 'google',
                    'foto'         => $user->foto ?? $googleUser->getAvatar(),
                    'google_token' => $googleUser->token,
                ]);
            } else {
                $user = User::create([
                    'nombre'       => $googleUser->getName(),
                    'email'        => $googleUser->getEmail(),
                    'google_id'    => $googleUser->getId(),
                    'provider'     => 'google',
                    'foto'         => $googleUser->getAvatar(),
                    'google_token' => $googleUser->token,
                    'password'     => null,
                ]);
            }

            $token = $user->createToken('google_auth')->plainTextToken;
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

            $params = http_build_query([
                'token'    => $token,
                'id'       => $user->id,
                'name'     => $user->nombre,
                'email'    => $user->email,
                'foto'     => $user->foto ?? '',
                'provider' => 'google',
            ]);

            $redirectUrl = $frontendUrl . '/auth/google/callback?' . $params;

            // Redirigir mediante JavaScript en la ventana principal para evitar problemas de frame
            return response()->make(
                '<!DOCTYPE html><html><head><script>window.top.location.href = "'.addslashes($redirectUrl).'";</script></head><body></body></html>',
                200,
                ['Content-Type' => 'text/html']
            );

        } catch (\Exception $e) {
            Log::error('Google OAuth error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?error=google_failed');
        }
    }
}