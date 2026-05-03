<?php


namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JenisDokumen;
use Illuminate\Http\Request;

class JenisDokumenController extends Controller
{
    public function index()
    {
        $jenisDokumen = JenisDokumen::all();

        return response()->json([
            'status' => 'success',
            'data' => $jenisDokumen
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_dokumen' => 'required|string|max:255|unique:jenis_dokumen,nama_dokumen',
        ]);

        $jenisDokumen = JenisDokumen::create([
            'nama_dokumen' => $validated['nama_dokumen'],
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $jenisDokumen
        ], 201);
    }
}
