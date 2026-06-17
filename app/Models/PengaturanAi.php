<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanAi extends Model
{
    protected $table = 'pengaturan_ai';
    public $timestamps = false;

    protected $fillable = [
        'kunci',
        'nilai',
        'diperbarui_pada',
    ];

    protected function casts(): array
    {
        return [
            'diperbarui_pada' => 'datetime',
        ];
    }

    public static function ambil(string $kunci, string $default = '0'): string
    {
        $setting = static::where('kunci', $kunci)->first();
        return $setting ? $setting->nilai : $default;
    }

    public static function ambilInt(string $kunci, int $default = 0): int
    {
        return (int) static::ambil($kunci, (string) $default);
    }
}
