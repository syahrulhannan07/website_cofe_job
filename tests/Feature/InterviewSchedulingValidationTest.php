<?php

namespace Tests\Feature;

use App\Events\WawancaraScheduled;
use App\Events\WawancaraUpdated;
use App\Models\Lamaran;
use App\Models\Wawancara;
use Database\Factories\LamaranFactory;
use Database\Factories\LowonganFactory;
use Database\Factories\PenggunaFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class InterviewSchedulingValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.timezone' => 'Asia/Jakarta']);
        $this->travelTo(\Carbon\Carbon::parse('2026-11-01 14:00:00', 'Asia/Jakarta'));
        Event::fake([WawancaraScheduled::class, WawancaraUpdated::class]);
        Notification::fake();
        Mail::fake();
        Http::preventStrayRequests();
    }

    private function application(): Lamaran
    {
        return LamaranFactory::new()->create([
            'id_lowongan' => LowonganFactory::new()->state(['status' => 'Active']),
        ]);
    }

    private function asOwner(Lamaran $application): static
    {
        return $this->actingAs($application->lowongan->perusahaan->pengguna, 'api');
    }

    private function storeUrl(Lamaran $application): string
    {
        return "/api/v1/admin/lamaran/{$application->id_lamaran}/wawancara";
    }

    private function interview(Lamaran $application): Wawancara
    {
        return Wawancara::create([
            'id_lamaran' => $application->id_lamaran,
            'tanggal_wawancara' => '2026-11-02 10:00:00',
            'lokasi' => 'Kafe',
            'status' => 'Terjadwal',
        ]);
    }

    public static function validPayloads(): array
    {
        return [
            'frontend minutes' => [[
                'tanggal' => '2026-11-02', 'waktu' => '10:30', 'tempat_link' => 'Google Meet',
                'tanggal_wawancara' => '2026-11-02 10:30', 'lokasi' => 'Google Meet',
                'status' => 'Terjadwal', 'catatan' => 'Hadir 10 menit sebelumnya.',
            ], '2026-11-02 10:30:00'],
            'frontend seconds' => [[
                'tanggal' => '2026-11-02', 'waktu' => '10:30:45', 'tempat_link' => 'Google Meet',
                'tanggal_wawancara' => '2026-11-02 10:30:45', 'lokasi' => 'Google Meet',
            ], '2026-11-02 10:30:45'],
            'canonical only' => [[
                'tanggal_wawancara' => '2026-11-02 10:30', 'lokasi' => 'Google Meet',
            ], '2026-11-02 10:30:00'],
            'split only' => [[
                'tanggal' => '2026-11-02', 'waktu' => '10:30', 'tempat_link' => 'Google Meet',
            ], '2026-11-02 10:30:00'],
            'split seconds' => [[
                'tanggal' => '2026-11-02', 'waktu' => '10:30:45', 'lokasi' => 'Google Meet',
            ], '2026-11-02 10:30:45'],
            'datetime-local minutes' => [[
                'tanggal_wawancara' => '2026-11-02T10:30', 'lokasi' => 'Google Meet',
            ], '2026-11-02 10:30:00'],
            'datetime-local seconds' => [[
                'tanggal_wawancara' => '2026-11-02T10:30:45', 'lokasi' => 'Google Meet',
            ], '2026-11-02 10:30:45'],
            'canonical overrides aliases' => [[
                'tanggal_wawancara' => '2026-11-02 10:30', 'lokasi' => 'Google Meet',
                'tanggal' => 'invalid', 'waktu' => [], 'tempat_link' => ['invalid'],
            ], '2026-11-02 10:30:00'],
            'today future seconds' => [[
                'tanggal_wawancara' => '2026-11-01 14:00:01', 'lokasi' => 'Google Meet',
            ], '2026-11-01 14:00:01'],
        ];
    }

    #[DataProvider('validPayloads')]
    public function test_store_accepts_supported_payloads_and_preserves_seconds(array $payload, string $expected): void
    {
        $application = $this->application();
        $this->asOwner($application)->postJson($this->storeUrl($application), $payload)
            ->assertCreated()->assertJsonPath('data.tanggal_wawancara', $expected)
            ->assertJsonPath('data.lokasi', 'Google Meet')->assertJsonPath('data.status', 'Terjadwal');
        $this->assertDatabaseHas('wawancara', [
            'id_lamaran' => $application->id_lamaran, 'tanggal_wawancara' => $expected, 'lokasi' => 'Google Meet',
        ]);
        $this->assertSame('Wawancara', $application->fresh()->status);
        Event::assertDispatched(WawancaraScheduled::class);
    }

    public static function pastDatetimes(): array
    {
        return [
            'today past minutes' => ['2026-11-01 13:59'],
            'today past seconds' => ['2026-11-01 13:59:59'],
            'exactly now' => ['2026-11-01 14:00:00'],
            'yesterday' => ['2026-10-31 15:00'],
        ];
    }

    #[DataProvider('pastDatetimes')]
    public function test_store_rejects_past_or_current_time_with_actionable_message(string $datetime): void
    {
        $application = $this->application();
        $response = $this->asOwner($application)->postJson($this->storeUrl($application), [
            'tanggal' => substr($datetime, 0, 10), 'waktu' => substr($datetime, 11), 'tempat_link' => 'Kafe',
            'tanggal_wawancara' => $datetime, 'lokasi' => 'Kafe',
        ])->assertUnprocessable()->assertJsonPath('message',
            'Tanggal dan waktu wawancara harus setelah waktu sekarang. Pilih tanggal atau jam yang akan datang.');
        $response->assertJsonPath('errors.tanggal_wawancara.0', $response->json('message'));
        $this->assertDatabaseCount('wawancara', 0);
        $this->assertSame('Diproses', $application->fresh()->status);
        Event::assertNotDispatched(WawancaraScheduled::class);
    }

    public static function invalidPayloads(): array
    {
        return [
            'missing datetime' => [['lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'missing location' => [['tanggal_wawancara' => '2026-11-02 10:30'], 'lokasi'],
            'impossible date' => [['tanggal_wawancara' => '2027-02-30 10:30', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'non-leap date' => [['tanggal_wawancara' => '2027-02-29T10:30:45', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'invalid hour' => [['tanggal_wawancara' => '2026-11-02 24:30', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'invalid seconds' => [['tanggal_wawancara' => '2026-11-02 10:30:60', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'date only' => [['tanggal_wawancara' => '2026-11-02', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'loose format' => [['tanggal_wawancara' => '2026-11-2 1:30', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'trailing junk' => [['tanggal_wawancara' => '2026-11-02T10:30junk', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'timezone suffix' => [['tanggal_wawancara' => '2026-11-02T10:30:00Z', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'array datetime' => [['tanggal_wawancara' => [], 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'bad canonical cannot use fallback' => [[
                'tanggal_wawancara' => 'invalid', 'tanggal' => '2026-11-02', 'waktu' => '10:30', 'lokasi' => 'Kafe',
            ], 'tanggal_wawancara'],
            'partial split' => [['tanggal' => '2026-11-02', 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'array split' => [['tanggal' => [], 'waktu' => [], 'lokasi' => 'Kafe'], 'tanggal_wawancara'],
            'invalid location' => [['tanggal_wawancara' => '2026-11-02 10:30', 'tempat_link' => []], 'lokasi'],
            'long location' => [['tanggal_wawancara' => '2026-11-02 10:30', 'lokasi' => str_repeat('a', 501)], 'lokasi'],
            'invalid status' => [[
                'tanggal' => '2026-11-02', 'waktu' => '10:30', 'tempat_link' => 'Kafe',
                'tanggal_wawancara' => '2026-11-02 10:30', 'lokasi' => 'Kafe', 'status' => 'Hacked',
            ], 'status'],
            'invalid notes' => [['tanggal_wawancara' => '2026-11-02 10:30', 'lokasi' => 'Kafe', 'catatan' => []], 'catatan'],
        ];
    }

    #[DataProvider('invalidPayloads')]
    public function test_store_rejects_invalid_fields_without_persisting(array $payload, string $field): void
    {
        $application = $this->application();
        $response = $this->asOwner($application)->postJson($this->storeUrl($application), $payload)
            ->assertUnprocessable()->assertJsonStructure(['errors' => [$field]]);
        $this->assertSame($response->json("errors.{$field}.0"), $response->json('message'));
        $this->assertNotSame('Validasi gagal', $response->json('message'));
        $this->assertDatabaseCount('wawancara', 0);
        Event::assertNotDispatched(WawancaraScheduled::class);
    }

    #[DataProvider('validPayloads')]
    public function test_update_uses_the_same_normalization(array $payload, string $expected): void
    {
        $application = $this->application();
        $interview = $this->interview($application);
        $this->asOwner($application)->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", $payload)
            ->assertOk()->assertJsonPath('data.tanggal_wawancara', $expected)
            ->assertJsonPath('data.lokasi', 'Google Meet');
        $this->assertSame($expected, $interview->fresh()->tanggal_wawancara->toDateTimeString());
        Event::assertDispatched(WawancaraUpdated::class);
    }

    public function test_update_preserves_past_date_policy_and_does_not_accept_application_injection(): void
    {
        $application = $this->application();
        $other = $this->application();
        $interview = $this->interview($application);
        $this->asOwner($application)->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", [
            'tanggal_wawancara' => '2026-11-01 13:30', 'id_lamaran' => $other->id_lamaran,
        ])->assertOk();
        $this->assertSame($application->id_lamaran, $interview->fresh()->id_lamaran);
        $this->assertSame('2026-11-01 13:30:00', $interview->fresh()->tanggal_wawancara->toDateTimeString());
        $this->assertSame('Kafe', $interview->fresh()->lokasi);
    }

    public function test_update_returns_detailed_validation_errors_without_changes(): void
    {
        $application = $this->application();
        $interview = $this->interview($application);
        $original = $interview->fresh()->getAttributes();
        foreach ([
            ['tanggal_wawancara' => '2027-02-30T10:30:00'],
            ['tanggal' => '2026-11-02'],
            ['tanggal' => [], 'waktu' => []],
            ['status' => 'Hacked'],
            ['lokasi' => str_repeat('a', 501)],
        ] as $payload) {
            $response = $this->asOwner($application)->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", $payload)
                ->assertUnprocessable();
            $this->assertNotSame('Validasi gagal', $response->json('message'));
            $this->assertSame($original, $interview->fresh()->getAttributes());
        }
        Event::assertNotDispatched(WawancaraUpdated::class);
    }

    public function test_store_uses_route_application_instead_of_input(): void
    {
        $application = $this->application();
        $other = $this->application();
        $this->asOwner($application)->postJson($this->storeUrl($application), [
            'tanggal_wawancara' => '2026-11-02 10:30', 'lokasi' => 'Kafe', 'id_lamaran' => $other->id_lamaran,
        ])->assertCreated();
        $this->assertDatabaseHas('wawancara', ['id_lamaran' => $application->id_lamaran]);
        $this->assertDatabaseMissing('wawancara', ['id_lamaran' => $other->id_lamaran]);
    }

    public function test_endpoints_require_authentication(): void
    {
        $application = $this->application();
        $interview = $this->interview($application);
        $this->postJson($this->storeUrl($application), [])->assertUnauthorized();
        $this->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", [])->assertUnauthorized();
    }

    public function test_endpoints_reject_non_admin_users(): void
    {
        $application = $this->application();
        $interview = $this->interview($application);
        $this->actingAs(PenggunaFactory::new()->create(), 'api');
        $this->postJson($this->storeUrl($application), [])->assertForbidden();
        $this->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", [])->assertForbidden();
    }

    public function test_other_company_cannot_schedule_or_update(): void
    {
        $application = $this->application();
        $other = $this->application();
        $interview = $this->interview($application);
        $payload = [
            'tanggal' => '2026-11-02', 'waktu' => '10:30', 'tempat_link' => 'Kafe baru',
            'tanggal_wawancara' => '2026-11-02 10:30', 'lokasi' => 'Kafe baru',
        ];
        $original = $interview->fresh()->getAttributes();
        $this->asOwner($other)->postJson($this->storeUrl($application), $payload)->assertNotFound();
        $this->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", $payload)->assertNotFound();
        $this->assertSame($original, $interview->fresh()->getAttributes());
        $this->assertDatabaseCount('wawancara', 1);
        Event::assertNotDispatched(WawancaraScheduled::class);
        Event::assertNotDispatched(WawancaraUpdated::class);
    }
}
