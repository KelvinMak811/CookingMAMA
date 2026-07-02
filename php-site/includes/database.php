<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = app_config();
    $dbPath = (string) $config['db_path'];
    $dir = dirname($dbPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0750, true);
    }

    $pdo = new PDO('sqlite:' . $dbPath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    db_migrate($pdo);
    return $pdo;
}

function db_migrate(PDO $pdo): void
{
    $pdo->exec('CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        account_id TEXT,
        session_id TEXT,
        event_type TEXT NOT NULL,
        page_path TEXT,
        dish_id TEXT,
        dish_name TEXT,
        metadata TEXT,
        duration_ms INTEGER,
        ip_hash TEXT,
        user_agent TEXT
    )');

    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_logs_account ON activity_logs(account_id)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_logs_event ON activity_logs(event_type)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_logs_session ON activity_logs(session_id)');
}
