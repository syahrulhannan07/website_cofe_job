<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Kirim response sukses.
     */
    protected function successResponse($data = null, string $message = null, int $code = 200, $meta = null): JsonResponse
    {
        $response = [
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ];

        if ($meta) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    /**
     * Kirim response error.
     */
    protected function errorResponse(string $message, int $code, $errors = null): JsonResponse
    {
        $response = [
            'status'  => 'error',
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
