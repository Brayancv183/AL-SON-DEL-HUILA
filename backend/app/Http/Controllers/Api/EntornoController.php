<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entorno;
use Illuminate\Http\Request;

class EntornoController extends Controller
{
    public function index()
    {
        return response()->json(Entorno::all());
    }
}