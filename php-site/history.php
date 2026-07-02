<?php
require_once __DIR__ . '/includes/bootstrap.php';
$pageTitle = '煮食日曆 — SmartCook';
$pageScripts = ['assets/js/history.js?v=20260702'];
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100">
<?php
$headerTitle = '煮食日曆';
include __DIR__ . '/header.html';
?>
<main class="container app-main flex-grow-1 px-3 py-2">
  <p class="text-secondary small mb-3">撳日子查看預定煮食（藍點）同已完成（綠點）。可切換日曆或時間軸檢視。</p>

  <div id="date-quick-nav" class="mb-3"></div>

  <div class="btn-group w-100 mb-4" role="group" aria-label="檢視模式">
    <input type="radio" class="btn-check" name="view-mode" id="view-calendar" checked>
    <label class="btn btn-outline-primary flex-fill" for="view-calendar">📅 日曆</label>
    <input type="radio" class="btn-check" name="view-mode" id="view-timeline">
    <label class="btn btn-outline-primary flex-fill" for="view-timeline">📋 時間軸</label>
  </div>

  <div id="calendar-view"></div>
  <div id="timeline-view" class="d-none"></div>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
