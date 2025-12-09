<?php

return [
    'plans' => [
        'free' => [
            'max_containers' => 1,
            'max_memory_mb' => 128,
            'max_upload_kb' => 2048,
            'priority' => false,
            'timeout_ms' => 5000,
        ],
        'pro' => [
            'max_containers' => 5,
            'max_memory_mb' => 512,
            'max_upload_kb' => 10240,
            'priority' => true,
            'timeout_ms' => 15000,
        ],
        'legend' => [
            'max_containers' => 10,
            'max_memory_mb' => 1024,
            'max_upload_kb' => 20480,
            'priority' => true,
            'timeout_ms' => 30000,
        ],
    ],
];
