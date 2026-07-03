<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../includes/user-sync.php';

api_cors_headers();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $accountId = (string) ($_GET['account'] ?? '');
    try {
        api_json_response(['ok' => true, 'sync' => sync_fetch_account($accountId)]);
    } catch (InvalidArgumentException $e) {
        api_json_response(['ok' => false, 'error' => $e->getMessage()], 400);
    }
}

if ($method === 'POST') {
    $body = api_read_json_body();
    $accountId = (string) ($body['account_id'] ?? '');
    try {
        $merged = sync_apply_client($accountId, $body);
        api_json_response(['ok' => true, 'sync' => $merged]);
    } catch (InvalidArgumentException $e) {
        api_json_response(['ok' => false, 'error' => $e->getMessage()], 400);
    }
}

api_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
