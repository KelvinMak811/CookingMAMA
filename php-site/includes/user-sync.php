<?php
declare(strict_types=1);

require_once __DIR__ . '/database.php';

const SYNC_VALID_ACCOUNTS = ['kelvin', 'yuetsum'];
const SYNC_USER_KEYS = ['shopping', 'cooking_log', 'meal_plan'];
const SYNC_SHARED_CUSTOM = 'custom_recipes';

function sync_validate_account(string $accountId): void
{
    if (!in_array($accountId, SYNC_VALID_ACCOUNTS, true)) {
        throw new InvalidArgumentException('Invalid account');
    }
}

function sync_row_get(string $scope, string $dataKey): ?array
{
    $stmt = db()->prepare('SELECT payload, updated_at FROM user_sync_data WHERE scope = :scope AND data_key = :data_key');
    $stmt->execute([':scope' => $scope, ':data_key' => $dataKey]);
    $row = $stmt->fetch();
    if (!$row) {
        return null;
    }
    $payload = json_decode((string) $row['payload'], true);
    return [
        'payload' => is_array($payload) ? $payload : null,
        'updated_at' => (string) $row['updated_at'],
    ];
}

function sync_row_save(string $scope, string $dataKey, array $payload, string $updatedAt): void
{
    $stmt = db()->prepare('INSERT INTO user_sync_data (scope, data_key, payload, updated_at)
        VALUES (:scope, :data_key, :payload, :updated_at)
        ON CONFLICT(scope, data_key) DO UPDATE SET
            payload = excluded.payload,
            updated_at = excluded.updated_at');
    $stmt->execute([
        ':scope' => $scope,
        ':data_key' => $dataKey,
        ':payload' => json_encode($payload, JSON_UNESCAPED_UNICODE),
        ':updated_at' => $updatedAt,
    ]);
}

function sync_merge_row(string $scope, string $dataKey, ?array $clientPayload, ?string $clientUpdatedAt): ?array
{
    $server = sync_row_get($scope, $dataKey);
    $serverTime = $server ? strtotime($server['updated_at']) : 0;
    $clientTime = $clientUpdatedAt ? strtotime($clientUpdatedAt) : 0;

    if ($clientPayload !== null && $clientUpdatedAt !== null && $clientTime >= $serverTime) {
        sync_row_save($scope, $dataKey, $clientPayload, $clientUpdatedAt);
        return ['payload' => $clientPayload, 'updated_at' => $clientUpdatedAt, 'source' => 'client'];
    }

    if ($server !== null) {
        return ['payload' => $server['payload'], 'updated_at' => $server['updated_at'], 'source' => 'server'];
    }

    return null;
}

function sync_fetch_account(string $accountId): array
{
    sync_validate_account($accountId);
    $out = ['account_id' => $accountId, 'data' => [], 'custom_recipes' => null];

    foreach (SYNC_USER_KEYS as $key) {
        $row = sync_row_get($accountId, $key);
        if ($row !== null) {
            $out['data'][$key] = [
                'payload' => $row['payload'],
                'updated_at' => $row['updated_at'],
            ];
        }
    }

    $shared = sync_row_get('shared', SYNC_SHARED_CUSTOM);
    if ($shared !== null) {
        $out['custom_recipes'] = [
            'payload' => $shared['payload'],
            'updated_at' => $shared['updated_at'],
        ];
    }

    return $out;
}

function sync_apply_client(string $accountId, array $body): array
{
    sync_validate_account($accountId);
    $merged = ['account_id' => $accountId, 'data' => [], 'custom_recipes' => null];

    $clientData = $body['data'] ?? [];
    if (is_array($clientData)) {
        foreach (SYNC_USER_KEYS as $key) {
            if (!isset($clientData[$key]) || !is_array($clientData[$key])) {
                continue;
            }
            $entry = $clientData[$key];
            $payload = $entry['payload'] ?? null;
            $updatedAt = isset($entry['updated_at']) ? (string) $entry['updated_at'] : null;
            if (!is_array($payload) || $updatedAt === null) {
                continue;
            }
            $merged['data'][$key] = sync_merge_row($accountId, $key, $payload, $updatedAt);
        }
    }

    if (isset($body['custom_recipes']) && is_array($body['custom_recipes'])) {
        $entry = $body['custom_recipes'];
        $payload = $entry['payload'] ?? null;
        $updatedAt = isset($entry['updated_at']) ? (string) $entry['updated_at'] : null;
        if (is_array($payload) && $updatedAt !== null) {
            $merged['custom_recipes'] = sync_merge_row('shared', SYNC_SHARED_CUSTOM, $payload, $updatedAt);
        }
    }

    return $merged;
}
