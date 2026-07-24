<?php
require_once __DIR__ . '/includes/bootstrap.php';

$cuisine = $_GET['cuisine'] ?? '';
if (!is_valid_cuisine($cuisine)) {
    header('Location: recipes.php');
    exit;
}

$recipes = filter_recipes($cuisine);
$activeCuisine = $cuisine;
$title = CUISINE_LABELS[$cuisine] . '菜式';
$hint = CUISINE_HINTS[$cuisine];

$pageTitle = $title . ' — SmartCook';
$pageScripts = [
  asset_url('assets/js/recipe-filters.js?v=20260724'),
  asset_url('assets/js/recipes-catalog.js?v=20260724'),
];
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100" data-cuisine="<?php echo h($cuisine); ?>">
<?php
$headerTitle = '菜式庫';
include __DIR__ . '/header.html';
?>
<div class="container app-main px-3">
  <?php include __DIR__ . '/includes/cuisine-nav.php'; ?>
  <div class="recipe-browse-tools">
    <?php include __DIR__ . '/includes/recipe-filters.php'; ?>
  </div>
</div>
<main class="container app-main flex-grow-1 px-3 py-2">
  <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
    <div>
      <h2 class="h4 fw-bold mb-1"><?php echo h($title); ?></h2>
      <p class="text-secondary small mb-0" id="recipe-catalog-hint" data-base-hint="<?php echo h($hint); ?>">
        <?php echo h($hint); ?> 共 <span id="recipe-catalog-count"><?php echo count($recipes); ?></span> 款。
      </p>
    </div>
    <a href="<?php echo h(page_url('add-recipe.php')); ?>" class="btn btn-outline-primary btn-sm flex-shrink-0">+ 加入菜式</a>
  </div>
  <div class="text-center py-5 text-secondary d-none" id="recipe-catalog-empty">呢個分類暫時冇菜式</div>
  <div class="row row-cols-2 g-2" id="recipe-catalog-grid" data-builtin-count="<?php echo count($recipes); ?>">
    <?php foreach ($recipes as $recipe): ?>
      <?php include __DIR__ . '/includes/recipe-card.php'; ?>
    <?php endforeach; ?>
  </div>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
