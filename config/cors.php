<?php

$sessionDomain = env('SESSION_DOMAIN', '.knowhub.uz');
$primaryDomain = ltrim($sessionDomain, '.');
$frontendUrl = rtrim(env('FRONTEND_URL', 'https://'.$primaryDomain), '/');
$appUrl = rtrim(env('APP_URL', 'https://api.'.$primaryDomain), '/');

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
        'email/verification/*',
        'forgot-password',
        'reset-password',
        'profile/*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_unique(array_merge(
        [
            'https://'.$primaryDomain,
            'https://www.'.$primaryDomain,
            'https://api.'.$primaryDomain,
            'http://localhost',
            'http://localhost:3000',
            'http://127.0.0.1',
            'http://127.0.0.1:3000',
        ],
        [
            $frontendUrl,
            $appUrl,
        ],
        array_map(
            'trim',
            array_filter(preg_split('/[,\s]+/', env('CORS_ALLOWED_ORIGINS', '')))
        )
    )))),

    'allowed_origin_patterns' => array_values(array_filter([
        'https://*.'.$primaryDomain,
        'http://*.'.$primaryDomain,
        env('CORS_ALLOWED_ORIGIN_PATTERN'),
    ])),

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-CSRF-TOKEN'],

    'supports_credentials' => true,
];
