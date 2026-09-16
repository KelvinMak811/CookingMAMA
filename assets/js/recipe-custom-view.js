document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("recipe-custom-app");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const recipe = id ? getCustomRecipeById(id) : null;

  if (!recipe) {
    root.innerHTML = `
      <div class="text-center py-5">
        <p class="text-secondary mb-4">搵唔到呢個自訂菜式，可能已被刪除。</p>
        <a href="${recipesCatalogUrl()}" class="btn btn-primary">返回菜式庫</a>
      </div>`;
    return;
  }

  document.title = `${recipe.name} — SmartCook`;
  const backTitle = document.getElementById("header-recipe-title");
  if (backTitle) backTitle.textContent = recipe.name;

  const cuisine = CUISINE_LABELS[recipe.cuisine] || CUISINE_LABELS.chinese;
  const imageUrl = recipe.imageUrl || DEFAULT_RECIPE_IMAGE;
  const prepTime = recipe.prepTime ? `約 ${recipe.prepTime} 分鐘` : "時間自訂";
  const description = recipe.description || "（未有簡介）";
  const baseServings = recipe.baseServings || 2;
  const steps = recipe.steps && recipe.steps.length
    ? recipe.steps
    : ["（未有步驟說明）"];

  const ownerActions = canEditCustomRecipe(recipe)
    ? `<div class="d-flex gap-2 mb-2">
        <a href="${addRecipePageUrl(recipe.id)}" class="btn btn-outline-primary btn-sm">✏️ 編輯菜式</a>
        <button type="button" class="btn btn-outline-danger btn-sm" id="delete-custom-recipe-btn">🗑 刪除菜式</button>
      </div>`
    : "";

  root.innerHTML = `
    <article class="d-flex flex-column gap-4">
      <div class="alert alert-primary-subtle border-0 py-2 small mb-0">
        <span class="badge bg-primary me-1">自訂菜式</span>
        由 <strong>${escapeHtml(recipe.createdByName)}</strong> 加入
        ${recipe.createdAt ? ` · ${new Date(recipe.createdAt).toLocaleDateString("zh-HK")}` : ""}
      </div>
      ${ownerActions}
      <div class="position-relative rounded-3 overflow-hidden shadow ratio ratio-16x9">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(recipe.name)}" class="object-fit-cover w-100 h-100">
      </div>
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <span class="text-warning">${renderDifficultyStars(recipe.difficulty)}</span>
          <span class="badge bg-warning text-dark">${escapeHtml(cuisine)}</span>
        </div>
        <span class="text-secondary small">⏱ ${escapeHtml(prepTime)} · 易潔鑊</span>
      </div>
      <section>
        <h2 class="h5 fw-bold">簡介</h2>
        <p class="text-secondary">${escapeHtml(description)}</p>
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
                <span class="fw-bold flex-grow-1 text-center" id="servings-label">${baseServings} 人</span>
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
          <p class="small text-secondary mt-3 mb-0">菜式預設 ${baseServings} 人份量，調整後材料自動按比例計算。</p>
        </div>
      </div>
      <section>
        <h5 class="fw-bold mb-3">材料 <small class="text-secondary fw-normal" id="ingredients-heading">(${baseServings}人 × 1餐)</small></h5>
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
          ${steps.map((step) => `<li class="list-group-item border rounded-3"><div class="d-flex justify-content-between align-items-start gap-2"><span>${escapeHtml(step)}</span><button type="button" class="btn btn-sm btn-light flex-shrink-0 speak-step-btn" data-text="${escapeHtml(step)}">🔊 朗讀</button></div></li>`).join("")}
        </ol>
      </section>
      <section class="card border-0 shadow-sm">
        <div class="card-body">
          <label class="form-label small text-secondary">幾時煮？可以補登之前煮過嘅餸</label>
          <input type="date" class="form-control mb-3" id="cooked-date">
          <p class="small text-secondary mb-2">幫自己評個分</p>
          <div class="mb-3" id="rating-stars">
            ${[1, 2, 3, 4, 5].map((i) => `<button type="button" class="btn btn-link p-0 rating-star" data-rating="${i}">☆</button>`).join("")}
          </div>
          <button type="button" class="btn btn-success w-100" id="complete-cooking-btn">✅ 完成煮食 · 打卡</button>
        </div>
      </section>
    </article>`;

  document.getElementById("delete-custom-recipe-btn")?.addEventListener("click", () => {
    if (!confirm(`確定要刪除「${recipe.name}」？`)) return;
    if (deleteCustomRecipe(recipe.id)) {
      location.replace(recipesCatalogUrl());
    } else {
      alert("無法刪除此菜式");
    }
  });

  initRecipeDetail(recipe);
  if (typeof trackDishView === "function") {
    trackDishView(recipe);
  }
});
