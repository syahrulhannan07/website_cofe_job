<?php

namespace App\Http\Controllers\Api\V1\Pelamar;

use App\Http\Controllers\Controller;
use App\Services\V1\Pelamar\AIChatService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ChatBotController extends Controller
{
    use ApiResponse;

    protected AIChatService $chatService;

    public function __construct(AIChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    public function ask(Request $request)
    {
        $validated = $request->validate([
            'messages' => 'required|array|min:1',
            'messages.*.role' => 'required|in:user,assistant,system',
            'messages.*.content' => 'required|string',
        ]);

        $response = $this->chatService->chat(
            $validated['messages'],
            auth('api')->id()
        );

        return $this->successResponse($response, 'Pesan berhasil diproses');
    }
}
