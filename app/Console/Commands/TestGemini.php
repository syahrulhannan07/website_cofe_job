<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestGemini extends Command
{
    protected $signature = 'test:ai {pesan? : Pesan untuk dikirim ke AI}';
    protected $description = 'Test koneksi ke AI (Groq)';

    public function handle()
    {
        $apiKey = config('ai.groq_api_key');
        $model = config('ai.groq_model', 'llama-3.3-70b-versatile');

        if (empty($apiKey)) {
            $this->error('GROQ_API_KEY tidak ditemukan di .env atau config/ai.php');
            $this->line('Cek: php artisan config:clear lalu pastikan .env berisi GROQ_API_KEY=...');
            $this->line('Daftar gratis di: https://console.groq.com/keys');
            return Command::FAILURE;
        }

        $this->info("Menggunakan model: {$model}");
        $this->line("API Key: " . substr($apiKey, 0, 10) . '...');

        $pesan = $this->argument('pesan') ?? 'Halo, perkenalkan dirimu!';

        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => 'Kamu adalah CafeBot, asisten AI untuk portal lowongan cafe.'],
                ['role' => 'user', 'content' => $pesan],
            ],
            'temperature' => 0.7,
            'max_tokens' => 1024,
        ];

        $this->info('Mengirim request ke Groq...');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', $payload);

            $this->line("HTTP Status: " . $response->status());

            if ($response->failed()) {
                $this->error('Response gagal:');
                $this->line($response->body());
                return Command::FAILURE;
            }

            $data = $response->json();
            $text = $data['choices'][0]['message']['content'] ?? '(tidak ada teks)';

            $this->info('Jawaban Groq:');
            $this->line($text);

            $usage = $data['usage'] ?? [];
            if ($usage) {
                $this->line("---");
                $this->info("Prompt tokens: " . ($usage['prompt_tokens'] ?? '?'));
                $this->info("Response tokens: " . ($usage['completion_tokens'] ?? '?'));
                $this->info("Total tokens: " . ($usage['total_tokens'] ?? '?'));
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Exception: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
