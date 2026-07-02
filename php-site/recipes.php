<?php
require_once __DIR__ . '/includes/bootstrap.php';

$cuisine = 'all';
$recipes = filter_recipes($cuisine);
$activeCuisine = 'all';
$title = '全部菜式';
$hint = CUISINE_HINTS['all'];

$pageTitle = '菜式庫 — SmartCook';
$pageDescription = '香港風味煮食菜式庫，易潔鑊家常菜';
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100">
<?php
$headerTitle = '菜式庫';
include __DIR__ . '/header.html';
?>
<div class="container app-main px-3">
  <?php include __DIR__ . '/includes/cuisine-nav.php'; ?>
</div>
<main class="container app-main flex-grow-1 px-3 py-2">
  <h2 class="h4 fw-bold mb-1"><?php echo h($title); ?></h2>
  <p class="text-secondary small mb-4"><?php echo h($hint); ?> 共 <?php echo count($recipes); ?> 款。</p>
  <?php if (count($recipes) === 0): ?>
    <div class="text-center py-5 text-secondary">呢個分類暫時冇菜式</div>
  <?php else: ?>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
      <?php foreach ($recipes as $recipe): ?>
        <?php include __DIR__ . '/includes/recipe-card.php'; ?>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
