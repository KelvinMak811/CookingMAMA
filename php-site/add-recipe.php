<?php
require_once __DIR__ . '/includes/bootstrap.php';
$editId = $_GET['id'] ?? '';
$pageTitle = ($editId !== '' ? '編輯菜式' : '加入菜式') . ' — SmartCook';
$pageScripts = [asset_url('assets/js/add-recipe.js?v=20260704')];
?>
<!DOCTYPE html>
<html lang="zh-HK">
<?php include __DIR__ . '/head.html'; ?>
<body class="d-flex flex-column min-vh-100">
<?php
$showBack = true;
$headerTitle = '加入菜式';
$backHref = page_url('recipes.php');
include __DIR__ . '/header.html';
?>
<main class="container app-main flex-grow-1 px-3 py-2">
  <h1 class="h4 fw-bold mb-1" id="add-recipe-page-title">加入菜式</h1>
  <p class="text-secondary small mb-4">填寫你嘅菜式資料。除菜式名稱同材料外，其他欄位可留空。</p>

  <form id="add-recipe-form" class="d-flex flex-column gap-4">
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-bold mb-3">基本資料</h6>
        <div class="mb-3">
          <label class="form-label">菜式名稱 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" name="name" placeholder="例如：媽咪秘製咖喱" required>
        </div>
        <div class="row g-3">
          <div class="col-6">
            <label class="form-label">菜系</label>
            <select class="form-select" name="cuisine">
              <?php foreach (CUISINE_LABELS as $value => $label): ?>
                <option value="<?php echo h($value); ?>"><?php echo h($label); ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">預設人數</label>
            <input type="number" class="form-control" name="baseServings" min="1" max="12" value="2" placeholder="2">
          </div>
          <div class="col-6">
            <label class="form-label">難度（1-5）</label>
            <select class="form-select" name="difficulty">
              <?php for ($i = 1; $i <= 5; $i++): ?>
                <option value="<?php echo $i; ?>"><?php echo str_repeat('★', $i) . str_repeat('☆', 5 - $i); ?></option>
              <?php endfor; ?>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">準備時間（分鐘）</label>
            <input type="number" class="form-control" name="prepTime" min="0" placeholder="可留空">
          </div>
        </div>
        <div class="mt-3">
          <label class="form-label">簡介</label>
          <textarea class="form-control" name="description" rows="2" placeholder="描述呢道菜…（可留空）"></textarea>
        </div>
        <div class="mt-3">
          <label class="form-label">圖片網址</label>
          <input type="url" class="form-control" name="imageUrl" placeholder="https://…（可留空，會用預設圖）">
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold mb-0">材料 <span class="text-danger">*</span></h6>
          <button type="button" class="btn btn-sm btn-outline-primary" id="add-ingredient-btn">＋ 加材料</button>
        </div>
        <div id="ingredients-list-form"></div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold mb-0">煮食步驟</h6>
          <button type="button" class="btn btn-sm btn-outline-primary" id="add-step-btn">＋ 加步驟</button>
        </div>
        <div id="steps-list-form"></div>
        <p class="small text-secondary mb-0 mt-2">步驟可留空，之後再補充</p>
      </div>
    </div>

    <div class="d-grid gap-2">
      <button type="submit" class="btn btn-primary btn-lg" id="submit-recipe-btn">加入菜式</button>
      <button type="button" class="btn btn-outline-danger d-none" id="delete-recipe-btn">🗑 刪除此菜式</button>
    </div>
  </form>
</main>
<?php include __DIR__ . '/footer.html'; ?>
</body>
</html>
