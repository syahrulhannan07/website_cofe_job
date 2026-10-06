<?php

return [
    'google_places_api_key' => env('GOOGLE_PLACES_API_KEY'),
    'cache_places_minutes' => env('GOOGLE_CACHE_MINUTES', 1440),

    // Gemini API (Google AI Studio)
    'gemini_api_key' => env('GEMINI_API_KEY'),
    'gemini_model' => env('GEMINI_MODEL', 'gemini-3.5-flash-lite'),
    'gemini_base_url' => 'https://generativelanguage.googleapis.com/v1/models',
];
