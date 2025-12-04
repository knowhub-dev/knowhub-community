<?php

return [
    'templates' => [
        'node' => 'node:18-alpine',
        'python' => 'python:3.12-alpine',
        'html' => 'nginx:alpine',
        'static' => 'nginx:alpine-slim',
        'php' => 'php:8.2-apache',
    ],

    'allowed_images' => [
        'node:18-alpine',
        'python:3.12-alpine',
        'nginx:alpine',
        'nginx:alpine-slim',
        'php:8.2-apache',
    ],

    'min_xp_required' => env('CONTAINER_MIN_XP', 500),
    'max_containers_per_user' => env('CONTAINER_MAX_PER_USER', 3),

    'git_clone_enabled' => env('CONTAINER_GIT_CLONE_ENABLED', true),
    'mysql_instances_per_user' => env('CONTAINER_MYSQL_INSTANCES', 2),

    'port_range' => [
        'start' => env('CONTAINER_PORT_START', 30000),
        'end' => env('CONTAINER_PORT_END', 31000),
        'host_ip' => env('CONTAINER_PORT_HOST_IP', '127.0.0.1'),
    ],

    'max_env_vars' => env('CONTAINER_MAX_ENV_VARS', 10),
    'env_key_regex' => '/^[A-Z][A-Z0-9_]*$/',
    'env_value_max_length' => env('CONTAINER_ENV_VALUE_MAX', 256),

    'reserved_subdomains' => array_filter(array_map('trim', explode(',', env('CONTAINER_RESERVED_SUBDOMAINS', 'www,admin,api,app')))),
    'domain_suffix' => env('CONTAINER_DOMAIN_SUFFIX', env('APP_URL_BASE', parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST) ?: 'localhost')),
    'subdomain_min_length' => env('CONTAINER_SUBDOMAIN_MIN_LENGTH', 3),
    'subdomain_max_length' => env('CONTAINER_SUBDOMAIN_MAX_LENGTH', 30),

    'security' => [
        'readonly_root_filesystem' => env('CONTAINER_READONLY_ROOT', true),
        'pids_limit' => env('CONTAINER_PIDS_LIMIT', 64),
        'drop_capabilities' => ['ALL'],
        'no_new_privileges' => true,
    ],
];
