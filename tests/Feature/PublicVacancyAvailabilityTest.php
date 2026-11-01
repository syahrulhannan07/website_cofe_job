<?php

namespace Tests\Feature;

use App\Http\Resources\Api\V1\Pelamar\LowonganDetailResource;
use App\Http\Resources\Api\V1\Pelamar\LowonganResource;
use App\Http\Resources\Api\V1\Pelamar\PerusahaanResource;
use App\Models\Lowongan;
use App\Models\ProfilPerusahaan;
use Database\Factories\LowonganFactory;
use Database\Factories\PenggunaFactory;
use Database\Factories\ProfilPerusahaanFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PublicVacancyAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    private ProfilPerusahaan $perusahaan;
    private array $available;
    private array $unavailable;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        $this->travelTo(now()->setDate(2026, 11, 1)->setTime(12, 0));

        $this->perusahaan = $this->createCompany();
        $this->available = [
            $this->createVacancy(),
            $this->createVacancy(['batas_akhir' => now()->toDateString()]),
        ];
        $this->unavailable = [
            $this->createVacancy(['status' => 'Closed']),
            $this->createVacancy(['status' => 'Draft']),
            $this->createVacancy(['batas_akhir' => now()->subDay()->toDateString()]),
            $this->createVacancy(),
        ];
        $this->unavailable[3]->delete();
    }

    public function test_company_list_and_detail_count_only_publicly_available_vacancies(): void
    {
        $id = $this->perusahaan->id_perusahaan;

        $this->getJson('/api/v1/perusahaan')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id_perusahaan', $id)
            ->assertJsonPath('data.0.jumlah_lowongan', 2);

        $detail = $this->getJson("/api/v1/perusahaan/{$id}")
            ->assertOk()
            ->assertJsonPath('data.jumlah_lowongan', 2)
            ->assertJsonCount(2, 'data.lowongan');

        $this->assertEqualsCanonicalizing(
            $this->availableIds(),
            array_column($detail->json('data.lowongan'), 'id')
        );
        foreach ($detail->json('data.lowongan') as $lowongan) {
            $this->assertSame(2, $lowongan['perusahaan']['jumlah_lowongan']);
        }
    }

    public function test_vacancy_list_and_detail_use_the_same_availability_and_company_count(): void
    {
        $list = $this->getJson('/api/v1/lowongan')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->assertEqualsCanonicalizing($this->availableIds(), array_column($list->json('data'), 'id'));
        foreach ($list->json('data') as $lowongan) {
            $this->assertSame(2, $lowongan['perusahaan']['jumlah_lowongan']);
        }

        foreach ($this->available as $lowongan) {
            $this->getJson("/api/v1/lowongan/{$lowongan->id_lowongan}")
                ->assertOk()
                ->assertJsonPath('data.id', $lowongan->id_lowongan)
                ->assertJsonPath('data.perusahaan.jumlah_lowongan', 2);
        }

        foreach ($this->unavailable as $lowongan) {
            $this->getJson("/api/v1/lowongan/{$lowongan->id_lowongan}")->assertNotFound();
        }

        // Public reads must exclude stale Active rows without relying on admin status synchronization.
        $this->assertDatabaseHas('lowongan', [
            'id_lowongan' => $this->unavailable[2]->id_lowongan,
            'status' => 'Active',
        ]);
    }

    public function test_resource_fallback_counts_match_counts_loaded_by_the_controller(): void
    {
        $perusahaan = $this->perusahaan->fresh();
        $this->assertArrayNotHasKey('lowongan_count', $perusahaan->getAttributes());
        $this->assertSame(2, (new PerusahaanResource($perusahaan))->resolve()['jumlah_lowongan']);

        $lowongan = $this->available[0]->fresh();
        $this->assertSame(2, (new LowonganResource($lowongan))->resolve()['perusahaan']['jumlah_lowongan']);
        $this->assertSame(2, (new LowonganDetailResource($lowongan))->resolve()['perusahaan']['jumlah_lowongan']);
    }

    public function test_company_with_no_available_vacancies_reports_zero_everywhere(): void
    {
        foreach ($this->available as $lowongan) {
            $lowongan->delete();
        }

        $id = $this->perusahaan->id_perusahaan;
        $this->getJson('/api/v1/perusahaan')
            ->assertOk()
            ->assertJsonPath('data.0.jumlah_lowongan', 0);
        $this->getJson("/api/v1/perusahaan/{$id}")
            ->assertOk()
            ->assertJsonPath('data.jumlah_lowongan', 0)
            ->assertJsonCount(0, 'data.lowongan');
        $this->getJson('/api/v1/lowongan')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/beranda')
            ->assertOk()
            ->assertJsonPath('data.perusahaan_populer.0.jumlah_lowongan', 0)
            ->assertJsonCount(0, 'data.lowongan_terbaru');

        $this->assertSame(0, (new PerusahaanResource($this->perusahaan->fresh()))->resolve()['jumlah_lowongan']);
    }

    public function test_unverified_companies_and_inactive_owners_have_no_public_vacancies(): void
    {
        $hiddenCompanies = [
            $this->createCompany(['status_verifikasi' => 'Pending']),
            $this->createCompany([], 'Nonaktif'),
        ];

        foreach ($hiddenCompanies as $perusahaan) {
            $lowongan = $this->createVacancy(['id_perusahaan' => $perusahaan->id_perusahaan]);

            $this->getJson("/api/v1/perusahaan/{$perusahaan->id_perusahaan}")->assertNotFound();
            $this->getJson("/api/v1/lowongan/{$lowongan->id_lowongan}")->assertNotFound();
            $this->assertSame(0, (new PerusahaanResource($perusahaan))->resolve()['jumlah_lowongan']);
            $this->assertSame(0, (new LowonganResource($lowongan))->resolve()['perusahaan']['jumlah_lowongan']);
            $this->assertSame(0, (new LowonganDetailResource($lowongan))->resolve()['perusahaan']['jumlah_lowongan']);
        }

        $this->getJson('/api/v1/perusahaan')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id_perusahaan', $this->perusahaan->id_perusahaan);
        $list = $this->getJson('/api/v1/lowongan')->assertOk()->assertJsonCount(2, 'data');
        $this->assertEqualsCanonicalizing($this->availableIds(), array_column($list->json('data'), 'id'));
        $this->getJson('/api/v1/beranda')
            ->assertOk()
            ->assertJsonCount(1, 'data.perusahaan_populer')
            ->assertJsonCount(2, 'data.lowongan_terbaru');
    }

    public function test_homepage_counts_and_popularity_ranking_exclude_expired_vacancies(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->createVacancy(['batas_akhir' => now()->subDay()->toDateString()]);
        }
        $popular = $this->createCompany();
        $expectedIds = $this->availableIds();
        for ($i = 0; $i < 3; $i++) {
            $expectedIds[] = $this->createVacancy(['id_perusahaan' => $popular->id_perusahaan])->id_lowongan;
        }

        $response = $this->getJson('/api/v1/beranda')
            ->assertOk()
            ->assertJsonCount(2, 'data.perusahaan_populer')
            ->assertJsonPath('data.perusahaan_populer.0.id_perusahaan', $popular->id_perusahaan)
            ->assertJsonPath('data.perusahaan_populer.0.jumlah_lowongan', 3)
            ->assertJsonPath('data.perusahaan_populer.1.id_perusahaan', $this->perusahaan->id_perusahaan)
            ->assertJsonPath('data.perusahaan_populer.1.jumlah_lowongan', 2)
            ->assertJsonCount(5, 'data.lowongan_terbaru');

        $this->assertEqualsCanonicalizing($expectedIds, array_column($response->json('data.lowongan_terbaru'), 'id'));
        foreach ($response->json('data.lowongan_terbaru') as $lowongan) {
            $expectedCount = $lowongan['perusahaan']['id_perusahaan'] === $popular->id_perusahaan ? 3 : 2;
            $this->assertSame($expectedCount, $lowongan['perusahaan']['jumlah_lowongan']);
        }
    }

    private function createCompany(array $attributes = [], string $ownerStatus = 'Aktif'): ProfilPerusahaan
    {
        $owner = PenggunaFactory::new()->create([
            'peran' => 'Admin_Perusahaan',
            'status_akun' => $ownerStatus,
        ]);

        return ProfilPerusahaanFactory::new()->create(array_merge([
            'id_pengguna' => $owner->id_pengguna,
            'status_verifikasi' => 'Diterima',
        ], $attributes));
    }

    private function createVacancy(array $attributes = []): Lowongan
    {
        return LowonganFactory::new()->create(array_merge([
            'id_perusahaan' => $this->perusahaan->id_perusahaan,
            'status' => 'Active',
            'batas_awal' => now()->subDays(7)->toDateString(),
            'batas_akhir' => now()->addDay()->toDateString(),
        ], $attributes));
    }

    private function availableIds(): array
    {
        return array_map(fn (Lowongan $lowongan) => $lowongan->id_lowongan, $this->available);
    }
}
