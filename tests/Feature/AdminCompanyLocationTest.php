<?php

namespace Tests\Feature;

use App\Models\ProfilPerusahaan;
use Database\Factories\PenggunaFactory;
use Database\Factories\ProfilPerusahaanFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminCompanyLocationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        Storage::fake('public');
        Http::preventStrayRequests();
    }

    #[DataProvider('validCoordinates')]
    public function test_admin_saves_location_and_admin_and_public_details_reload_it(array $coordinates): void
    {
        $company = $this->createCompany();
        $address = 'Jalan Lokasi Baru, Indramayu';
        $latitude = (float) $coordinates['latitude'];
        $longitude = (float) $coordinates['longitude'];

        $this->actingAs($company->pengguna, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', [
                'alamat_perusahaan' => $address,
            ] + $coordinates)
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.alamat_perusahaan', $address)
            ->assertJsonPath('data.latitude', fn ($value) => (float) $value === $latitude)
            ->assertJsonPath('data.longitude', fn ($value) => (float) $value === $longitude);

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $company->id_perusahaan,
            'alamat_perusahaan' => $address,
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]);
        $company->refresh();
        $this->assertSame($latitude, $company->latitude);
        $this->assertSame($longitude, $company->longitude);

        $this->actingAs($company->pengguna->fresh(), 'api')
            ->getJson('/api/v1/admin/profil-perusahaan')
            ->assertOk()
            ->assertJsonPath('data.alamat_perusahaan', $address)
            ->assertJsonPath('data.latitude', fn ($value) => (float) $value === $latitude)
            ->assertJsonPath('data.longitude', fn ($value) => (float) $value === $longitude);

        $this->getJson('/api/v1/perusahaan/'.$company->id_perusahaan)
            ->assertOk()
            ->assertJsonPath('data.alamat_perusahaan', $address)
            ->assertJsonPath('data.latitude', fn ($value) => (float) $value === $latitude)
            ->assertJsonPath('data.longitude', fn ($value) => (float) $value === $longitude);
        Http::assertNothingSent();
    }

    public function test_moving_location_can_replace_and_clear_the_old_kecamatan(): void
    {
        $company = $this->createCompany();

        $this->actingAs($company->pengguna, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', [
                'alamat_perusahaan' => 'Alamat Baru, Jatibarang, Indramayu',
                'kecamatan' => 'Jatibarang',
                'latitude' => -6.475,
                'longitude' => 108.3,
            ])
            ->assertOk()
            ->assertJsonPath('data.kecamatan', 'Jatibarang')
            ->assertJsonPath('data.nama_pengguna', $company->pengguna->nama_pengguna)
            ->assertJsonPath('data.email', $company->pengguna->email);

        $this->getJson('/api/v1/admin/profil-perusahaan')
            ->assertOk()
            ->assertJsonPath('data.kecamatan', 'Jatibarang')
            ->assertJsonPath('data.nama_pengguna', $company->pengguna->nama_pengguna)
            ->assertJsonPath('data.email', $company->pengguna->email);

        $this->postJson('/api/v1/admin/profil-perusahaan', [
            'alamat_perusahaan' => 'Alamat Baru Lainnya, Indramayu',
            'kecamatan' => '',
            'latitude' => -6.4,
            'longitude' => 108.3,
        ])
            ->assertOk()
            ->assertJsonPath('data.kecamatan', null);

        $this->assertNull($company->fresh()->kecamatan);
    }

    public static function validCoordinates(): array
    {
        return [
            'selected pin' => [['latitude' => -6.4, 'longitude' => 108.3]],
            'numeric strings' => [['latitude' => '-6.4000000', 'longitude' => '108.3000000']],
            'zero pair' => [['latitude' => 0, 'longitude' => 0]],
            'upper latitude and lower longitude limits' => [['latitude' => 90, 'longitude' => -180]],
            'lower latitude and upper longitude limits' => [['latitude' => -90, 'longitude' => 180]],
        ];
    }

    public function test_supplied_ids_cannot_target_another_company_or_change_ownership(): void
    {
        $company = $this->createCompany();
        $otherCompany = $this->createCompany();
        $otherAttributes = $otherCompany->fresh()->getAttributes();

        $this->actingAs($company->pengguna, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', [
                'id_perusahaan' => $otherCompany->id_perusahaan,
                'id_pengguna' => $otherCompany->id_pengguna,
                'alamat_perusahaan' => 'Jalan Milik Admin Sendiri',
                'latitude' => -6.4,
                'longitude' => 108.3,
            ])
            ->assertOk()
            ->assertJsonPath('data.id_perusahaan', $company->id_perusahaan)
            ->assertJsonPath('data.id_pengguna', $company->id_pengguna);

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $company->id_perusahaan,
            'id_pengguna' => $company->id_pengguna,
            'alamat_perusahaan' => 'Jalan Milik Admin Sendiri',
            'latitude' => -6.4,
            'longitude' => 108.3,
        ]);
        $this->assertSame($otherAttributes, $otherCompany->fresh()->getAttributes());
    }

    #[DataProvider('invalidLocations')]
    public function test_invalid_location_requests_do_not_change_company_or_user(array $location, array $fields): void
    {
        $company = $this->createCompany();
        $admin = $company->pengguna;
        $companyAttributes = $company->fresh()->getAttributes();
        $adminAttributes = $admin->fresh()->getAttributes();

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', $location + [
                'alamat_perusahaan' => 'Alamat Tidak Boleh Tersimpan',
                'nama_perusahaan' => 'Nama Tidak Boleh Tersimpan',
                'nama_pengguna' => 'Admin Tidak Boleh Tersimpan',
            ])
            ->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonValidationErrors($fields);

        $this->assertSame($companyAttributes, $company->fresh()->getAttributes());
        $this->assertSame($adminAttributes, $admin->fresh()->getAttributes());
        Http::assertNothingSent();
    }

    public static function invalidLocations(): array
    {
        $coordinates = ['latitude' => -6.4, 'longitude' => 108.3];

        return [
            'missing longitude' => [['latitude' => -6.4], ['longitude']],
            'missing latitude' => [['longitude' => 108.3], ['latitude']],
            'zero requires longitude' => [['latitude' => 0], ['longitude']],
            'zero requires latitude' => [['longitude' => 0], ['latitude']],
            'null latitude only' => [['latitude' => null], ['latitude', 'longitude']],
            'null longitude only' => [['longitude' => null], ['latitude', 'longitude']],
            'null pair' => [['latitude' => null, 'longitude' => null], ['latitude', 'longitude']],
            'empty latitude only' => [['latitude' => ''], ['latitude', 'longitude']],
            'empty longitude only' => [['longitude' => ''], ['latitude', 'longitude']],
            'empty pair' => [['latitude' => '', 'longitude' => ''], ['latitude', 'longitude']],
            'null latitude' => [['latitude' => null, 'longitude' => 108.3], ['latitude']],
            'null longitude' => [['latitude' => -6.4, 'longitude' => null], ['longitude']],
            'empty latitude' => [['latitude' => '', 'longitude' => 108.3], ['latitude']],
            'empty longitude' => [['latitude' => -6.4, 'longitude' => ''], ['longitude']],
            'whitespace pair' => [['latitude' => '   ', 'longitude' => '   '], ['latitude', 'longitude']],
            'latitude too high' => [['latitude' => 90.1, 'longitude' => 108.3], ['latitude']],
            'latitude too low' => [['latitude' => -90.1, 'longitude' => 108.3], ['latitude']],
            'longitude too high' => [['latitude' => -6.4, 'longitude' => 180.1], ['longitude']],
            'longitude too low' => [['latitude' => -6.4, 'longitude' => -180.1], ['longitude']],
            'non-numeric latitude' => [['latitude' => 'invalid', 'longitude' => 108.3], ['latitude']],
            'non-numeric longitude' => [['latitude' => -6.4, 'longitude' => 'invalid'], ['longitude']],
            'array latitude' => [['latitude' => [-6.4], 'longitude' => 108.3], ['latitude']],
            'array longitude' => [['latitude' => -6.4, 'longitude' => [108.3]], ['longitude']],
            'boolean latitude' => [['latitude' => false, 'longitude' => 108.3], ['latitude']],
            'boolean longitude' => [['latitude' => -6.4, 'longitude' => true], ['longitude']],

            'non-string address' => [$coordinates + ['alamat_perusahaan' => ['Jalan Baru']], ['alamat_perusahaan']],
        ];
    }

    #[DataProvider('validCoordinates')]
    public function test_coordinates_only_preserve_address_and_district_on_admin_and_public_reload(array $coordinates): void
    {
        $company = $this->createCompany(['kecamatan' => 'Indramayu']);
        $latitude = (float) $coordinates['latitude'];
        $longitude = (float) $coordinates['longitude'];

        $this->actingAs($company->pengguna, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', $coordinates)
            ->assertOk()
            ->assertJsonPath('data.alamat_perusahaan', $company->alamat_perusahaan)
            ->assertJsonPath('data.kecamatan', 'Indramayu')
            ->assertJsonPath('data.latitude', fn ($value) => (float) $value === $latitude)
            ->assertJsonPath('data.longitude', fn ($value) => (float) $value === $longitude);

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $company->id_perusahaan,
            'alamat_perusahaan' => $company->alamat_perusahaan,
            'kecamatan' => 'Indramayu',
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]);

        foreach ([
            '/api/v1/admin/profil-perusahaan',
            '/api/v1/perusahaan/'.$company->id_perusahaan,
        ] as $route) {
            $this->getJson($route)
                ->assertOk()
                ->assertJsonPath('data.alamat_perusahaan', $company->alamat_perusahaan)
                ->assertJsonPath('data.kecamatan', 'Indramayu')
                ->assertJsonPath('data.latitude', fn ($value) => (float) $value === $latitude)
                ->assertJsonPath('data.longitude', fn ($value) => (float) $value === $longitude);
        }

        Http::assertNothingSent();
    }

    public function test_coordinates_only_do_not_rewrite_a_legacy_coordinate_address(): void
    {
        $company = $this->createCompany(['alamat_perusahaan' => '-6.5, 108.2']);

        $this->actingAs($company->pengguna, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', [
                'latitude' => -6.4,
                'longitude' => 108.3,
            ])
            ->assertOk()
            ->assertJsonPath('data.alamat_perusahaan', '-6.5, 108.2');

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $company->id_perusahaan,
            'alamat_perusahaan' => '-6.5, 108.2',
            'latitude' => -6.4,
            'longitude' => 108.3,
        ]);
        Http::assertNothingSent();
    }

    #[DataProvider('coordinateAddresses')]
    public function test_coordinate_addresses_are_rejected_without_changing_company_or_user(string $address, array $coordinates): void
    {
        $company = $this->createCompany();
        $admin = $company->pengguna;
        $companyAttributes = $company->fresh()->getAttributes();
        $adminAttributes = $admin->fresh()->getAttributes();
        $message = 'Alamat harus berupa teks alamat, bukan pasangan koordinat latitude/longitude.';

        $this->actingAs($admin, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', $coordinates + [
                'alamat_perusahaan' => $address,
                'nama_pengguna' => 'Tidak Boleh Tersimpan',
                'kecamatan' => 'Jatibarang',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('alamat_perusahaan')
            ->assertJsonPath('message', $message)
            ->assertJsonPath('errors.alamat_perusahaan.0', $message);

        $this->assertSame($companyAttributes, $company->fresh()->getAttributes());
        $this->assertSame($adminAttributes, $admin->fresh()->getAttributes());
        Http::assertNothingSent();
    }

    public static function coordinateAddresses(): array
    {
        $cases = [];
        foreach ([
            'comma' => '-6.4, 108.3',
            'semicolon' => '-6.4;108.3',
            'signed decimals and whitespace' => " \t-6.4000 ; +108.3000\n",
            'integers' => '0, 0',
            'leading decimal points' => '-.4; +.3',
            'trailing decimal points' => '+6., -108.',
            'out of range pair' => '-91, 181',
        ] as $name => $address) {
            $cases[$name.' address only'] = [$address, []];
            $cases[$name.' with coordinates'] = [$address, ['latitude' => -6.4, 'longitude' => 108.3]];
        }

        return $cases;
    }

    #[DataProvider('nullableAddresses')]
    public function test_explicit_empty_addresses_remain_nullable_with_or_without_coordinates(?string $address, array $coordinates): void
    {
        $company = $this->createCompany();

        $this->actingAs($company->pengguna, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', ['alamat_perusahaan' => $address] + $coordinates)
            ->assertOk()
            ->assertJsonPath('data.alamat_perusahaan', null);

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $company->id_perusahaan,
            'alamat_perusahaan' => null,
            'latitude' => $coordinates['latitude'] ?? -6.5,
            'longitude' => $coordinates['longitude'] ?? 108.2,
        ]);
    }

    public static function nullableAddresses(): array
    {
        $cases = [];
        foreach (['null' => null, 'empty' => '', 'whitespace' => '   '] as $name => $address) {
            $cases[$name.' address only'] = [$address, []];
            $cases[$name.' with coordinates'] = [$address, ['latitude' => -6.4, 'longitude' => 108.3]];
        }

        return $cases;
    }

    #[DataProvider('legacyUpdates')]
    public function test_requests_omitting_coordinates_preserve_the_existing_pair(array $payload): void
    {
        $company = $this->createCompany();

        $this->actingAs($company->pengguna, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', $payload)
            ->assertOk()
            ->assertJsonPath('data.latitude', -6.5)
            ->assertJsonPath('data.longitude', 108.2);

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $company->id_perusahaan,
            'latitude' => -6.5,
            'longitude' => 108.2,
        ] + $payload);

        foreach ([
            '/api/v1/admin/profil-perusahaan',
            '/api/v1/perusahaan/'.$company->id_perusahaan,
        ] as $route) {
            $this->getJson($route)
                ->assertOk()
                ->assertJsonPath('data.alamat_perusahaan', $payload['alamat_perusahaan'] ?? $company->alamat_perusahaan)
                ->assertJsonPath('data.latitude', -6.5)
                ->assertJsonPath('data.longitude', 108.2);
        }

        Http::assertNothingSent();
    }

    public static function legacyUpdates(): array
    {
        return [
            'basic form' => [['nama_perusahaan' => 'Nama Kafe Baru', 'deskripsi' => 'Deskripsi baru']],
            'address only' => [['alamat_perusahaan' => 'Alamat Dari Form Lama']],
            'numbered street' => [['alamat_perusahaan' => 'Jalan Uji No. 6, Blok 108']],
            'semicolon in address' => [['alamat_perusahaan' => 'Jalan Uji; Indramayu']],
            'coordinates within address text' => [['alamat_perusahaan' => 'Kafe Uji (-6.4, 108.3)']],
        ];
    }

    public function test_logo_upload_without_coordinates_preserves_the_existing_location(): void
    {
        $company = $this->createCompany();
        $logo = UploadedFile::fake()->createWithContent('logo.png', base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='
        ));

        $this->actingAs($company->pengguna, 'api')
            ->post('/api/v1/admin/profil-perusahaan', ['logo' => $logo], ['Accept' => 'application/json'])
            ->assertOk();

        $company->refresh();
        $this->assertSame('Jalan Lokasi Lama, Indramayu', $company->alamat_perusahaan);
        $this->assertSame(-6.5, $company->latitude);
        $this->assertSame(108.2, $company->longitude);
        $this->assertNotSame('logo/default.png', $company->logo_perusahaan);
        Storage::disk('public')->assertExists($company->logo_perusahaan);
    }

    public function test_company_without_coordinates_can_add_a_location(): void
    {
        $company = $this->createCompany(['latitude' => null, 'longitude' => null]);

        $this->actingAs($company->pengguna, 'api')
            ->postJson('/api/v1/admin/profil-perusahaan', [
                'alamat_perusahaan' => 'Jalan Pin Pertama, Indramayu',
                'latitude' => -6.4,
                'longitude' => 108.3,
            ])
            ->assertOk();

        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $company->id_perusahaan,
            'alamat_perusahaan' => 'Jalan Pin Pertama, Indramayu',
            'latitude' => -6.4,
            'longitude' => 108.3,
        ]);
    }

    private function createCompany(array $attributes = []): ProfilPerusahaan
    {
        $admin = PenggunaFactory::new()->create([
            'peran' => 'Admin_Perusahaan',
            'status_akun' => 'Aktif',
        ]);

        return ProfilPerusahaanFactory::new()->create(array_replace([
            'id_pengguna' => $admin->id_pengguna,
            'status_verifikasi' => 'Diterima',
            'alamat_perusahaan' => 'Jalan Lokasi Lama, Indramayu',
            'latitude' => -6.5,
            'longitude' => 108.2,
        ], $attributes));
    }
}
