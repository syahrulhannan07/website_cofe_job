<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use App\Repositories\V1\PenggunaRepository;
use App\Repositories\V1\Admin\LowonganRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PenggunaRepository::class, function ($app) {
            return new PenggunaRepository();
        });
    }

    public function boot(): void
    {
        RateLimiter::for('geocoding', fn (Request $request) => Limit::perMinute(30)->by($request->ip()));

        RateLimiter::for('face-verification', fn (Request $request) => Limit::perMinute(5)
            ->by('face:' . ($request->user()?->getAuthIdentifier() ?? $request->ip())));

        // Event listeners are auto-discovered by Laravel from the app/Listeners directory.
    }
}
