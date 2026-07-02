<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/analytics.php';
require_once __DIR__ . '/../includes/dish-admin.php';

api_cors_headers();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'login' && $method === 'POST') {
    $body = api_read_json_body();
    $password = (string) ($body['password'] ?? '');
    if (!admin_login($password)) {
        api_json_response(['ok' => false, 'error' => 'Invalid password'], 401);
    }
    api_json_response(['ok' => true]);
}

if ($action === 'logout' && $method === 'POST') {
    admin_logout();
    api_json_response(['ok' => true]);
}

if ($action === 'session' && $method === 'GET') {
    api_json_response(['ok' => true, 'logged_in' => admin_is_logged_in()]);
}

admin_require_auth();

if ($action === 'summary' && $method === 'GET') {
    api_json_response(['ok' => true, 'summary' => analytics_summary()]);
}

if ($action === 'logs' && $method === 'GET') {
    $limit = (int) ($_GET['limit'] ?? 200);
    $account = isset($_GET['account']) ? (string) $_GET['account'] : null;
    $eventType = isset($_GET['event_type']) ? (string) $_GET['event_type'] : null;
    api_json_response([
        'ok' => true,
        'logs' => analytics_recent_logs($limit, $account, $eventType),
    ]);
}

if ($action === 'dishes' && $method === 'GET') {
    api_json_response(['ok' => true, 'dishes' => dish_admin_list()]);
}

if ($action === 'dishes' && $method === 'POST') {
    $body = api_read_json_body();
    try {
        $saved = dish_admin_save($body);
        analytics_log_event([
            'event_type' => 'admin_dish_save',
            'account_id' => 'admin',
            'dish_id' => $saved['id'],
            'dish_name' => $saved['name'],
            'metadata' => ['source' => 'system'],
        ]);
        api_json_response(['ok' => true, 'dish' => $saved]);
    } catch (InvalidArgumentException $e) {
        api_json_response(['ok' => false, 'error' => $e->getMessage()], 400);
    }
}

if ($action === 'dishes' && $method === 'DELETE') {
    $id = (string) ($_GET['id'] ?? '');
    if (!dish_admin_delete($id)) {
        api_json_response(['ok' => false, 'error' => 'Dish not found'], 404);
    }
    analytics_log_event([
        'event_type' => 'admin_dish_delete',
        'account_id' => 'admin',
        'dish_id' => $id,
    ]);
    api_json_response(['ok' => true]);
}

api_json_response(['ok' => false, 'error' => 'Unknown action'], 404);
