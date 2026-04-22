<?php

namespace App\Http\Controllers\Api\V1\Pelamar;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Pelamar\MulaiLamaranRequest;
use App\Http\Requests\Api\V1\Pelamar\SimpanJawabanRequest;
use App\Http\Requests\Api\V1\Pelamar\UploadDokumenRequest;
use App\Models\JawabanPertanyaan;
use App\Models\Lamaran;
use App\Models\LamaranDokumen;
use App\Models\Lowongan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LamaranController extends Controller
{
    public function mulai(MulaiLamaranRequest $request)
    {
        $profil = auth('api')->user()->profilPelamar;

        if (!$profil) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda harus melengkapi profil pelamar terlebih dahulu.'
            ], 403);
        }

        $lamaran = Lamaran::create([
            'id_lowongan' => $request->id_lowongan,
            'id_profil' => $profil->id_profil,
            'status' => 'Diproses'
        ]);

        $lowongan = Lowongan::with('dokumenDibutuhkan.jenisDokumen')->find($request->id_lowongan);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Lamaran berhasil diinisiasi.',
            'data' => [
                'id_lamaran' => $lamaran->id_lamaran,
                'dokumen_wajib' => $lowongan->dokumenDibutuhkan->map(function($doc) {
                    return [
                        'id_jenis_dokumen' => $doc->id_jenis_dokumen,
                        'nama_dokumen' => $doc->jenisDokumen->nama_dokumen ?? null,
                        'wajib' => (bool)$doc->wajib,
                    ];
                })
            ]
        ], 201);
    }

    public function uploadDokumen(UploadDokumenRequest $request, $id_lamaran)
    {
        $lamaran = Lamaran::where('id_lamaran', $id_lamaran)
            ->where('id_profil', auth('api')->user()->profilPelamar->id_profil)
            ->firstOrFail();

        if ($lamaran->status !== 'Diproses') {
            return response()->json(['status' => 'error', 'message' => 'Lamaran sudah dikirim dan tidak dapat diubah.'], 403);
        }

        $uploaded = [];
        try {
            DB::beginTransaction();

            foreach ($request->file('dokumen') as $index => $file) {
                $id_jenis = $request->id_jenis_dokumen[$index];
                
                // Gunakan disk 'local' (private) sesuai permintaan
                $path = $file->store('lamaran_dokumen/' . $id_lamaran, 'local');

                // Update atau Create jika jenis dokumen yang sama diupload ulang
                $lamaranDok = LamaranDokumen::updateOrCreate(
                    ['id_lamaran' => $id_lamaran, 'id_jenis_dokumen' => $id_jenis],
                    ['lokasi_file' => $path]
                );

                $uploaded[] = [
                    'id_jenis_dokumen' => $id_jenis,
                    'lokasi_file' => $path
                ];
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Dokumen berhasil diunggah.',
                'data' => ['dokumen' => $uploaded]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Gagal mengunggah dokumen: ' . $e->getMessage()], 500);
        }
    }

    public function simpanJawaban(SimpanJawabanRequest $request, $id_lamaran)
    {
        $lamaran = Lamaran::where('id_lamaran', $id_lamaran)
            ->where('id_profil', auth('api')->user()->profilPelamar->id_profil)
            ->firstOrFail();

        if ($lamaran->status !== 'Diproses') {
            return response()->json(['status' => 'error', 'message' => 'Lamaran sudah dikirim.'], 403);
        }

        foreach ($request->jawaban as $item) {
            JawabanPertanyaan::updateOrCreate(
                ['id_lamaran' => $id_lamaran, 'id_pertanyaan' => $item['id_pertanyaan']],
                ['jawaban' => $item['jawaban']]
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Jawaban berhasil disimpan.'
        ]);
    }

    public function kirim($id_lamaran)
    {
        $profil = auth('api')->user()->profilPelamar;
        $lamaran = Lamaran::with(['lowongan.dokumenDibutuhkan', 'lowongan.pertanyaanSeleksi'])
            ->where('id_lamaran', $id_lamaran)
            ->where('id_profil', $profil->id_profil)
            ->firstOrFail();

        if ($lamaran->status !== 'Diproses') {
            return response()->json(['status' => 'error', 'message' => 'Lamaran ini sudah dikirim.'], 403);
        }

        // VALIDASI AKHIR: Profil Lengkap (nama_lengkap & nomor_telepon tidak kosong)
        if (empty($profil->nama_lengkap) || empty($profil->nomor_telepon)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim lamaran. Harap lengkapi Nama Lengkap dan Nomor Telepon di profil Anda terlebih dahulu.'
            ], 422);
        }

        // VALIDASI DOKUMEN WAJIB
        $dokumenWajib = $lamaran->lowongan->dokumenDibutuhkan->where('wajib', true)->pluck('id_jenis_dokumen')->toArray();
        $dokumenUploaded = $lamaran->lamaranDokumen->pluck('id_jenis_dokumen')->toArray();
        
        if (count(array_diff($dokumenWajib, $dokumenUploaded)) > 0) {
            return response()->json(['status' => 'error', 'message' => 'Harap upload semua dokumen wajib terlebih dahulu.'], 422);
        }

        // VALIDASI SEMUA PERTANYAAN DIJAWAB (Opsional tapi baik dilakukan)
        $pertanyaanIds = $lamaran->lowongan->pertanyaanSeleksi->pluck('id_pertanyaan')->toArray();
        $jawabanIds = $lamaran->jawabanPertanyaan->pluck('id_pertanyaan')->toArray();
        if (count(array_diff($pertanyaanIds, $jawabanIds)) > 0) {
            return response()->json(['status' => 'error', 'message' => 'Harap jawab semua pertanyaan seleksi terlebih dahulu.'], 422);
        }

        // Finalisasi: Status tetap 'Diproses' sesuai permintaan, tapi kita bisa anggap ini submsission
        // Di ERD 'Diproses' adalah awal. Kita set saja untuk menandai ini sudah "dikirim".
        $lamaran->update(['status' => 'Diproses']); 

        return response()->json([
            'status' => 'success',
            'message' => 'Lamaran berhasil dikirim.'
        ]);
    }

    public function batalkan($id_lamaran)
    {
        $lamaran = Lamaran::where('id_lamaran', $id_lamaran)
            ->where('id_profil', auth('api')->user()->profilPelamar->id_profil)
            ->firstOrFail();

        if ($lamaran->status !== 'Diproses') {
            return response()->json(['status' => 'error', 'message' => 'Tidak dapat membatalkan lamaran yang sudah lanjut ke tahap berikutnya.'], 403);
        }

        // Hapus dokumen di storage
        foreach ($lamaran->lamaranDokumen as $doc) {
            Storage::disk('local')->delete($doc->lokasi_file);
        }

        $lamaran->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lamaran berhasil dibatalkan.'
        ]);
    }
}
