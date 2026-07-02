<?php
declare(strict_types=1);

const CUISINE_LABELS = [
    'chinese' => '中餐',
    'western' => '西餐',
    'japanese' => '日式',
    'italian' => '意式',
];

const CUISINE_HINTS = [
    'all' => '全部用易潔鑊／平底鑊就得，唔使焗爐同氣炸鍋。乾身餸、炒粉麵飯為主，唔包湯飯。',
    'chinese' => '港式家常、茶餐廳小炒，鑊氣十足又易整，唔包湯飯。',
    'western' => '西式一鑊過，早餐午餐晚餐都啱。',
    'japanese' => '日式丼飯、咖喱同炒麵，簡單好味。',
    'italian' => '意粉同燉菜，易潔鑊就煮到意式風味。',
];

function is_static_export(): bool
{
    return getenv('SMARTCOOK_STATIC') === '1';
}

function base_path(): string
{
    return rtrim(getenv('SMARTCOOK_BASE_PATH') ?: '', '/');
}

function asset_url(string $path): string
{
    $base = base_path();
    $normalized = ltrim($path, '/');
    return $base !== '' ? "{$base}/{$normalized}" : $normalized;
}

function page_url(string $path): string
{
    $base = base_path();
    if (is_static_export()) {
        $map = [
            'recipes.php' => 'recipes/',
            'shopping-list.php' => 'shopping-list/',
            'history.php' => 'history/',
            'expenses.php' => 'expenses/',
        ];
        $path = $map[$path] ?? $path;
    }
    $normalized = ltrim($path, '/');
    return $base !== '' ? "{$base}/{$normalized}" : $normalized;
}

function cuisine_url(string $cuisine): string
{
    if (is_static_export()) {
        return asset_url("recipes/cuisine/{$cuisine}/");
    }
    return page_url('recipes-cuisine.php?cuisine=' . rawurlencode($cuisine));
}

function recipe_url(string $recipeId): string
{
    if (is_static_export()) {
        return asset_url('recipes/' . rawurlencode($recipeId) . '/');
    }
    return page_url('recipe.php?id=' . rawurlencode($recipeId));
}

function cuisine_nav_items(): array
{
    return [
        ['value' => 'all', 'label' => '全部', 'icon' => '🍽️', 'href' => page_url('recipes.php')],
        ['value' => 'chinese', 'label' => '中餐', 'icon' => '🥢', 'href' => cuisine_url('chinese')],
        ['value' => 'western', 'label' => '西餐', 'icon' => '🍝', 'href' => cuisine_url('western')],
        ['value' => 'japanese', 'label' => '日式', 'icon' => '🍱', 'href' => cuisine_url('japanese')],
        ['value' => 'italian', 'label' => '意式', 'icon' => '🍕', 'href' => cuisine_url('italian')],
    ];
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function current_page(): string
{
    return basename($_SERVER['PHP_SELF'] ?? '');
}

function load_recipes(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $path = __DIR__ . '/../data/recipes.json';
    if (!is_readable($path)) {
        return [];
    }
    $decoded = json_decode((string) file_get_contents($path), true);
    $cache = is_array($decoded) ? $decoded : [];
    return $cache;
}

function get_recipe_by_id(string $id): ?array
{
    foreach (load_recipes() as $recipe) {
        if (($recipe['id'] ?? '') === $id) {
            return $recipe;
        }
    }
    return null;
}

function filter_recipes(?string $cuisine): array
{
    $recipes = load_recipes();
    if ($cuisine === null || $cuisine === '' || $cuisine === 'all') {
        return $recipes;
    }
    return array_values(array_filter(
        $recipes,
        static fn(array $r): bool => ($r['cuisine'] ?? '') === $cuisine
    ));
}

function cuisine_count(string $cuisine): int
{
    if ($cuisine === 'all') {
        return count(load_recipes());
    }
    return count(filter_recipes($cuisine));
}

function render_difficulty(int $difficulty): string
{
    $filled = max(1, min(5, $difficulty));
    return str_repeat('★', $filled) . str_repeat('☆', 5 - $filled);
}

function is_valid_cuisine(?string $cuisine): bool
{
    return $cuisine !== null && array_key_exists($cuisine, CUISINE_LABELS);
}

function active_cuisine_for_page(?string $pageCuisine, ?array $recipe = null): string
{
    if ($recipe !== null) {
        return (string) ($recipe['cuisine'] ?? 'all');
    }
    if ($pageCuisine !== null && $pageCuisine !== '' && $pageCuisine !== 'all') {
        return $pageCuisine;
    }
    return 'all';
}

function nav_is_active(string $href): bool
{
    $current = current_page();
    $path = parse_url($href, PHP_URL_PATH) ?: '';
    $base = basename($path);
    if ($base === $current) {
        return true;
    }
    if ($current === 'recipes-cuisine.php' && $base === 'recipes.php') {
        return false;
    }
    return false;
}

function bottom_nav_is_active(string $page): bool
{
    return current_page() === $page;
}
