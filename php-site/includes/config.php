<?php
declare(strict_types=1);

function app_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $defaults = [
        'admin_password_hash' => '$2y$10$UGC01is7GWPqG6FMfdIHxedsyQJ5h4S1vrq7kYaOaMHE8NFnXE202', // default: maintain2026
        'track_token' => '',
        'allowed_origins' => [
            'http://127.0.0.1:8888',
            'http://localhost:8888',
            'https://kelvinmak811.github.io',
        ],
        'db_path' => dirname(__DIR__) . '/storage/smartcook.db',
        'session_name' => 'smartcook_maintain',
    ];

    $localPath = dirname(__DIR__) . '/config.local.php';
    if (is_readable($localPath)) {
        $local = require $localPath;
        if (is_array($local)) {
            $defaults = array_merge($defaults, $local);
        }
    }

    $config = $defaults;
    return $config;
}
