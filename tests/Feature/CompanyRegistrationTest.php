<?php

namespace Tests\Feature;

use App\Events\CompanyRegistered;
use App\Models\Nib;
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CompanyRegistrationTest extends TestCase
{
    use RefreshDatabase;

    private const ROUTE = '/api/v1/auth/register/perusahaan';

    protected function setUp(): void
    {
        parent::setUp();
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Storage::fake('public');
        Storage::fake('local');
        Event::fake([CompanyRegistered::class]);
        Notification::fake();
        Http::preventStrayRequests();
    }

    public function test_registration_persists_document_and_atomic_records(): void
    {
        $this->postJson(self::ROUTE, $this->payload() + [

            'latitude' => '-6.4',
            'longitude' => '108.3',
        ])->assertCreated()->assertJsonPath('success', true);

        $user = Pengguna::sole();
        $company = ProfilPerusahaan::sole();
        $nib = Nib::sole();
        $this->assertTrue(Hash::check('password123', $user->kata_sandi));
        $this->assertSame('Admin_Perusahaan', $user->peran);
        $this->assertSame($user->id_pengguna, $company->id_pengguna);
        $this->assertSame('Pending', $company->status_verifikasi);
        $this->assertSame('Jalan Uji No. 10, Indramayu', $company->alamat_perusahaan);
        $this->assertSame(-6.4, $company->latitude);
        $this->assertSame(108.3, $company->longitude);
        $this->assertSame($company->id_perusahaan, $nib->id_perusahaan);
        $this->assertSame($company->dokumen_izin, $nib->dokumen_nib);
        Storage::disk('local')->assertExists($company->dokumen_izin);
        $this->assertCount(1, Storage::disk('local')->allFiles());
        Event::assertDispatched(CompanyRegistered::class);
        Notification::assertSentTo($user, \App\Notifications\CompanyRegistrationReceivedNotification::class);
        Http::assertNothingSent();
    }


    #[DataProvider('acceptedFiles')]
    public function test_supported_document_formats_at_size_limit_are_accepted(string $extension, string $mime): void
    {
        $payload = $this->payload();
        $payload['dokumen_legalitas'] = UploadedFile::fake()->create('legalitas.'.$extension, 5120, $mime);
        $this->postJson(self::ROUTE, $payload)->assertCreated();
        $company = ProfilPerusahaan::sole();
        Storage::disk('local')->assertExists($company->dokumen_izin);
        $this->assertCount(1, Storage::disk('local')->allFiles());
    }

    public static function acceptedFiles(): array
    {
        return [
            ['pdf', 'application/pdf'],
            ['jpg', 'image/jpeg'],
            ['jpeg', 'image/jpeg'],
            ['png', 'image/png'],
        ];
    }

    #[DataProvider('invalidInputs')]
    public function test_validation_returns_first_indonesian_error_and_field_details(string $field, string $kind, string $message): void
    {
        $value = match ($kind) {
            'missing' => null,
            'email' => 'not-an-email',
            'short' => 'short',
            'short-name' => 'ab',
            'long-name' => str_repeat('a', 256),
            'array' => ['not a string'],
            'non-numeric' => 'north',
            'out-of-range' => 91,
            'upload-error' => new UploadedFile(__FILE__, 'upload.pdf', 'application/pdf', UPLOAD_ERR_INI_SIZE, true),
            'confirmation' => 'different-password',
            'coordinate-address' => '-6.4, 108.3',
            'unpaired' => -6.4,
            'document-type' => UploadedFile::fake()->create('legalitas.txt', 10, 'text/plain'),
            'large-document' => UploadedFile::fake()->create('legalitas.pdf', 5121, 'application/pdf'),

        };
        $payload = array_replace($this->payload(), [$field => $value]);
        if (in_array($kind, ['non-numeric', 'out-of-range'], true)) {
            $payload['longitude'] = 108.3;
        }
        $this->postJson(self::ROUTE, $payload)
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonValidationErrors($kind === 'unpaired' ? 'longitude' : $field)
            ->assertJsonPath('message', $message);
        $this->assertNoRegistration();
    }

    public static function invalidInputs(): array
    {
        return [
            'missing cafe name' => ['nama_kafe', 'missing', 'Nama kafe wajib diisi.'],
            'short cafe name' => ['nama_kafe', 'short-name', 'Nama kafe minimal 3 karakter.'],
            'long cafe name' => ['nama_kafe', 'long-name', 'Nama kafe maksimal 255 karakter.'],
            'non-string manager' => ['nama_pengelola', 'array', 'Nama pengelola harus berupa teks.'],
            'invalid email' => ['email', 'email', 'Email harus berupa alamat email yang valid.'],
            'non-numeric coordinate' => ['latitude', 'non-numeric', 'Latitude harus berupa angka.'],
            'out-of-range coordinate' => ['latitude', 'out-of-range', 'Latitude harus antara -90 dan 90.'],
            'failed legal document upload' => ['dokumen_legalitas', 'upload-error', 'Dokumen legalitas gagal diunggah.'],

            'short password' => ['kata_sandi', 'short', 'Kata sandi minimal 8 karakter.'],
            'confirmation mismatch' => ['konfirmasi_kata_sandi', 'confirmation', 'Konfirmasi kata sandi harus sama dengan kata sandi.'],
            'coordinate-only address' => ['alamat', 'coordinate-address', 'Alamat harus berupa teks alamat, bukan pasangan koordinat latitude/longitude.'],
            'unpaired coordinates' => ['latitude', 'unpaired', 'Longitude wajib diisi jika latitude diisi.'],
            'missing document' => ['dokumen_legalitas', 'missing', 'Dokumen wajib diunggah untuk keperluan verifikasi'],
            'unsupported document' => ['dokumen_legalitas', 'document-type', 'Format dokumen tidak valid'],
            'oversized document' => ['dokumen_legalitas', 'large-document', 'Ukuran dokumen maksimal 5MB'],

        ];
    }

    public function test_duplicate_email_returns_field_error_without_writing_files(): void
    {
        Pengguna::create([
            'nama_pengguna' => 'Existing User',
            'email' => 'cafe@example.com',
            'kata_sandi' => Hash::make('password123'),
            'peran' => 'Pelamar',
        ]);
        $message = 'Email ini sudah digunakan. Silakan gunakan email yang berbeda.';
        $this->postJson(self::ROUTE, $this->payload())
            ->assertStatus(422)
            ->assertJsonPath('message', $message)
            ->assertJsonPath('errors.email.0', $message);
        $this->assertDatabaseCount('pengguna', 1);
        $this->assertDatabaseCount('profil_perusahaan', 0);
        $this->assertDatabaseCount('nib', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
        Event::assertNotDispatched(CompanyRegistered::class);
        Notification::assertNothingSent();
    }

    public function test_same_original_filename_in_same_second_does_not_overwrite_documents(): void
    {
        $this->freezeTime();
        $this->postJson(self::ROUTE, $this->payload())->assertCreated();
        $this->postJson(self::ROUTE, array_replace($this->payload(), ['email' => 'second@example.com']))->assertCreated();
        $paths = ProfilPerusahaan::pluck('dokumen_izin')->all();
        $this->assertNotSame($paths[0], $paths[1]);
        Storage::disk('local')->assertExists($paths);
        $this->assertCount(2, Storage::disk('local')->allFiles());
    }

    #[DataProvider('storageFailures')]
    public function test_storage_failure_returns_safe_json_and_cleans_partial_uploads(bool $throws): void
    {
        $disk = Storage::disk('local');
        $disk->put('legalitas/existing.pdf', 'keep me');
        $mock = Mockery::mock($disk);
        $mock->shouldReceive('putFileAs')->andReturnUsing(function (...$arguments) use ($disk, $throws) {
            $disk->putFileAs(...$arguments);
            if ($throws) {
                throw new \RuntimeException('PRIVATE storage credentials and path');
            }
            return false;
        });
        Storage::set('public', $mock);

        $response = $this->postJson(self::ROUTE, $this->payload());
        $response->assertStatus(500)->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Terjadi kesalahan saat pendaftaran');
        $this->assertStringNotContainsString('PRIVATE', $response->getContent());
        $this->assertNoRegistration(['legalitas/existing.pdf']);
    }

    public static function storageFailures(): array
    {
        return [
            'legal document exception' => [true],
            'legal document false' => [false],
        ];
    }

    #[DataProvider('recordFailures')]
    public function test_database_failure_rolls_back_all_records_and_document(string $model): void
    {
        Storage::disk('local')->put('legalitas/existing.pdf', 'keep me');
        $listener = 'eloquent.creating: '.$model;
        Event::listen($listener, function () {
            throw new \RuntimeException('PRIVATE database failure');
        });
        try {
            $response = $this->postJson(self::ROUTE, $this->payload());
            $response->assertStatus(500)->assertJsonPath('status', 'error');
            $this->assertStringNotContainsString('PRIVATE', $response->getContent());
            $this->assertNoRegistration(['legalitas/existing.pdf']);
        } finally {
            Event::forget($listener);
        }
    }

    public static function recordFailures(): array
    {
        return [[Pengguna::class], [ProfilPerusahaan::class], [Nib::class]];
    }

    #[DataProvider('notificationFailures')]
    public function test_post_commit_failures_do_not_report_failed_registration(string $failure): void
    {
        $initialTransactionLevel = DB::transactionLevel();
        $eventTransactionLevel = null;
        if ($failure === 'event') {
            Event::getFacadeRoot()->except([CompanyRegistered::class]);
            Event::listen(CompanyRegistered::class, function () use (&$eventTransactionLevel) {
                $eventTransactionLevel = DB::transactionLevel();
                throw new \RuntimeException('Event service unavailable');
            });
        } else {
            Notification::shouldReceive('send')->once()->andThrow(new \RuntimeException('Notification service unavailable'));
        }
        $this->postJson(self::ROUTE, $this->payload())
            ->assertCreated()->assertJsonPath('success', true);
        $this->assertDatabaseCount('pengguna', 1);
        $this->assertDatabaseCount('profil_perusahaan', 1);
        $this->assertDatabaseCount('nib', 1);
        $this->assertCount(1, Storage::disk('local')->allFiles());
        $this->assertSame($initialTransactionLevel, DB::transactionLevel());
        if ($failure === 'event') {
            $this->assertSame($initialTransactionLevel, $eventTransactionLevel);
            Notification::assertSentTo(Pengguna::sole(), \App\Notifications\CompanyRegistrationReceivedNotification::class);
        }
        Http::assertNothingSent();
    }

    public static function notificationFailures(): array
    {
        return [['event'], ['notification']];
    }

    private function assertNoRegistration(array $remainingFiles = []): void
    {
        $this->assertDatabaseCount('pengguna', 0);
        $this->assertDatabaseCount('profil_perusahaan', 0);
        $this->assertDatabaseCount('nib', 0);
        $this->assertSame($remainingFiles, Storage::disk('local')->allFiles());
        Event::assertNotDispatched(CompanyRegistered::class);
        Notification::assertNothingSent();
        Http::assertNothingSent();
    }

    private function payload(): array
    {
        return [
            'nama_kafe' => 'Kafe Uji',
            'nama_pengelola' => 'Pengelola Uji',
            'email' => 'cafe@example.com',
            'kata_sandi' => 'password123',
            'konfirmasi_kata_sandi' => 'password123',
            'alamat' => 'Jalan Uji No. 10, Indramayu',
            'dokumen_legalitas' => UploadedFile::fake()->create('legalitas.pdf', 10, 'application/pdf'),
        ];
    }
}
