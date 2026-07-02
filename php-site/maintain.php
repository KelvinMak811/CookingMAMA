<?php
require_once __DIR__ . '/includes/bootstrap.php';
$pageTitle = 'Maintain — SmartCook';
?>
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title><?php echo h($pageTitle); ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="<?php echo h(asset_url('assets/css/style.css?v=20260705')); ?>" rel="stylesheet">
</head>
<body class="maintain-page bg-dark text-light min-vh-100">
  <div id="maintain-app" class="container py-4" data-api-base="<?php echo h(base_path()); ?>"></div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="<?php echo h(asset_url('assets/js/maintain.js?v=20260705')); ?>"></script>
</body>
</html>
