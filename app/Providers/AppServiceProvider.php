<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\V1\PenggunaRepository;
use App\Repositories\V1\Admin\LowonganRepository;
use App\Services\V1\Admin\AIScoringService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PenggunaRepository::class, function ($app) {
            return new PenggunaRepository();
        });

        $this->app->singleton(AIScoringService::class, function ($app) {
            return new AIScoringService(
                $app->make(LowonganRepository::class)
            );
        });
    }

    public function boot(): void
    {
        // Event listeners are auto-discovered by Laravel from the app/Listeners directory.
    }
}
