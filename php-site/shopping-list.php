<?php
require_once __DIR__ . '/includes/bootstrap.php';
$pageTitle = '買餸清單 — SmartCook';
$pageScripts = [asset_url('assets/js/shopping.js?v=20260702')];
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100">
<?php
$headerTitle = '買餸清單';
include __DIR__ . '/header.html';
?>
<main class="container app-main flex-grow-1 px-3 py-2">
  <div class="d-flex flex-column gap-4">
    <form id="add-shopping-form" class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-bold mb-3">手動加入材料</h6>
        <div class="row g-2">
          <div class="col-7">
            <input type="text" class="form-control" id="new-item-name" placeholder="材料名稱" required>
          </div>
          <div class="col-5">
            <input type="text" class="form-control" id="new-item-amount" placeholder="份量（可選）">
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100 mt-3">加入清單</button>
      </div>
    </form>

    <button type="button" class="btn btn-outline-secondary" id="read-unbought-btn">🔊 朗讀未買材料</button>

    <div id="shopping-list"></div>

    <div class="card border-0 shadow-sm" id="shopping-total-card">
      <div class="card-body d-flex justify-content-between align-items-center">
        <span class="fw-bold">已購買總開支</span>
        <span class="fs-5 fw-bold text-primary" id="shopping-total">$0</span>
      </div>
    </div>
  </div>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
