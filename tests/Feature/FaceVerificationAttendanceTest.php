<?php

namespace Tests\Feature;

use App\Http\Resources\V1\Admin\WawancaraResource;
use App\Models\DataWajah;
use App\Models\Lamaran;
use App\Models\Notifikasi;
use App\Models\PresensiWawancara;
use App\Models\VerifikasiWajah;
use App\Models\Wawancara;
use App\Notifications\WawancaraConfirmedNotification;
use App\Services\V1\Admin\WawancaraService;
use App\Services\V1\Pelamar\FaceRecognitionService;
use Database\Factories\LamaranFactory;
use Database\Factories\PenggunaFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use NotificationChannels\Fcm\FcmChannel;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class FaceVerificationAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.timezone' => 'Asia/Jakarta']);
        $this->travelTo(\Carbon\Carbon::parse('2026-11-01 14:00:00', 'Asia/Jakarta'));
        Notification::fake();
        Http::preventStrayRequests();
    }

    private function application(string $status = 'Diproses'): Lamaran
    {
        $application = LamaranFactory::new()->create([
                    'status' => $status,
                    'id_lowongan' => \Database\Factories\LowonganFactory::new()->state(['status' => 'Active']),
                ]);
        $this->actingAs($application->profil->pengguna, 'api');

        return $application;
    }

    private function interview(Lamaran $application, array $attributes = []): Wawancara
    {
        return Wawancara::create(array_merge([
            'id_lamaran' => $application->id_lamaran,
            'tanggal_wawancara' => now()->subHour(),
            'lokasi' => 'Kafe',
            'status' => 'Terjadwal',
        ], $attributes));
    }

    private function faceResult(bool $success = true): array
    {
        return [
            'success' => $success, 'confidence' => $success ? 96.5 : 42.0,
            'threshold' => 85.0, 'face_detected' => true,
            'message' => $success ? 'Wajah cocok.' : 'Wajah tidak cocok.',
        ];
    }

    private function mockFace(bool $success = true): void
    {
        $this->mock(FaceRecognitionService::class)->shouldReceive('compareFaces')->once()->andReturn($this->faceResult($success));
    }

    private function verify(Lamaran $application)
    {
        return $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/verifikasi-wajah", ['image_base64' => 'transient-camera-image']);
    }

    private function attend(Lamaran $application, Wawancara $interview)
    {
        return $this->postJson("/api/v1/pelamar/lamaran/{$application->id_lamaran}/konfirmasi-wawancara", [
            'id_wawancara' => $interview->id_wawancara, 'image_base64' => 'transient-camera-image',
        ]);
    }

    public function test_application_verification_persists_reference_and_compatible_submission_snapshot(): void
    {
        $application = $this->application();
        $this->mockFace();
        $this->verify($application)->assertOk()->assertJsonPath('confidence', 96.5);
        $this->assertDatabaseHas('data_wajah', ['id_profil' => $application->id_profil, 'referensi_wajah' => $application->profil->foto_profil]);
        $this->assertDatabaseHas('verifikasi_wajah', [
            'id_pengguna' => $application->profil->id_pengguna, 'id_lamaran' => $application->id_lamaran,
            'jenis_verifikasi' => 'Lamaran', 'status_verifikasi' => 'Berhasil', 'skor_kemiripan' => 96.5,
        ]);
        Cache::flush();
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertOk();
        $snapshot = $application->fresh()->snapshot_profil['verifikasi_wajah'];
        $this->assertSame('Terverifikasi', $snapshot['status']);
        $this->assertEquals(96.5, $snapshot['tingkat_kemiripan']);
        $this->assertEquals(85, $snapshot['ambang_batas']);
        $this->assertNotEmpty($snapshot['diverifikasi_pada']);
        $this->assertStringNotContainsString('transient-camera-image', VerifikasiWajah::first()->toJson());
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertForbidden();
    }

    public function test_cache_alone_cannot_authorize_submission(): void
    {
        $application = $this->application();
        Cache::put("lamaran_face_verified_{$application->id_lamaran}_{$application->id_profil}", ['verified' => true]);
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
        $this->assertNull($application->fresh()->snapshot_profil);
    }

    public function test_failed_retry_is_persisted_and_invalidates_previous_success(): void
    {
        $application = $this->application();
        $this->mock(FaceRecognitionService::class)->shouldReceive('compareFaces')->twice()
            ->andReturn($this->faceResult(), $this->faceResult(false));
        $this->verify($application)->assertOk();
        $this->verify($application)->assertUnprocessable();
        $this->assertDatabaseCount('verifikasi_wajah', 2);
        $this->assertSame('Gagal', VerifikasiWajah::orderByDesc('id_verifikasi')->first()->status_verifikasi);
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
    }

    public function test_pending_retry_blocks_submission_and_late_success_cannot_override_newer_failure(): void
    {
        $application = $this->application();
        $mock = $this->mock(FaceRecognitionService::class);
        $mock->shouldReceive('compareFaces')->once()->ordered()->andReturnUsing(function () use ($application) {
            // RefreshDatabase owns the only open transaction; the provider call holds no application locks.
            $this->assertSame(1, DB::transactionLevel());
            $this->assertSame('Diproses', VerifikasiWajah::first()->status_verifikasi);
            $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
            $this->verify($application)->assertUnprocessable();
            return $this->faceResult();
        });
        $mock->shouldReceive('compareFaces')->once()->ordered()->andReturn($this->faceResult(false));
        $this->verify($application)->assertOk();
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
    }

    public function test_expired_or_changed_photo_verification_cannot_submit(): void
    {
        $application = $this->application();
        $this->mockFace();
        $this->verify($application)->assertOk();
        $this->travel(31)->minutes();
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
        $this->travelBack();
        $application->profil->update(['foto_profil' => 'profil/replaced.jpg']);
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
    }

    public function test_face_endpoints_reject_other_applicants_applications_without_scanning(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->actingAs(PenggunaFactory::new()->create(), 'api');
        // Give the other account its own profile rather than sharing the owner's profile.
        \Database\Factories\ProfilPelamarFactory::new()->create(['id_pengguna' => auth('api')->id()]);
        $this->mock(FaceRecognitionService::class)->shouldNotReceive('compareFaces');
        $this->verify($application)->assertNotFound();
        $this->attend($application, $interview)->assertNotFound();
        $this->assertDatabaseCount('verifikasi_wajah', 0);
        $this->assertDatabaseCount('presensi_wawancara', 0);
    }

    public function test_successful_attendance_is_idempotent_notifies_once_and_exposes_contract(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->mockFace();
        $response = $this->attend($application, $interview)->assertOk()
            ->assertJsonPath('data.presensi.id_wawancara', $interview->id_wawancara)
            ->assertJsonPath('data.presensi.status_kehadiran', 'Hadir')
                        ->assertJsonPath('data.status_jadwal', 'Selesai');
                    $this->assertSame('Selesai', $interview->fresh()->status);
                    $this->assertSame('Wawancara', $application->fresh()->status);
        $attendance = $response->json('data.presensi');
        $this->assertNotEmpty($attendance['waktu_presensi']);
        $this->attend($application, $interview)->assertOk()->assertJsonPath('data.presensi', $attendance)
                    ->assertJsonPath('data.status_jadwal', 'Selesai');
        $this->assertDatabaseCount('presensi_wawancara', 1);
        $this->assertDatabaseCount('verifikasi_wajah', 1);
        $this->assertSame('Berhasil', PresensiWawancara::first()->verifikasiWajah->status_verifikasi);
        Notification::assertSentToTimes($application->lowongan->perusahaan->pengguna, WawancaraConfirmedNotification::class, 1);
        $this->getJson("/api/v1/pelamar/lamaran/{$application->id_lamaran}")->assertOk()
            ->assertJsonPath('data.wawancara.presensi', $attendance)->assertJsonPath('data.wawancara.can_presensi', false)
                        ->assertJsonPath('data.wawancara.status_jadwal', 'Selesai');
        $this->getJson("/api/v1/pelamar/lamaran/{$application->id_lamaran}/wawancara")->assertOk()
            ->assertJsonPath('data.id_wawancara', $interview->id_wawancara)
            ->assertJsonPath('data.presensi', $attendance)->assertJsonPath('data.can_presensi', false)
                        ->assertJsonPath('data.status', 'Selesai');
        $resource = (new WawancaraResource($interview->fresh()))->resolve();
        $this->assertSame($attendance, $resource['presensi']);
                $this->assertSame('Selesai', $resource['status']);
    }

    public function test_interview_payload_is_required(): void
    {
        $application = $this->application('Wawancara');
        $this->postJson("/api/v1/pelamar/lamaran/{$application->id_lamaran}/konfirmasi-wawancara", [])
            ->assertUnprocessable()->assertJsonValidationErrors(['id_wawancara', 'image_base64']);
        $this->assertDatabaseCount('presensi_wawancara', 0);
    }

    public static function unavailableInterviews(): array
    {
        return [
            'tomorrow' => ['Wawancara', 'Terjadwal', '+1 day'],
            'yesterday' => ['Wawancara', 'Terjadwal', '-1 day'],
            'cancelled' => ['Wawancara', 'Dibatalkan', 'now'],
            'completed' => ['Wawancara', 'Selesai', 'now'],
            'wrong stage' => ['Diproses', 'Terjadwal', 'now'],
        ];
    }

    #[DataProvider('unavailableInterviews')]
    public function test_unavailable_interviews_cannot_record_attendance(string $stage, string $status, string $date): void
    {
        $application = $this->application($stage);
        $interview = $this->interview($application, ['status' => $status, 'tanggal_wawancara' => now()->modify($date)]);
        $this->mock(FaceRecognitionService::class)->shouldNotReceive('compareFaces');
        $this->attend($application, $interview)->assertUnprocessable();
        $this->getJson("/api/v1/pelamar/lamaran/{$application->id_lamaran}")->assertOk()
            ->assertJsonPath('data.wawancara.can_presensi', false);
        $this->assertDatabaseCount('presensi_wawancara', 0);
        Notification::assertNothingSent();
    }

    public function test_same_day_after_start_is_available_and_not_auto_cancelled(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        app(WawancaraService::class)->autoCancelOverdueInterviews($application->lowongan->id_perusahaan);
        $this->assertSame('Terjadwal', $interview->fresh()->status);
        $this->getJson("/api/v1/pelamar/lamaran/{$application->id_lamaran}/wawancara")->assertOk()
            ->assertJsonPath('data.can_presensi', true)->assertJsonPath('data.alasan_presensi', null)
            ->assertJsonPath('data.is_expired', false);
        $this->mockFace();
        $this->attend($application, $interview)->assertOk();
    }

    public function test_app_timezone_date_boundary_controls_attendance(): void
    {
        $application = $this->application('Wawancara');
        $this->travelTo(\Carbon\Carbon::parse('2026-11-01 18:00:00', 'UTC'));
        $interview = $this->interview($application, ['tanggal_wawancara' => '2026-11-02 09:00:00']);
        $this->mockFace();
        $this->attend($application, $interview)->assertOk();
    }

    public function test_failure_and_provider_exception_persist_without_attendance_or_notifications(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $mock = $this->mock(FaceRecognitionService::class);
        $mock->shouldReceive('compareFaces')->once()->ordered()->andReturn($this->faceResult(false));
        $mock->shouldReceive('compareFaces')->once()->ordered()->andThrow(new \RuntimeException('private provider payload'));
        $this->attend($application, $interview)->assertUnprocessable();
        $this->assertSame('Terjadwal', $interview->fresh()->status);
        $response = $this->attend($application, $interview)->assertUnprocessable();
        $this->assertStringNotContainsString('private provider payload', $response->getContent());
        $this->assertDatabaseCount('verifikasi_wajah', 2);
        $this->assertSame(2, VerifikasiWajah::where('status_verifikasi', 'Gagal')->count());
                $this->assertSame('Terjadwal', $interview->fresh()->status);
        $this->assertDatabaseCount('presensi_wawancara', 0);
        Notification::assertNothingSent();
    }

    public function test_stale_schedule_id_is_rejected_before_scanning(): void
    {
        $application = $this->application('Wawancara');
        $old = $this->interview($application);
        $this->interview($application);
        $this->mock(FaceRecognitionService::class)->shouldNotReceive('compareFaces');
        $this->attend($application, $old)->assertUnprocessable()->assertJsonValidationErrors('id_wawancara');
        $this->assertDatabaseCount('verifikasi_wajah', 0);
    }

    public function test_rescheduling_during_comparison_rejects_attendance_but_preserves_outcome(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->mock(FaceRecognitionService::class)->shouldReceive('compareFaces')->once()->andReturnUsing(function () use ($interview) {
            $interview->update(['tanggal_wawancara' => now()->addDay()]);
            return $this->faceResult();
        });
        $this->attend($application, $interview)->assertConflict();
        $this->assertDatabaseHas('verifikasi_wajah', ['status_verifikasi' => 'Kedaluwarsa', 'skor_kemiripan' => 96.5]);
                $this->assertSame('Terjadwal', $interview->fresh()->status);
        $this->assertDatabaseCount('presensi_wawancara', 0);
        Notification::assertNothingSent();
    }

    public function test_photo_change_during_application_comparison_cannot_authorize_submission(): void
    {
        $application = $this->application();
        $originalPhoto = $application->profil->foto_profil;
        $this->mock(FaceRecognitionService::class)->shouldReceive('compareFaces')->once()->andReturnUsing(function () use ($application) {
            $application->profil->update(['foto_profil' => 'profil/new.jpg']);
            return $this->faceResult();
        });
        $this->verify($application)->assertConflict();
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
        $application->profil->update(['foto_profil' => $originalPhoto]);
        $this->assertSame('Kedaluwarsa', VerifikasiWajah::first()->status_verifikasi);
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
    }

    public function test_overlapping_attendance_requests_create_only_one_attendance_and_notification(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $mock = $this->mock(FaceRecognitionService::class);
        $mock->shouldReceive('compareFaces')->once()->ordered()->andReturnUsing(function () use ($application, $interview) {
            $this->attend($application, $interview)->assertOk();
            return $this->faceResult();
        });
        $mock->shouldReceive('compareFaces')->once()->ordered()->andReturn($this->faceResult());
        $this->attend($application, $interview)->assertOk();
        $this->assertDatabaseCount('presensi_wawancara', 1);
        $this->assertDatabaseCount('verifikasi_wajah', 2);
        $this->assertSame('Selesai', $interview->fresh()->status);
        Notification::assertSentToTimes($application->lowongan->perusahaan->pengguna, WawancaraConfirmedNotification::class, 1);
        $duplicate = PresensiWawancara::first()->replicate();
        $this->expectException(\Illuminate\Database\QueryException::class);
        $duplicate->save();
    }

    public function test_attendance_notification_is_actually_stored_in_custom_database_channel(): void
    {
        Notification::swap(new \Illuminate\Notifications\ChannelManager($this->app));
        Mail::fake();
        $this->mock(FcmChannel::class)->shouldReceive('send')->once();
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->mockFace();
        $this->attend($application, $interview)->assertOk();
        $this->assertDatabaseHas('notifikasi', ['id_pengguna' => $application->lowongan->perusahaan->id_pengguna]);
        $this->assertStringContainsString('hadir dan siap diwawancarai', Notifikasi::first()->pesan);
        $this->assertStringContainsString('terverifikasi', Notifikasi::first()->pesan);
        $this->attend($application, $interview)->assertOk();
        $this->assertDatabaseCount('notifikasi', 1);
    }

    public function test_provider_error_response_is_persisted_and_does_not_authorize_submission(): void
    {
        $application = $this->application();
        $this->mock(FaceRecognitionService::class)->shouldReceive('compareFaces')->once()->andReturn([
            'success' => false, 'confidence' => null, 'threshold' => 85.0,
            'face_detected' => false, 'message' => 'Layanan verifikasi wajah mengalami gangguan.',
        ]);
        $this->verify($application)->assertUnprocessable()->assertJsonPath('confidence', null);
        $this->assertDatabaseHas('verifikasi_wajah', ['status_verifikasi' => 'Gagal', 'skor_kemiripan' => null]);
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
    }

    public static function changedInterviewContext(): array
    {
        return [['cancelled'], ['completed'], ['stage'], ['replacement'], ['photo'], ['next day']];
    }

    #[DataProvider('changedInterviewContext')]
    public function test_context_is_revalidated_after_face_comparison(string $change): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->mock(FaceRecognitionService::class)->shouldReceive('compareFaces')->once()->andReturnUsing(function () use ($change, $application, $interview) {
            match ($change) {
                'cancelled' => $interview->update(['status' => 'Dibatalkan']),
                'completed' => $interview->update(['status' => 'Selesai']),
                'stage' => $application->update(['status' => 'Ditolak']),
                'replacement' => $this->interview($application),
                'photo' => $application->profil->update(['foto_profil' => 'profil/replaced.jpg']),
                'next day' => $this->travel(1)->days(),
            };
            return $this->faceResult();
        });
        $this->attend($application, $interview)->assertConflict();
        $this->assertDatabaseCount('verifikasi_wajah', 1);
        $this->assertDatabaseCount('presensi_wawancara', 0);
        Notification::assertNothingSent();
    }

    public function test_conflicted_application_verification_cannot_be_reused_after_stage_is_reverted(): void
    {
        $application = $this->application();
        $mock = $this->mock(FaceRecognitionService::class);
        $mock->shouldReceive('compareFaces')->once()->ordered()->andReturnUsing(function () use ($application) {
            $application->update(['status' => 'Wawancara']);
            return $this->faceResult();
        });
        $mock->shouldReceive('compareFaces')->once()->ordered()->andReturn($this->faceResult());
        $this->verify($application)->assertConflict();
        $this->assertDatabaseHas('verifikasi_wajah', [
            'status_verifikasi' => 'Kedaluwarsa', 'skor_kemiripan' => 96.5, 'ambang_batas' => 85,
        ]);
        $application->update(['status' => 'Diproses']);
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertUnprocessable();
        $this->assertNull($application->fresh()->snapshot_profil);
        $this->verify($application)->assertOk();
        $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/kirim")->assertOk();
    }

    public static function attendedScheduleEdits(): array
    {
        return [
            'date' => [['tanggal_wawancara' => '2026-11-02 10:00']],
            'location' => [['lokasi' => 'Lokasi baru']],
            'notes' => [['catatan' => 'Jadwal baru']],
            'cancel' => [['status' => 'Dibatalkan']],
            'completion with reschedule' => [['status' => 'Selesai', 'tanggal_wawancara' => '2026-11-02 10:00']],
        ];
    }

    #[DataProvider('attendedScheduleEdits')]
    public function test_admin_cannot_edit_schedule_after_attendance(array $changes): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->mockFace();
        $attendance = $this->attend($application, $interview)->assertOk()->json('data.presensi');
        $original = $interview->fresh()->getAttributes();
        $this->actingAs($application->lowongan->perusahaan->pengguna, 'api');
        $this->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", $changes)
            ->assertUnprocessable()->assertJsonPath('errors.id_wawancara.0',
                'Jadwal wawancara tidak dapat diubah setelah presensi tercatat. Anda tetap dapat menyelesaikan wawancara.');
        $this->assertSame($original, $interview->fresh()->getAttributes());
        $this->assertSame($attendance, $interview->fresh()->presensi->responseData());
        Notification::assertSentTimes(WawancaraConfirmedNotification::class, 1);
    }

    public function test_admin_cannot_bypass_attendance_lock_by_scheduling_again(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->mockFace();
        $this->attend($application, $interview)->assertOk();
        $application->update(['status' => 'Diterima']);
        $logCount = $application->logStatus()->count();
        $this->actingAs($application->lowongan->perusahaan->pengguna, 'api');
        $this->postJson("/api/v1/admin/lamaran/{$application->id_lamaran}/wawancara", [
            'tanggal' => '2026-11-02', 'waktu' => '10:00', 'tempat_link' => 'Kafe baru',
            'tanggal_wawancara' => '2026-11-02 10:00', 'lokasi' => 'Kafe baru',
        ])->assertUnprocessable()->assertJsonStructure(['errors' => ['id_wawancara']]);
        $this->assertDatabaseCount('wawancara', 1);
        $this->assertSame('Diterima', $application->fresh()->status);
        $this->assertSame($logCount, $application->logStatus()->count());
        $this->assertDatabaseCount('presensi_wawancara', 1);
    }

    public function test_attendance_completes_interview_automatically_and_cannot_be_reopened_or_auto_cancelled(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->mockFace();
        $attendance = $this->attend($application, $interview)->assertOk()->json('data.presensi');
        $this->travel(1)->days();
        app(WawancaraService::class)->autoCancelOverdueInterviews($application->lowongan->id_perusahaan);
        $this->assertSame('Selesai', $interview->fresh()->status);
        $this->actingAs($application->lowongan->perusahaan->pengguna, 'api');
        $this->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", ['status' => 'Selesai'])->assertOk();
        $this->postJson("/api/v1/admin/wawancara/{$interview->id_wawancara}/selesai")->assertOk();
        $this->assertSame('Selesai', $interview->fresh()->status);
        $this->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", ['status' => 'Terjadwal'])->assertUnprocessable();
        $this->assertSame('Selesai', $interview->fresh()->status);
        $this->assertSame($attendance, $interview->fresh()->presensi->responseData());
    }

    public function test_unattended_interview_remains_editable(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->actingAs($application->lowongan->perusahaan->pengguna, 'api');
        $this->putJson("/api/v1/admin/wawancara/{$interview->id_wawancara}", [
            'tanggal_wawancara' => '2026-11-02 10:00', 'lokasi' => 'Kafe baru',
        ])->assertOk();
        $this->assertSame('2026-11-02 10:00:00', $interview->fresh()->tanggal_wawancara->toDateTimeString());
        $this->assertSame('Kafe baru', $interview->fresh()->lokasi);
    }

    public function test_attended_interview_delete_is_rejected_and_preserves_audit_records(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->mockFace();
        $this->attend($application, $interview)->assertOk();
        $originalInterview = $interview->fresh()->getAttributes();
        $originalAttendance = PresensiWawancara::first()->getAttributes();
        $originalVerification = VerifikasiWajah::first()->getAttributes();
        $this->actingAs($application->lowongan->perusahaan->pengguna, 'api');

        $this->deleteJson("/api/v1/admin/wawancara/{$interview->id_wawancara}")
            ->assertUnprocessable()->assertJsonPath('errors.id_wawancara.0',
                'Jadwal wawancara tidak dapat diubah setelah presensi tercatat. Anda tetap dapat menyelesaikan wawancara.');

        $this->assertSame($originalInterview, $interview->fresh()->getAttributes());
        $this->assertDatabaseCount('presensi_wawancara', 1);
        $this->assertDatabaseCount('verifikasi_wajah', 1);
        $this->assertSame($originalAttendance, PresensiWawancara::first()->getAttributes());
        $this->assertSame($originalVerification, VerifikasiWajah::first()->getAttributes());
    }

    public function test_unattended_interview_can_still_be_deleted(): void
    {
        $application = $this->application('Wawancara');
        $interview = $this->interview($application);
        $this->actingAs($application->lowongan->perusahaan->pengguna, 'api');

        $this->deleteJson("/api/v1/admin/wawancara/{$interview->id_wawancara}")
            ->assertOk()->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('wawancara', ['id_wawancara' => $interview->id_wawancara]);
        $this->assertDatabaseHas('lamaran', ['id_lamaran' => $application->id_lamaran]);
    }

    public function test_face_routes_are_throttled(): void
    {
        $application = $this->application();
        for ($i = 0; $i < 5; $i++) {
            $this->postJson("/api/v1/lamaran/{$application->id_lamaran}/verifikasi-wajah", [])->assertUnprocessable();
        }
        $this->verify($application)->assertStatus(429);
        $this->postJson("/api/v1/pelamar/lamaran/{$application->id_lamaran}/konfirmasi-wawancara", [])->assertStatus(429);
    }
}
