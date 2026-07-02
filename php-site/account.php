<?php
require_once __DIR__ . '/includes/bootstrap.php';
$pageTitle = '揀選帳戶 — SmartCook';
$pageScripts = [asset_url('assets/js/account.js?v=20260703')];
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100 account-page">
<?php
$headerTitle = 'SmartCook';
include __DIR__ . '/header.html';
?>
<main class="container app-main flex-grow-1 px-3 py-4">
  <div class="text-center mb-4">
    <div class="account-page-icon mb-3">👋</div>
    <h1 class="h4 fw-bold mb-2">揀選帳戶</h1>
    <p class="text-secondary small mb-0">唔使密碼，揀你嘅名字就可以保存自己嘅煮食紀錄</p>
    <p id="current-account-hint" class="text-primary small mt-2 mb-0 d-none"></p>
  </div>

  <div class="d-grid gap-3 account-pick-grid">
    <button type="button" class="btn btn-lg account-pick-btn" data-account="kelvin">
      <span class="account-pick-avatar">K</span>
      <span class="account-pick-name">Kelvin</span>
    </button>
    <button type="button" class="btn btn-lg account-pick-btn" data-account="yuetsum">
      <span class="account-pick-avatar">Y</span>
      <span class="account-pick-name">YuetSum</span>
    </button>
  </div>

  <p class="text-secondary small text-center mt-4 mb-0">兩個帳戶可以互相睇對方嘅日曆同買餸清單，但唔可以修改</p>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
