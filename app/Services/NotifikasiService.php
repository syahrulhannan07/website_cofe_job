<?php

namespace App\Services;

use App\Models\Notifikasi;

class NotifikasiService
{
    /**
     * Kirim notifikasi ke pengguna.
     *
     * @param int $id_pengguna
     * @param string $judul
     * @param string $pesan
     * @return Notifikasi
     */
    public function kirim($id_pengguna, $judul, $pesan)
    {
        return Notifikasi::create([
            'id_pengguna' => $id_pengguna,
            'judul'       => $judul,
            'pesan'       => $pesan,
            'dibaca'      => false,
        ]);
    }
}
