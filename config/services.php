<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'geocoding' => [
        'url' => env('PHOTON_URL', 'https://photon.komoot.io/api/'),
        // Photon bbox order: minLon,minLat,maxLon,maxLat (approximate search area only).
        'bbox' => [107.85, -6.85, 108.65, -6.2],
        'latitude' => -6.3274,
        'longitude' => 108.3249,
        'cache_seconds' => 3600,
        'empty_cache_seconds' => 60,
        'remote_per_minute' => 30,
    ],

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

'fonnte' => [
    'token' => env('WHATSAPP_API_TOKEN'),
    'url' => env('WHATSAPP_API_URL'),
],

    'faceplusplus' => [
        'api_key' => env('FACEPLUSPLUS_API_KEY'),
        'api_secret' => env('FACEPLUSPLUS_API_SECRET'),
        'api_url' => env('FACEPLUSPLUS_API_URL', 'https://api-us.faceplusplus.com'),
        'threshold' => env('FACEPLUSPLUS_THRESHOLD', 85.0),
    ],

];
