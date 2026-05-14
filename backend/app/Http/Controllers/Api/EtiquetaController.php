<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etiqueta;
use Illuminate\Http\Request;

class EtiquetaController extends Controller
{
    public function index()
    {
        return response()->json(Etiqueta::all());
    }
}