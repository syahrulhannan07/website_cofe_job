<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NotCoordinatePair implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $number = '[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)';

        if (is_string($value) && preg_match('/\A\s*'.$number.'\s*[,;]\s*'.$number.'\s*\z/', $value)) {
            $fail('Alamat harus berupa teks alamat, bukan pasangan koordinat latitude/longitude.');
        }
    }
}
