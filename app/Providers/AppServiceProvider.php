<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\V1\PenggunaRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Daftarkan layanan aplikasi ke Service Container.
     */
    public function register(): void
    {
        // Daftarkan PenggunaRepository sebagai Singleton
        $this->app->singleton(PenggunaRepository::class, function ($app) {
            return new PenggunaRepository();
        });
    }

    /**
     * Bootstrap layanan aplikasi.
     */
    public function boot(): void
    {
        //
    }
}
