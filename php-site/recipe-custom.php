<?php
require_once __DIR__ . '/includes/bootstrap.php';
$pageTitle = '自訂菜式 — SmartCook';
$pageScripts = [
    asset_url('assets/js/recipe-detail.js?v=20260704'),
    asset_url('assets/js/recipe-custom-view.js?v=20260704'),
];
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100" data-cuisine="all">
<?php
$showBack = true;
$headerTitle = '自訂菜式';
$backHref = page_url('recipes.php');
include __DIR__ . '/header.html';
?>
<main class="container app-main flex-grow-1 px-3 py-2">
  <div id="recipe-custom-app"></div>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
