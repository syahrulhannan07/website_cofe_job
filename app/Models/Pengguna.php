<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class Pengguna extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'pengguna';
    protected $primaryKey = 'id_pengguna';

    protected $fillable = [
        'nama_pengguna',
        'email',
        'kata_sandi',
        'peran',
        'status_akun',
        'fcm_token',
    ];

    protected $hidden = [
        'kata_sandi',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function getAuthPassword()
    {
        return $this->kata_sandi;
    }

    public function profilPerusahaan()
    {
        return $this->hasOne(ProfilPerusahaan::class, 'id_pengguna', 'id_pengguna');
    }

    public function profilPelamar()
    {
        return $this->hasOne(ProfilPelamar::class, 'id_pengguna', 'id_pengguna');
    }

    public function routeNotificationForFcm()
    {
        return $this->fcm_token;
    }

    public function routeNotificationForWhatsApp()
    {
        $phone = $this->profilPelamar?->nomor_telepon;

        if (!$phone) {
            return null;
        }

        // Hilangkan karakter aneh
        $phone = str_replace(['+', ' ', '-'], '', $phone);

        // Ubah 08xxxx menjadi 628xxxx
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        return $phone;
    }
}
