<?php
use App\Models\Pengguna;
use App\Models\ProfilPerusahaan;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use Illuminate\Support\Facades\DB;

// Cleanup
Pengguna::where('email', 'tinker_direct@kafe.com')->delete();

$controller = new RegisterController();
$file = UploadedFile::fake()->create('nib.pdf', 100);

// Create request with uploaded file
$request = Request::create('/api/v1/auth/register/perusahaan', 'POST', [
    'nama_kafe' => 'Kafe Tinker Direct',
    'nama_pengelola' => 'Admin Tinker',
    'email' => 'tinker_direct@kafe.com',
    'kata_sandi' => 'password123',
    'konfirmasi_kata_sandi' => 'password123',
    'alamat' => 'Alamat Tinker',
    'deskripsi' => 'Test',
], [], ['dokumen_legalitas' => $file]);

$response = $controller->registrasiPerusahaan($request);
echo "Direct Status: " . $response->getStatusCode() . "\n";
echo "Response body: " . $response->getContent() . "\n";

if ($response->getStatusCode() === 201) {
    echo "SUCCESS: Registration logic works.\n";
} else {
    echo "FAILURE: Registration logic failed.\n";
}
