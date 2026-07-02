<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../includes/analytics.php';

api_cors_headers();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    api_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

api_verify_track_token();
$body = api_read_json_body();
$events = $body['events'] ?? [$body];
if (!is_array($events)) {
    api_json_response(['ok' => false, 'error' => 'Invalid payload'], 400);
}

$count = analytics_log_events($events);
api_json_response(['ok' => true, 'logged' => $count]);
