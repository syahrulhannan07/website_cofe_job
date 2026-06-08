<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ResetPasswordController extends Controller
{
    /**
     * Memproses reset password.
     */
    public function reset(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email|exists:pengguna,email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // 1. Cek token di database
        $resetData = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$resetData) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token reset password tidak valid atau sudah kadaluarsa.'
            ], 400);
        }

        // 2. Cek apakah token sudah kadaluarsa (60 menit)
        if (Carbon::parse($resetData->created_at)->addMinutes(60)->isPast()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token reset password sudah kadaluarsa.'
            ], 400);
        }

        // 3. Update password pengguna
        $user = Pengguna::where('email', $request->email)->first();
        $user->update([
            'kata_sandi' => Hash::make($request->password)
        ]);

        // 4. Hapus token reset
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi Anda berhasil diubah.'
        ]);
    }
}
