<?php

return [
    'groq_api_key' => env('GROQ_API_KEY'),
    'groq_model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    'google_places_api_key' => env('GOOGLE_PLACES_API_KEY'),
    'cache_places_minutes' => env('GOOGLE_CACHE_MINUTES', 1440),
];
