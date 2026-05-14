<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\DestinoController;
use App\Http\Controllers\Api\PublicacionController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\MunicipioController;
use App\Http\Controllers\Api\EntornoController;
use App\Http\Controllers\Api\EtiquetaController;

// Rutas públicas
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::get('/destinos', [DestinoController::class, 'index']);
Route::get('/destinos/{id}', [DestinoController::class, 'show']);
Route::get('/publicaciones', [PublicacionController::class, 'index']);

// Rutas para opciones de filtros (públicas)
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/municipios', [MunicipioController::class, 'index']);
Route::get('/entornos', [EntornoController::class, 'index']);
Route::get('/etiquetas', [EtiquetaController::class, 'index']);

// Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/perfil', [PerfilController::class, 'show']);
    Route::post('/publicaciones', [PublicacionController::class, 'store']);
    Route::post('/publicaciones/{id}/like', [PublicacionController::class, 'like']);
});