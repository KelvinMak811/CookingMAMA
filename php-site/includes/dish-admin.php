<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function dish_admin_rebuild_index(): void
{
    $dir = dish_dir();
    $files = glob($dir . DIRECTORY_SEPARATOR . '*.json') ?: [];
    $dishes = [];
    foreach ($files as $file) {
        if (basename($file) === 'index.json') {
            continue;
        }
        $recipe = json_decode((string) file_get_contents($file), true);
        if (!is_array($recipe) || empty($recipe['id'])) {
            continue;
        }
        $dishes[] = [
            'id' => (string) $recipe['id'],
            'name' => (string) ($recipe['name'] ?? ''),
            'cuisine' => (string) ($recipe['cuisine'] ?? 'chinese'),
            'source' => (string) ($recipe['source'] ?? 'system'),
        ];
    }

    usort($dishes, static fn(array $a, array $b): int => strcmp($a['id'], $b['id']));

    $index = [
        'version' => 1,
        'description' => 'SmartCook built-in dish database — one JSON file per recipe',
        'dishes' => $dishes,
    ];

    file_put_contents(
        $dir . DIRECTORY_SEPARATOR . 'index.json',
        json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n"
    );
}

function dish_admin_save(array $recipe): array
{
    $id = trim((string) ($recipe['id'] ?? ''));
    if ($id === '' || !preg_match('/^[a-z0-9_-]+$/i', $id)) {
        throw new InvalidArgumentException('Invalid dish id');
    }

    $name = trim((string) ($recipe['name'] ?? ''));
    if ($name === '') {
        throw new InvalidArgumentException('Dish name is required');
    }

    $ingredients = $recipe['ingredients'] ?? [];
    if (!is_array($ingredients) || count($ingredients) === 0) {
        throw new InvalidArgumentException('At least one ingredient is required');
    }

    $normalized = [
        'id' => $id,
        'name' => $name,
        'cuisine' => (string) ($recipe['cuisine'] ?? 'chinese'),
        'baseServings' => max(1, (int) ($recipe['baseServings'] ?? 2)),
        'description' => (string) ($recipe['description'] ?? ''),
        'difficulty' => max(1, min(5, (int) ($recipe['difficulty'] ?? 1))),
        'prepTime' => max(0, (int) ($recipe['prepTime'] ?? 0)),
        'imageUrl' => (string) ($recipe['imageUrl'] ?? ''),
        'ingredients' => array_values($ingredients),
        'steps' => array_values(is_array($recipe['steps'] ?? null) ? $recipe['steps'] : []),
        'source' => 'system',
        'managedBy' => 'admin',
        'createdBy' => 'system',
        'createdByName' => 'System',
        'updatedAt' => gmdate('c'),
    ];

    if (empty($recipe['createdAt'])) {
        $existing = get_recipe_by_id($id);
        $normalized['createdAt'] = $existing['createdAt'] ?? gmdate('c');
    } else {
        $normalized['createdAt'] = (string) $recipe['createdAt'];
    }

    $path = dish_dir() . DIRECTORY_SEPARATOR . $id . '.json';
    file_put_contents($path, json_encode($normalized, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n");
    dish_admin_rebuild_index();

    return $normalized;
}

function dish_admin_delete(string $id): bool
{
    if ($id === '' || !preg_match('/^[a-z0-9_-]+$/i', $id)) {
        return false;
    }
    $path = dish_dir() . DIRECTORY_SEPARATOR . $id . '.json';
    if (!is_file($path)) {
        return false;
    }
    unlink($path);
    dish_admin_rebuild_index();
    return true;
}

function dish_admin_list(): array
{
    return load_recipes();
}
