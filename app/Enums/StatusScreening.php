<?php

namespace App\Enums;

enum StatusScreening: string
{
    case Belum_Diperiksa = 'Belum_Diperiksa';
    case Lulus = 'Lulus';
    case Ditolak = 'Ditolak';
    case Perlu_Review = 'Perlu_Review';
}