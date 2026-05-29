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

    public function boot(): void
    {
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\LowonganPublished::class,
            \App\Listeners\NotifyNewVacancyToPelamar::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\LamaranSubmitted::class,
            \App\Listeners\NotifyLamaranSubmittedToPelamar::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\LamaranSubmitted::class,
            \App\Listeners\NotifyNewApplicationToCompany::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\LamaranReviewed::class,
            \App\Listeners\NotifyPelamarLamaranReviewed::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\LamaranStatusUpdated::class,
            \App\Listeners\NotifyPelamarStatusUpdated::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\WawancaraScheduled::class,
            \App\Listeners\NotifyPelamarWawancaraScheduled::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\WawancaraUpdated::class,
            \App\Listeners\NotifyPelamarWawancaraUpdated::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\CompanyRegistered::class,
            \App\Listeners\NotifySuperAdminsOfRegistration::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\CompanyVerificationStatusChanged::class,
            \App\Listeners\NotifyCompanyOfVerificationStatusChange::class
        );
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\CompanyAccountStatusChanged::class,
            \App\Listeners\NotifyCompanyOfAccountStatusChange::class
        );
    }
}
