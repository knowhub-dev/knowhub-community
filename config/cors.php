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

    'allowed_origins' => array_values(
        array_unique(
            array_merge(
                [
                    'https://space.knowhub.uz',
                    'https://api.space.knowhub.uz',
                    'https://www.space.knowhub.uz',
                    'http://localhost',
                    'http://localhost:3000',
                    'http://127.0.0.1',
                    'http://127.0.0.1:3000',
                    'https://localhost',
                    'https://localhost:3000',
                    'https://127.0.0.1',
                    'https://127.0.0.1:3000',
                ],
                array_filter(
                    array_map(
                        'trim',
                        preg_split('/[,\s]+/', env('CORS_ALLOWED_ORIGINS', ''))
                    )
                )
            )
        )
    ),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'supports_credentials' => true,
];
