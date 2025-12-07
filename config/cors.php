<?php

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
            'https://space.knowhub.uz',
            'https://www.space.knowhub.uz',
            'https://api.space.knowhub.uz',
            'http://localhost',
            'http://localhost:3000',
            'http://127.0.0.1',
            'http://127.0.0.1:3000',
        ],
        [
            rtrim(env('FRONTEND_URL', ''), '/'),
            rtrim(env('APP_URL', ''), '/'),
        ],
        array_map(
            'trim',
            array_filter(preg_split('/[,\s]+/', env('CORS_ALLOWED_ORIGINS', '')))
        )
    )))),

    'allowed_origin_patterns' => [
        'https://*.space.knowhub.uz',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-CSRF-TOKEN'],

    'supports_credentials' => true,
];
