<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    /**
     * Mengirim email link reset password.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:pengguna,email',
        ], [
            'email.exists' => 'Email tidak terdaftar di sistem kami.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $token = Str::random(64);

        try {
            // Simpan token ke database
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => $token,
                    'created_at' => Carbon::now()
                ]
            );

            // Kirim Email (Manual menggunakan Mail facade karena project ini mungkin belum set up Password broker default)
            $resetLink = url('/atur-ulang-sandi?token=' . $token . '&email=' . urlencode($email));
            
            Mail::send([], [], function ($message) use ($email, $resetLink) {
                $message->to($email)
                    ->subject('Reset Password Cofe Job')
                    ->html("
                        <div style='font-family: sans-serif; padding: 20px; color: #4B2E2B;'>
                            <h2>Halo!</h2>
                            <p>Anda menerima email ini karena kami menerima permintaan atur ulang kata sandi untuk akun Anda.</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{$resetLink}' style='background-color: #C69C6D; color: #4B2E2B; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;'>
                                    Atur Ulang Kata Sandi
                                </a>
                            </div>
                            <p>Link reset password ini akan kadaluarsa dalam 60 menit.</p>
                            <p>Jika Anda tidak merasa meminta atur ulang kata sandi, abaikan email ini.</p>
                            <hr style='border: none; border-top: 1px solid #D5C4B3; margin: 20px 0;'>
                            <p style='font-size: 12px; color: #7A6555;'>Jika Anda kesulitan mengklik tombol 'Atur Ulang Kata Sandi', salin dan tempel URL di bawah ini ke browser Anda: <br> {$resetLink}</p>
                        </div>
                    ");
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Link reset password telah dikirim ke email Anda.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email reset password. Silakan coba lagi nanti.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
