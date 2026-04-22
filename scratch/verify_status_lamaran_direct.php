<?php

use App\Models\Lamaran;
use App\Models\Wawancara;
use App\Models\ProfilPelamar;
use App\Http\Controllers\Api\V1\Pelamar\StatusLamaranController;
use Illuminate\Http\Request;

function test($name, $callback) {
    echo "TEST: $name... ";
    try {
        $result = $callback();
        echo "SUCCESS\n";
        return $result;
    } catch (\Throwable $e) {
        echo "FAILED: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
        return null;
    }
}

// 1. Authenticate User 2 (Budi)
$user = App\Models\Pengguna::find(2);
auth('api')->login($user);

// 2. Persiapan Data
$profil = ProfilPelamar::where('id_pengguna', 2)->first();
$id_profil = $profil->id_profil;

$lamaran = Lamaran::where('id_profil', $id_profil)->latest()->first();
if (!$lamaran) {
    $lamaran = Lamaran::create(['id_lowongan' => 1, 'id_profil' => $id_profil, 'status' => 'Diproses']);
}
$lamaran->update(['status' => 'Wawancara']);

Wawancara::updateOrCreate(
    ['id_lamaran' => $lamaran->id_lamaran],
    ['tanggal_wawancara' => now()->addDays(2), 'lokasi' => 'Thamrin', 'catatan' => 'Tes', 'status' => 'Terjadwal']
);

$controller = new StatusLamaranController();

// 3. Test Index
test("Direct Index", function() use ($controller) {
    $request = new Request();
    $response = $controller->index($request);
    if ($response->getStatusCode() !== 200) throw new \Exception("Status " . $response->getStatusCode());
    echo "(Count: " . count(json_decode($response->getContent(), true)['data']) . ") ";
});

// 4. Test Show (Timeline)
test("Direct Show", function() use ($controller, $lamaran) {
    $response = $controller->show($lamaran->id_lamaran);
    if ($response->getStatusCode() !== 200) throw new \Exception("Status " . $response->getStatusCode() . " - " . $response->getContent());
    $data = json_decode($response->getContent(), true)['data'];
    echo "(Timeline items: " . count($data['timeline']) . ") ";
});

// 5. Test Wawancara Detail
test("Direct Wawancara Detail", function() use ($controller, $lamaran) {
    $response = $controller->detailWawancara($lamaran->id_lamaran);
    if ($response->getStatusCode() !== 200) throw new \Exception("Status " . $response->getStatusCode());
});

echo "\n--- VERIFIKASI LANGSUNG SELESAI ---\n";
