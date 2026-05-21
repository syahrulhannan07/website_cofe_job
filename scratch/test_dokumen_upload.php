<?php
// bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = Pengguna::where('email', 'cafe9@gmail.com')->first();
if (!$user) {
    echo "User cafe9@gmail.com not found.\n";
    exit(1);
}

// Log in as user
Auth::guard('api')->setUser($user);
auth('api')->setUser($user);

echo "Logged in as: " . auth('api')->user()->email . "\n";

// Mock Request
$file = UploadedFile::fake()->create('dummy_izin_9.pdf', 500, 'application/pdf'); // 500KB

$request = Request::create('/api/v1/admin/profil-perusahaan', 'POST', [
    'nama_perusahaan' => 'Kopi Mangga Baru',
], [], [
    'dokumen_izin' => $file
]);

// Call controller update method
$controller = new \App\Http\Controllers\Api\V1\Admin\ProfilPerusahaanController();
$response = $controller->update($request);

echo "Status Code: " . $response->status() . "\n";
echo "Content: " . $response->content() . "\n";
