<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function admin_session_start(): void
{
    $config = app_config();
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_name((string) $config['session_name']);
        session_start([
            'cookie_httponly' => true,
            'cookie_samesite' => 'Strict',
        ]);
    }
}

function admin_is_logged_in(): bool
{
    admin_session_start();
    return !empty($_SESSION['admin_logged_in']);
}

function admin_login(string $password): bool
{
    $config = app_config();
    $hash = (string) $config['admin_password_hash'];
    if (!password_verify($password, $hash)) {
        return false;
    }
    admin_session_start();
    session_regenerate_id(true);
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_login_at'] = time();
    return true;
}

function admin_logout(): void
{
    admin_session_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}

function admin_require_auth(): void
{
    if (!admin_is_logged_in()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'Unauthorized'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
