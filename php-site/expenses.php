<?php
require_once __DIR__ . '/includes/bootstrap.php';
$pageTitle = '開支紀錄 — SmartCook';
$pageScripts = [asset_url('assets/js/expenses.js?v=20260703')];
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100">
<?php
$headerTitle = '開支紀錄';
include __DIR__ . '/header.html';
?>
<main class="container app-main flex-grow-1 px-3 py-2">
  <div id="user-toggle" class="mb-3"></div>
  <div id="expense-month-nav" class="d-flex justify-content-between align-items-center mb-4"></div>

  <div class="row g-3 mb-4" id="expense-summary"></div>

  <div class="row g-3 mb-4">
    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <h6 class="fw-bold mb-3">按菜式開支</h6>
          <div id="recipe-chart"></div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <h6 class="fw-bold mb-3">每餐平均開支</h6>
          <div id="meal-chart"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <h6 class="fw-bold mb-3">每日買餸紀錄</h6>
      <div id="expense-ledger"></div>
    </div>
  </div>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
