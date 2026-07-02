<?php
require_once __DIR__ . '/includes/bootstrap.php';

$id = $_GET['id'] ?? '';
$recipe = get_recipe_by_id($id);
if ($recipe === null) {
    http_response_code(404);
    $pageTitle = '搵唔到菜式 — SmartCook';
    ?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100">
<?php
$showBack = true;
$headerTitle = '搵唔到菜式';
$backHref = page_url('recipes.php');
include __DIR__ . '/header.html';
?>
<main class="container app-main flex-grow-1 px-3 py-5 text-center">
  <p class="text-secondary mb-4">呢個菜式可能已移除，請返回菜式庫重試。</p>
  <a href="<?php echo h(page_url('recipes.php')); ?>" class="btn btn-primary">返回菜式庫</a>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
    <?php
    exit;
}

$cuisine = (string) $recipe['cuisine'];
$activeCuisine = $cuisine;
$pageTitle = $recipe['name'] . ' — SmartCook';
$pageScripts = [asset_url('assets/js/recipe-detail.js?v=20260702')];
$recipeJson = json_encode($recipe, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100">
<?php
$showBack = true;
$headerTitle = (string) $recipe['name'];
$backHref = cuisine_url($cuisine);
include __DIR__ . '/header.html';
?>
<div class="container app-main px-3">
  <?php include __DIR__ . '/includes/cuisine-nav.php'; ?>
</div>
<main class="container app-main flex-grow-1 px-3 py-2">
  <article class="d-flex flex-column gap-4">
    <div class="position-relative rounded-3 overflow-hidden shadow ratio ratio-16x9">
      <img src="<?php echo h((string) $recipe['imageUrl']); ?>" alt="<?php echo h((string) $recipe['name']); ?>" class="object-fit-cover w-100 h-100">
    </div>

    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <span class="text-warning"><?php echo render_difficulty((int) $recipe['difficulty']); ?></span>
        <span class="badge bg-warning text-dark"><?php echo h(CUISINE_LABELS[$cuisine] ?? ''); ?></span>
      </div>
      <span class="text-secondary small">⏱ 約 <?php echo (int) $recipe['prepTime']; ?> 分鐘 · 易潔鑊</span>
    </div>

    <section>
      <h2 class="h5 fw-bold">簡介</h2>
      <p class="text-secondary"><?php echo h((string) $recipe['description']); ?></p>
    </section>

    <div class="card border-0 shadow-sm" id="serving-scaler">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold mb-0">份量設定</h6>
          <span class="badge bg-primary-subtle text-primary" id="scale-factor-badge">材料 × 1</span>
        </div>
        <div class="row g-3">
          <div class="col-6">
            <label class="form-label small text-secondary">煮幾多人食？</label>
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-light btn-sm" data-servings-delta="-1">−</button>
              <span class="fw-bold flex-grow-1 text-center" id="servings-label"><?php echo (int) $recipe['baseServings']; ?> 人</span>
              <button type="button" class="btn btn-light btn-sm" data-servings-delta="1">+</button>
            </div>
          </div>
          <div class="col-6">
            <label class="form-label small text-secondary">一次煮幾多餐？</label>
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-light btn-sm" data-batches-delta="-1">−</button>
              <span class="fw-bold flex-grow-1 text-center" id="batches-label">1 餐</span>
              <button type="button" class="btn btn-light btn-sm" data-batches-delta="1">+</button>
            </div>
          </div>
        </div>
        <p class="small text-secondary mt-3 mb-0">菜式預設 <?php echo (int) $recipe['baseServings']; ?> 人份量，調整後材料自動按比例計算。</p>
      </div>
    </div>

    <section>
      <h5 class="fw-bold mb-3">材料 <small class="text-secondary fw-normal" id="ingredients-heading">(<?php echo (int) $recipe['baseServings']; ?>人 × 1餐)</small></h5>
      <ul class="list-group list-group-flush" id="ingredients-list"></ul>
      <div class="my-4">
        <button type="button" class="btn btn-primary w-100" id="add-to-shopping-btn">🛒 一鍵加入買餸清單</button>
      </div>
    </section>

    <section class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-bold">📅 預定煮食日子</h6>
        <p class="small text-secondary">揀定幾時煮，會顯示喺煮食紀錄日曆，方便你提前買餸</p>
        <label class="form-label small">幾時煮？</label>
        <input type="date" class="form-control mb-3" id="plan-date">
        <button type="button" class="btn btn-outline-primary w-100" id="add-plan-btn">加入煮食日程</button>
      </div>
    </section>

    <section>
      <h2 class="h5 fw-bold mb-2">煮食步驟</h2>
      <p class="text-secondary small mb-3">每個步驟都可以撳「朗讀步驟」用語音播放</p>
      <ol class="list-group list-group-numbered gap-2" id="steps-list">
        <?php foreach ($recipe['steps'] as $index => $step): ?>
          <li class="list-group-item border rounded-3">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <span><?php echo h((string) $step); ?></span>
              <button type="button" class="btn btn-sm btn-light flex-shrink-0 speak-step-btn" data-text="<?php echo h((string) $step); ?>">🔊 朗讀</button>
            </div>
          </li>
        <?php endforeach; ?>
      </ol>
    </section>

    <section class="card border-0 shadow-sm">
      <div class="card-body">
        <label class="form-label small text-secondary">幾時煮？可以補登之前煮過嘅餸</label>
        <input type="date" class="form-control mb-3" id="cooked-date">
        <p class="small text-secondary mb-2">幫自己評個分</p>
        <div class="mb-3" id="rating-stars">
          <?php for ($i = 1; $i <= 5; $i++): ?>
            <button type="button" class="btn btn-link p-0 rating-star" data-rating="<?php echo $i; ?>">☆</button>
          <?php endfor; ?>
        </div>
        <button type="button" class="btn btn-success w-100" id="complete-cooking-btn">✅ 完成煮食 · 打卡</button>
      </div>
    </section>
  </article>
</main>

<script id="recipe-data" type="application/json"><?php echo $recipeJson; ?></script>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
