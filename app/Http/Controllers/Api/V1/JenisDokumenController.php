<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JenisDokumen;
use Illuminate\Http\Request;

class JenisDokumenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jenisDokumen = JenisDokumen::all();

        return response()->json([
            'status' => 'success',
            'data' => $jenisDokumen
        ]);
    }
}
