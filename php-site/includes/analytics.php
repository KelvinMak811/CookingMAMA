<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';

function analytics_ip_hash(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $day = date('Y-m-d');
    return hash('sha256', $ip . '|' . $day . '|smartcook');
}

function analytics_user_agent(): string
{
    $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    return mb_substr($ua, 0, 255);
}

function analytics_log_event(array $event): void
{
    $stmt = db()->prepare('INSERT INTO activity_logs (
        created_at, account_id, session_id, event_type, page_path,
        dish_id, dish_name, metadata, duration_ms, ip_hash, user_agent
    ) VALUES (
        :created_at, :account_id, :session_id, :event_type, :page_path,
        :dish_id, :dish_name, :metadata, :duration_ms, :ip_hash, :user_agent
    )');

    $metadata = $event['metadata'] ?? null;
    if (is_array($metadata)) {
        $metadata = json_encode($metadata, JSON_UNESCAPED_UNICODE);
    }

    $stmt->execute([
        ':created_at' => $event['created_at'] ?? gmdate('c'),
        ':account_id' => $event['account_id'] ?? null,
        ':session_id' => $event['session_id'] ?? null,
        ':event_type' => (string) ($event['event_type'] ?? 'unknown'),
        ':page_path' => $event['page_path'] ?? null,
        ':dish_id' => $event['dish_id'] ?? null,
        ':dish_name' => $event['dish_name'] ?? null,
        ':metadata' => $metadata,
        ':duration_ms' => isset($event['duration_ms']) ? (int) $event['duration_ms'] : null,
        ':ip_hash' => analytics_ip_hash(),
        ':user_agent' => analytics_user_agent(),
    ]);
}

function analytics_log_events(array $events): int
{
    $count = 0;
    foreach ($events as $event) {
        if (!is_array($event)) {
            continue;
        }
        analytics_log_event($event);
        $count++;
    }
    return $count;
}

function analytics_login_stats(): array
{
    $stmt = db()->query("SELECT account_id, COUNT(*) AS login_count
        FROM activity_logs
        WHERE event_type = 'account_login' AND account_id IS NOT NULL
        GROUP BY account_id
        ORDER BY login_count DESC");
    return $stmt->fetchAll();
}

function analytics_recent_logs(int $limit = 200, ?string $accountId = null, ?string $eventType = null): array
{
    $sql = 'SELECT * FROM activity_logs WHERE 1=1';
    $params = [];
    if ($accountId !== null && $accountId !== '') {
        $sql .= ' AND account_id = :account_id';
        $params[':account_id'] = $accountId;
    }
    if ($eventType !== null && $eventType !== '') {
        $sql .= ' AND event_type = :event_type';
        $params[':event_type'] = $eventType;
    }
    $sql .= ' ORDER BY id DESC LIMIT ' . max(1, min(1000, $limit));

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        if (!empty($row['metadata'])) {
            $decoded = json_decode((string) $row['metadata'], true);
            $row['metadata'] = is_array($decoded) ? $decoded : $row['metadata'];
        }
    }
    return $rows;
}

function analytics_summary(): array
{
    $pdo = db();
    $total = (int) $pdo->query('SELECT COUNT(*) FROM activity_logs')->fetchColumn();
    $today = (int) $pdo->query("SELECT COUNT(*) FROM activity_logs WHERE date(created_at) = date('now')")->fetchColumn();
    $sessions = (int) $pdo->query("SELECT COUNT(DISTINCT session_id) FROM activity_logs WHERE session_id IS NOT NULL")->fetchColumn();
    $dishViews = (int) $pdo->query("SELECT COUNT(*) FROM activity_logs WHERE event_type = 'dish_view'")->fetchColumn();
    $customAdds = (int) $pdo->query("SELECT COUNT(*) FROM activity_logs WHERE event_type = 'dish_add_custom'")->fetchColumn();

    return [
        'total_events' => $total,
        'events_today' => $today,
        'sessions' => $sessions,
        'dish_views' => $dishViews,
        'custom_dishes_added' => $customAdds,
        'logins' => analytics_login_stats(),
    ];
}
