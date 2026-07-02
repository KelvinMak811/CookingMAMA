<?php
require_once __DIR__ . '/includes/bootstrap.php';
$base = base_path();
?>
<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="utf-8">
  <title>SmartCook</title>
  <script>
    (function () {
      var base = <?php echo json_encode($base !== '' ? $base : ''); ?>;
      var user = localStorage.getItem('smartcook_current_user');
      var target = user
        ? (base ? base + '/recipes.php' : 'recipes.php')
        : (base ? base + '/account.php' : 'account.php');
      location.replace(target);
    })();
  </script>
</head>
<body></body>
</html>
