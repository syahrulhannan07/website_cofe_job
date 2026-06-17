<?php

namespace App\Listeners;

use App\Events\LowonganPublished;
use App\Services\V1\Admin\AIScoringService;

class RunAIDetection
{
    public function __construct(
        protected AIScoringService $aiService
    ) {}

    public function handle(LowonganPublished $event): void
    {
        $lowongan = $event->lowongan;

        if (!$lowongan->perusahaan?->pengguna) {
            return;
        }

        $this->aiService->evaluasiLowongan($lowongan);
    }
}
