<?php

namespace Tests\Feature;

use App\Events\CompanyRegistered;
use App\Models\ProfilPerusahaan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RegistrationCoordinatesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Event::fake([CompanyRegistered::class]);
        Notification::fake();
        Http::preventStrayRequests();
    }

    #[DataProvider('validCoordinates')]
    public function test_both_registration_routes_persist_optional_coordinate_pairs(string $route, array $coordinates): void
    {
        $this->postJson($route, array_replace($this->payload($route), $coordinates))->assertCreated();

        $perusahaan = ProfilPerusahaan::sole();
        $this->assertSame(
            isset($coordinates['latitude']) ? (float) $coordinates['latitude'] : null,
            $perusahaan->latitude,
        );
        $this->assertSame(
            isset($coordinates['longitude']) ? (float) $coordinates['longitude'] : null,
            $perusahaan->longitude,
        );
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $perusahaan->id_perusahaan,
            'alamat_perusahaan' => 'Jalan Uji, Indramayu',
            'latitude' => $coordinates['latitude'] ?? null,
            'longitude' => $coordinates['longitude'] ?? null,
        ]);
        Http::assertNothingSent();
    }

    public static function validCoordinates(): array
    {
        $cases = [];
        foreach (self::routes() as $route) {
            foreach ([
                'selected pin' => ['latitude' => -6.4, 'longitude' => 108.3],
                'numeric form strings' => ['latitude' => '-6.4000000', 'longitude' => '108.3000000'],
                'omitted by old client' => [],
                'explicit null pair' => ['latitude' => null, 'longitude' => null],
                'global coordinates outside search bbox' => ['latitude' => -6.2, 'longitude' => 106.8],
                'zero pair' => ['latitude' => 0, 'longitude' => 0],
                'global limits' => ['latitude' => 90, 'longitude' => -180],
            ] as $name => $coordinates) {
                $cases[$route.' '.$name] = [$route, $coordinates];
            }
        }

        return $cases;
    }

    #[DataProvider('invalidCoordinates')]
    public function test_both_registration_routes_reject_invalid_or_unpaired_coordinates(string $route, array $coordinates, string $field): void
    {
        $this->postJson($route, array_replace($this->payload($route), $coordinates))
            ->assertStatus(422)->assertJsonValidationErrors($field);

        $this->assertDatabaseCount('profil_perusahaan', 0);
        $this->assertDatabaseCount('pengguna', 0);
        Http::assertNothingSent();
    }

    public static function invalidCoordinates(): array
    {
        $cases = [];
        foreach (self::routes() as $route) {
            foreach ([
                'missing longitude' => [['latitude' => -6.4], 'longitude'],
                'missing latitude' => [['longitude' => 108.3], 'latitude'],
                'null longitude' => [['latitude' => -6.4, 'longitude' => null], 'longitude'],
                'null latitude' => [['latitude' => null, 'longitude' => 108.3], 'latitude'],
                'zero still requires pair' => [['latitude' => 0], 'longitude'],
                'latitude too high' => [['latitude' => 90.1, 'longitude' => 108.3], 'latitude'],
                'latitude too low' => [['latitude' => -90.1, 'longitude' => 108.3], 'latitude'],
                'longitude too high' => [['latitude' => -6.4, 'longitude' => 180.1], 'longitude'],
                'longitude too low' => [['latitude' => -6.4, 'longitude' => -180.1], 'longitude'],
                'non-numeric latitude' => [['latitude' => 'invalid', 'longitude' => 108.3], 'latitude'],
                'array longitude' => [['latitude' => -6.4, 'longitude' => [108.3]], 'longitude'],
            ] as $name => [$coordinates, $field]) {
                $cases[$route.' '.$name] = [$route, $coordinates, $field];
            }
        }

        return $cases;
    }

    #[DataProvider('coordinateAddresses')]
    public function test_both_registration_address_fields_reject_coordinate_pairs(string $route, string $field, string $address): void
    {
        $this->postJson($route, array_replace($this->payload($route), [
            $field => $address,
            'latitude' => -6.4,
            'longitude' => 108.3,
        ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors($field)
            ->assertJsonPath('errors.'.$field.'.0', 'Alamat harus berupa teks alamat, bukan pasangan koordinat latitude/longitude.');

        $this->assertDatabaseCount('profil_perusahaan', 0);
        $this->assertDatabaseCount('pengguna', 0);
        $this->assertDatabaseCount('nib', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
        Event::assertNotDispatched(CompanyRegistered::class);
        Notification::assertNothingSent();
        Http::assertNothingSent();
    }

    public static function coordinateAddresses(): array
    {
        $cases = [];
        foreach (self::routes() as $route) {
            $field = $route === '/api/v1/auth/register/perusahaan' ? 'alamat' : 'alamat_perusahaan';
            foreach ([
                'comma' => '-6.4, 108.3',
                'semicolon' => '-6.4;108.3',
                'signed decimals and whitespace' => " \t-6.4000 ; +108.3000\n",
                'integers' => '0, 0',
                'leading decimal points' => '-.4; +.3',
                'trailing decimal points' => '+6., -108.',
                'out of range pair' => '-91, 181',
            ] as $name => $address) {
                $cases[$route.' '.$name] = [$route, $field, $address];
            }
        }

        return $cases;
    }

    #[DataProvider('normalAddresses')]
    public function test_both_registration_routes_keep_normal_addresses_independent_from_coordinates(string $route, string $address): void
    {
        $field = $route === '/api/v1/auth/register/perusahaan' ? 'alamat' : 'alamat_perusahaan';
        $this->postJson($route, array_replace($this->payload($route), [
            $field => $address,
            'latitude' => -6.4,
            'longitude' => 108.3,
        ]))->assertCreated();

        $perusahaan = ProfilPerusahaan::sole();
        $this->assertSame($address, $perusahaan->alamat_perusahaan);
        $this->assertSame(-6.4, $perusahaan->latitude);
        $this->assertSame(108.3, $perusahaan->longitude);
        $this->assertDatabaseHas('profil_perusahaan', [
            'id_perusahaan' => $perusahaan->id_perusahaan,
            'alamat_perusahaan' => $address,
            'latitude' => -6.4,
            'longitude' => 108.3,
        ]);
        Http::assertNothingSent();
    }

    public static function normalAddresses(): array
    {
        $cases = [];
        foreach (self::routes() as $route) {
            foreach ([
                'street address' => 'Jalan Uji, Indramayu',
                'numbered street' => 'Jalan Uji No. 6, Blok 108',
                'semicolon in address' => 'Jalan Uji; Indramayu',
                'coordinates within address text' => 'Kafe Uji (-6.4, 108.3)',
            ] as $name => $address) {
                $cases[$route.' '.$name] = [$route, $address];
            }
        }

        return $cases;
    }

    public function test_persisted_pin_is_exposed_in_public_company_and_admin_profile_responses(): void
    {
        $route = self::routes()[0];
        $this->postJson($route, array_replace($this->payload($route), [
            'latitude' => -6.4,
            'longitude' => 108.3,
        ]))->assertCreated();

        $perusahaan = ProfilPerusahaan::sole();
        $perusahaan->update(['status_verifikasi' => 'Diterima']);
        $perusahaan->pengguna->update(['status_akun' => 'Aktif']);

        $this->getJson('/api/v1/perusahaan/'.$perusahaan->id_perusahaan)
            ->assertOk()
            ->assertJsonPath('data.alamat_perusahaan', 'Jalan Uji, Indramayu')
            ->assertJsonPath('data.latitude', -6.4)
            ->assertJsonPath('data.longitude', 108.3);

        $this->actingAs($perusahaan->pengguna, 'api')->getJson('/api/v1/admin/profil-perusahaan')
            ->assertOk()
            ->assertJsonPath('data.alamat_perusahaan', 'Jalan Uji, Indramayu')
            ->assertJsonPath('data.latitude', -6.4)
            ->assertJsonPath('data.longitude', 108.3);
    }

    private static function routes(): array
    {
        return ['/api/v1/auth/register/perusahaan', '/api/v1/auth/daftar-perusahaan'];
    }

    private function payload(string $route): array
    {
        $common = [
            'email' => 'coordinate-test@example.com',
            'kata_sandi' => 'password123',
        ];
        if ($route === '/api/v1/auth/register/perusahaan') {
            return $common + [
                'nama_kafe' => 'Kafe Uji',
                'nama_pengelola' => 'Pengelola Uji',
                'konfirmasi_kata_sandi' => 'password123',
                'alamat' => 'Jalan Uji, Indramayu',
                'dokumen_legalitas' => UploadedFile::fake()->create('legalitas.pdf', 10, 'application/pdf'),
            ];
        }

        return $common + [
            'nama_pengguna' => 'Pengelola Uji',
            'nama_perusahaan' => 'Kafe Uji',
            'alamat_perusahaan' => 'Jalan Uji, Indramayu',
            'dokumen_izin' => UploadedFile::fake()->create('legalitas.pdf', 10, 'application/pdf'),
        ];
    }
}
