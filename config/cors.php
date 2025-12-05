<?php

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'profile/*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://space.knowhub.uz',
        'https://api.space.knowhub.uz',
        'https://www.space.knowhub.uz',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'supports_credentials' => true,
];
