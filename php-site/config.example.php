<?php
/**
 * Copy to config.local.php and change the admin password.
 * Default password: maintain2026
 */
return [
    'admin_password_hash' => '$2y$10$UGC01is7GWPqG6FMfdIHxedsyQJ5h4S1vrq7kYaOaMHE8NFnXE202',
    'track_token' => '', // Optional: require X-Track-Token header on /api/track.php
    'allowed_origins' => [
        'http://127.0.0.1:8888',
        'http://localhost:8888',
        'https://kelvinmak811.github.io',
    ],
    'db_path' => __DIR__ . '/storage/smartcook.db',
];
