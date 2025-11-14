<?php
$baseHost = env('APP_URL_BASE', parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST) ?: 'localhost');

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_filter([
        'http://localhost',
        'http://localhost:3000',
        'https://localhost',
        'https://localhost:3000',
        $baseHost ? 'https://' . $baseHost : null,
    ]))),

    'allowed_origins_patterns' => [
        '#^https?://([a-z0-9-]+\.)?' . preg_quote($baseHost, '#') . '$#i',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

