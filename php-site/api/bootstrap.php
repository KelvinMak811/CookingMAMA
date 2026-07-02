<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/config.php';

function api_json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function api_cors_headers(): void
{
    $config = app_config();
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = $config['allowed_origins'] ?? [];
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Track-Token');
    }
}

function api_read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function api_verify_track_token(): void
{
    $config = app_config();
    $token = (string) ($config['track_token'] ?? '');
    if ($token === '') {
        return;
    }
    $header = $_SERVER['HTTP_X_TRACK_TOKEN'] ?? '';
    if (!hash_equals($token, $header)) {
        api_json_response(['ok' => false, 'error' => 'Invalid track token'], 403);
    }
}
