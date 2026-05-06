<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    // GET /api/auth/google
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    // GET /api/auth/google/callback
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

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
                    'name'         => $googleUser->getName(),
                    'email'        => $googleUser->getEmail(),
                    'google_id'    => $googleUser->getId(),
                    'provider'     => 'google',
                    'foto'         => $googleUser->getAvatar(),
                    'google_token' => $googleUser->token,
                    'password'     => null,
                ]);
            }

            $token       = $user->createToken('google_auth')->plainTextToken;
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

            $params = http_build_query([
                'token'    => $token,
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'foto'     => $user->foto ?? '',
                'provider' => 'google',
            ]);

            return redirect($frontendUrl . '/auth/google/callback?' . $params);

        } catch (\Exception $e) {
            \Log::error('Google OAuth error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/login?error=google_failed');
        }
    }
}