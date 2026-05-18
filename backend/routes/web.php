<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Ruta personalizada para servir imágenes de publicaciones (sin depender del enlace simbólico)
Route::get('/imagenes/publicaciones/{filename}', function ($filename) {
    $path = storage_path('app/public/publicaciones/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response()->file($path);
})->where('filename', '.*');


// Ruta para servir fotos de perfil/portada sin depender del enlace simbólico
Route::get('/storage/fotos/{filename}', function ($filename) {
    $path = storage_path('app/public/fotos/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
})->where('filename', '.*');