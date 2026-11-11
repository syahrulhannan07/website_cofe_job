<?php

namespace App\Http\Controllers\Api\V1\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Nib;
use App\Models\ProfilPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class NibDocumentController extends Controller
{
    /**
     * Format dokumen yang didukung untuk ditampilkan melalui endpoint terautentikasi.
     *
     * @var array<string, string>
     */
    private const SUPPORTED_MIME_TYPES = [
        'application/pdf' => 'pdf',
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
    ];

    /**
     * Tampilkan atau unduh dokumen NIB untuk Super Admin.
     *
     * Hanya Super Admin yang berwenang mengakses dokumen untuk keperluan screening.
     * Dokumen disimpan di private storage dan diakses melalui endpoint terautentikasi.
     */
    public function show(Request $request, string $id_nib): Response
    {
        // 1. Pengguna harus terautentikasi (dipaksa oleh middleware auth:api di route group)
        // 2. Role harus Super_Admin (dipaksa oleh middleware role:Super_Admin di route group)

        // 3. Record NIB harus ditemukan
        $nib = Nib::where('id_nib', $id_nib)->first();

        if (!$nib) {
            abort(404, 'Dokumen NIB tidak ditemukan.');
        }

        // 4. Dokumen harus terkait dengan perusahaan yang valid
        if (!$nib->profilPerusahaan) {
            abort(404, 'Perusahaan terkait dokumen NIB tidak ditemukan.');
        }

        $path = $nib->dokumen_nib;

        if (!$path) {
            abort(404, 'Dokumen NIB tidak tersedia.');
        }

        // 7. Validasi path agar tidak dapat digunakan untuk path traversal
        if (str_contains($path, '..') || str_starts_with($path, '/') || str_contains($path, '\\')) {
            abort(400, 'Path dokumen tidak valid.');
        }

        // 8. Periksa keberadaan file dan MIME type sebelum mengirimkan respons
        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'Berkas dokumen NIB tidak ditemukan di storage.');
        }

        $mime = Storage::disk('local')->mimeType($path);

        if (!array_key_exists($mime, self::SUPPORTED_MIME_TYPES)) {
            abort(415, 'Format dokumen tidak didukung.');
        }

        // 9. Kembalikan konten berkas dengan header yang tepat untuk preview
        $contents = Storage::disk('local')->get($path);

        $originalName = basename($path);
        $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);

        $extension = self::SUPPORTED_MIME_TYPES[$mime];
        $safeName = preg_replace('/\.' . preg_quote($extension, '/') . '$/i', '', $safeName) . '.' . $extension;

        return response($contents, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $safeName . '"',
            'Cache-Control' => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
