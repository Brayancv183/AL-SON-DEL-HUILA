<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\DestinoController;
use App\Http\Controllers\Api\PublicacionController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\MunicipioController;
use App\Http\Controllers\Api\EntornoController;
use App\Http\Controllers\Api\EtiquetaController;
use App\Http\Controllers\Api\ComentarioController;
use App\Http\Controllers\Api\RecomendadorController;
use App\Http\Controllers\Api\ChatController;

// Rutas públicas
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::get('/destinos', [DestinoController::class, 'index']);
Route::get('/destinos/buscar', [DestinoController::class, 'buscar']);
Route::get('/destinos/{id}', [DestinoController::class, 'show'])->whereNumber('id');
Route::get('/publicaciones', [PublicacionController::class, 'index']);
Route::get('/rutas', [RutaController::class, 'index']);


// Rutas para opciones de filtros (públicas)
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/municipios', [MunicipioController::class, 'index']);
Route::get('/entornos', [EntornoController::class, 'index']);
Route::get('/etiquetas', [EtiquetaController::class, 'index']);

Route::post('/recomendar', [RecomendadorController::class, 'recomendar']);


// Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/perfil', [PerfilController::class, 'show']);
    Route::put('/perfil', [PerfilController::class, 'update']);
    Route::post('/perfil/foto', [PerfilController::class, 'subirFoto']);
    Route::put('/perfil/password', [PerfilController::class, 'cambiarPassword']);
    Route::post('/publicaciones', [PublicacionController::class, 'store']);
    Route::post('/publicaciones/{id}/like', [PublicacionController::class, 'like']);
    Route::put('/publicaciones/{id}', [PublicacionController::class, 'update']);
    Route::delete('/publicaciones/{id}', [PublicacionController::class, 'destroy']);
    Route::get('/perfil/mis-publicaciones', [PublicacionController::class, 'misPublicaciones']);    
    Route::post('/rutas', [RutaController::class, 'store'])->middleware('auth:sanctum');
    Route::delete('/rutas/{id}', [RutaController::class, 'destroy'])->middleware('auth:sanctum');
    });