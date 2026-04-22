<?php

namespace App\Services\V1\Admin;

use App\Models\Lowongan;
use App\Models\LowonganDokumen;
use App\Models\PertanyaanLowongan;
use App\Repositories\V1\Admin\LowonganRepository;
use Illuminate\Support\Facades\DB;

class LowonganService
{
    protected $repository;

    public function __construct(LowonganRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get paginated vacancies.
     */
    public function listVacancies(int $idPerusahaan, array $filters)
    {
        return $this->repository->getByPerusahaan($idPerusahaan, $filters);
    }

    /**
     * Create vacancy with its relations.
     */
    public function createLowongan(int $idPerusahaan, array $data): Lowongan
    {
        return DB::transaction(function () use ($idPerusahaan, $data) {
            $lowongan = $this->repository->create(array_merge($data, [
                'id_perusahaan' => $idPerusahaan,
                'status'        => $data['status'] ?? 'Draft',
            ]));

            if (!empty($data['dokumen_dibutuhkan'])) {
                $this->syncDocuments($lowongan, $data['dokumen_dibutuhkan']);
            }

            if (!empty($data['pertanyaan'])) {
                $this->syncQuestions($lowongan, $data['pertanyaan']);
            }

            return $lowongan->load(['dokumenDibutuhkan.jenisDokumen', 'pertanyaanSeleksi']);
        });
    }

    /**
     * Update vacancy and sync relations.
     */
    public function updateLowongan(Lowongan $lowongan, array $data): Lowongan
    {
        return DB::transaction(function () use ($lowongan, $data) {
            $this->repository->update($lowongan, $data);

            if (isset($data['dokumen_dibutuhkan'])) {
                $this->syncDocuments($lowongan, $data['dokumen_dibutuhkan']);
            }

            if (isset($data['pertanyaan'])) {
                $this->syncQuestions($lowongan, $data['pertanyaan']);
            }

            return $lowongan->load(['dokumenDibutuhkan.jenisDokumen', 'pertanyaanSeleksi']);
        });
    }

    /**
     * Sync documents (Replace-all strategy).
     */
    protected function syncDocuments(Lowongan $lowongan, array $documents): void
    {
        $lowongan->dokumenDibutuhkan()->delete();
        foreach ($documents as $doc) {
            LowonganDokumen::create([
                'id_lowongan'      => $lowongan->id_lowongan,
                'id_jenis_dokumen' => $doc['id_jenis_dokumen'],
                'wajib'            => $doc['wajib'],
            ]);
        }
    }

    /**
     * Sync questions (Replace-all strategy).
     */
    protected function syncQuestions(Lowongan $lowongan, array $questions): void
    {
        $lowongan->pertanyaanSeleksi()->delete();
        foreach ($questions as $q) {
            PertanyaanLowongan::create([
                'id_lowongan'  => $lowongan->id_lowongan,
                'pertanyaan'   => $q['pertanyaan'],
                'tipe_jawaban' => $q['tipe_jawaban'],
            ]);
        }
    }
}
