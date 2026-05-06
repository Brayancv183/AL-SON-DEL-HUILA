<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DestinoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RecomendadorController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\GoogleAuthController;

// ── Rutas públicas ──────────────────────────────────
Route::get('/destinos',         [DestinoController::class,      'index']);
Route::get('/destinos/{id}',    [DestinoController::class,      'show']);
Route::post('/auth/register',   [AuthController::class,         'register']);
Route::post('/auth/login',      [AuthController::class,         'login']);
Route::post('/recomendar',      [RecomendadorController::class, 'recomendar']);
Route::get('/auth/google',          [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

// ── Rutas protegidas (requieren token) ──────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout',         [AuthController::class,  'logout']);

    // Perfil
    Route::get( '/perfil',              [PerfilController::class, 'show']);
    Route::put( '/perfil',              [PerfilController::class, 'update']);
    Route::post('/perfil/foto',         [PerfilController::class, 'subirFoto']);
    Route::put( '/perfil/password',     [PerfilController::class, 'cambiarPassword']);
    Route::get( '/perfil/favoritos',    [PerfilController::class, 'favoritos']);
});