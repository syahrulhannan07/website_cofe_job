<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    /**
     * Kirim notifikasi WhatsApp yang diberikan.
     */
    public function send($notifiable, Notification $notification)
    {
        // 1. Ambil nomor HP dari model yang dinotifikasi (User / Pelamar)
        $phone = $this->getPhoneNumber($notifiable);

        if (!$phone) {
            Log::warning("Gagal mengirim WhatsApp: Nomor HP tidak ditemukan untuk " . get_class($notifiable));
            return;
        }

        // 2. Pastikan notifikasi memiliki method 'toWhatsApp'
        if (!method_exists($notification, 'toWhatsApp')) {
            Log::warning("Gagal mengirim WhatsApp: Method toWhatsApp() tidak ditemukan di " . get_class($notification));
            return;
        }

        // 3. Ambil isi teks pesan dari notifikasi
        $message = $notification->toWhatsApp($notifiable);

        // 4. Kirim HTTP Request ke API Gateway (Contoh menggunakan Fonnte)
        $token = config('services.fonnte.token');

        try {
            $response = Http::withoutVerifying()
            ->timeout(60)
            ->connectTimeout(60)
            ->withHeaders([
                'Authorization' => $token,
            ])
            ->asForm()
            ->post(config('services.fonnte.url'), [
                'target'  => $phone,
                'message' => $message,
                'countryCode' => '62',
            ]);

            if ($response->successful()) {

                Log::info('WhatsApp berhasil dikirim', [
                    'nomor' => $phone,
                    'response' => $response->json()
                ]);

            } else {

                Log::error('WhatsApp gagal dikirim', [
                    'nomor' => $phone,
                    'response' => $response->body()
                ]);

            }
        } catch (\Exception $e) {
            Log::error("Pengecualian WhatsApp: " . $e->getMessage());
        }
    }

    /**
     * Helper untuk mencari nomor HP secara fleksibel dari object $notifiable
     */
    protected function getPhoneNumber($notifiable)
    {
        return $notifiable->routeNotificationForWhatsApp();
    }
}