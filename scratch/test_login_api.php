<?php

// Test script for login API
$url = 'http://localhost:8000/api/v1/auth/login'; // Adjust port if needed
$data = [
    'email' => 'superadmin@cofejob.id',
    'kata_sandi' => 'password'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\nAccept: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Response from API:\n";
echo $result . "\n";

$response = json_decode($result, true);
if (isset($response['status']) && $response['status'] === 'success') {
    echo "Login successful!\n";
    echo "Token: " . $response['data']['token'] . "\n";
} else {
    echo "Login failed.\n";
}
