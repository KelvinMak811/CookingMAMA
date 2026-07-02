import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PHP_SITE = join(ROOT, "php-site");
const OUT = join(ROOT, "out");
const BASE = "/CookingMAMA";

const recipes = JSON.parse(
  readFileSync(join(PHP_SITE, "data", "recipes.json"), "utf8")
);

const CUISINE_LABELS = {
  chinese: "中餐",
  western: "西餐",
  japanese: "日式",
  italian: "意式",
};

const CUISINE_HINTS = {
  all: "全部用易潔鑊／平底鑊就得，唔使焗爐同氣炸鍋。乾身餸、炒粉麵飯為主，唔包湯飯。",
  chinese: "港式家常、茶餐廳小炒，鑊氣十足又易整，唔包湯飯。",
  western: "西式一鑊過，早餐午餐晚餐都啱。",
  japanese: "日式丼飯、咖喱同炒麵，簡單好味。",
  italian: "意粉同燉菜，易潔鑊就煮到意式風味。",
};

function h(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function asset(path) {
  return `${BASE}/${path.replace(/^\//, "")}`;
}

function page(path) {
  return `${BASE}/${path.replace(/^\//, "")}`;
}

function recipeUrl(id) {
  return page(`recipes/${encodeURIComponent(id)}/`);
}

function cuisineUrl(cuisine) {
  return page(`recipes/cuisine/${encodeURIComponent(cuisine)}/`);
}

function difficulty(n) {
  const filled = Math.max(1, Math.min(5, n));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function head(title, description) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>${h(title)}</title>
<meta name="description" content="${h(description)}">
<meta name="theme-color" content="#f97316">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="${asset("assets/css/style.css?v=20260703")}" rel="stylesheet">
</head>`;
}

function header({ showBack = false, title = "", backHref = page("recipes/"), recipesActive = false, current = "" }) {
  return `<header class="navbar navbar-light bg-white border-bottom sticky-top shadow-sm app-navbar">
  <div class="container app-main px-3 py-0">
    <div class="d-flex align-items-center w-100 gap-2 app-navbar-inner">
      ${showBack
        ? `<a href="${h(backHref)}" class="btn btn-light btn-sm rounded-3 flex-shrink-0" aria-label="返回">←</a>
           ${title ? `<span class="mb-0 fw-bold text-truncate flex-grow-1 min-w-0">${h(title)}</span>` : ""}`
        : `<a href="${page("recipes/")}" class="d-flex align-items-center gap-2 text-decoration-none min-w-0 flex-grow-1">
             <span class="app-navbar-icon">🍳</span>
             ${title ? `<span class="fw-bold text-dark text-truncate">${h(title)}</span>` : `<span class="fw-bold text-primary">SmartCook</span>`}
           </a>`}
      <div class="d-flex align-items-center ms-auto gap-2 flex-shrink-0">
        <div class="dropdown" id="account-menu">
          <button class="btn btn-outline-primary btn-sm dropdown-toggle account-menu-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="帳戶選單">
            <span id="account-display-name">帳戶</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
            <li><a class="dropdown-item" href="${page("history/")}">📅 煮食日曆</a></li>
            <li><a class="dropdown-item" href="${page("shopping-list/")}">🛒 買餸清單</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="${page("account/")}">🔄 切換帳戶</a></li>
          </ul>
        </div>
        <nav class="d-none d-md-flex gap-1">
        <a href="${page("recipes/")}" class="nav-link rounded-3 px-3 py-2 ${recipesActive ? "bg-primary-subtle text-primary fw-semibold" : "text-secondary"}">菜式庫</a>
        <a href="${page("shopping-list/")}" class="nav-link rounded-3 px-3 py-2 ${current === "shopping" ? "bg-primary-subtle text-primary fw-semibold" : "text-secondary"}">買餸清單</a>
        <a href="${page("history/")}" class="nav-link rounded-3 px-3 py-2 ${current === "history" ? "bg-primary-subtle text-primary fw-semibold" : "text-secondary"}">煮食日曆</a>
        <a href="${page("expenses/")}" class="nav-link rounded-3 px-3 py-2 ${current === "expenses" ? "bg-primary-subtle text-primary fw-semibold" : "text-secondary"}">開支紀錄</a>
        </nav>
      </div>
    </div>
  </div>
</header>
<nav class="fixed-bottom bg-white border-top d-md-none bottom-nav safe-area-bottom" aria-label="主要導航">
  <div class="d-flex justify-content-around">
    <a href="${page("recipes/")}" class="bottom-nav-link ${recipesActive ? "active" : ""}"><span class="fs-5">📖</span><small>菜式</small></a>
    <a href="${page("shopping-list/")}" class="bottom-nav-link ${current === "shopping" ? "active" : ""}"><span class="fs-5">🛒</span><small>買餸</small></a>
    <a href="${page("history/")}" class="bottom-nav-link ${current === "history" ? "active" : ""}"><span class="fs-5">📅</span><small>日曆</small></a>
    <a href="${page("expenses/")}" class="bottom-nav-link ${current === "expenses" ? "active" : ""}"><span class="fs-5">💰</span><small>開支</small></a>
  </div>
</nav>
<a href="${page("shopping-list/")}" id="shopping-bubble" class="shopping-bubble d-none" aria-label="買餸清單"><span>🛒</span><span id="shopping-bubble-count" class="shopping-bubble-count">0</span></a>`;
}

function footer(extraScripts = []) {
  return `<script>window.SMARTCOOK_BASE=${JSON.stringify(BASE)};window.SMARTCOOK_STATIC=true;</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="${asset("assets/js/smartcook.js?v=20260703")}"></script>
${extraScripts.map((s) => `<script src="${h(s)}"></script>`).join("\n")}`;
}

function cuisineNav(active) {
  const items = [
    ["all", "全部", "🍽️", page("recipes/")],
    ["chinese", "中餐", "🥢", cuisineUrl("chinese")],
    ["western", "西餐", "🍝", cuisineUrl("western")],
    ["japanese", "日式", "🍱", cuisineUrl("japanese")],
    ["italian", "意式", "🍕", cuisineUrl("italian")],
  ];
  return `<nav class="cuisine-nav-sticky border-bottom py-1 mb-0" aria-label="菜式類別"><div class="date-nav-scroll"><ul class="nav nav-pills flex-nowrap gap-2 mb-0">
${items.map(([value, label, icon, href]) => {
  const count = value === "all" ? recipes.length : recipes.filter((r) => r.cuisine === value).length;
  const isActive = active === value;
  return `<li class="nav-item"><a href="${href}" class="nav-link rounded-3 d-flex align-items-center gap-1 px-3 ${isActive ? "active" : ""}"><span>${icon}</span><span>${label}</span><span class="badge rounded-pill ${isActive ? "bg-light text-primary" : "bg-secondary-subtle text-secondary"}">${count}</span></a></li>`;
}).join("")}
</ul></div></nav>`;
}

function recipeCard(recipe) {
  return `<div class="col"><a href="${recipeUrl(recipe.id)}" class="text-decoration-none text-dark h-100 d-block"><div class="card h-100 border-0 shadow-sm overflow-hidden"><div class="recipe-card-img"><img src="${h(recipe.imageUrl)}" alt="${h(recipe.name)}" class="object-fit-cover w-100 h-100" loading="lazy"></div><div class="card-body"><div class="d-flex justify-content-between align-items-start gap-2 mb-2"><h6 class="card-title mb-0">${h(recipe.name)}</h6><span class="badge bg-light text-secondary fw-normal">${h(CUISINE_LABELS[recipe.cuisine])}</span></div><div class="d-flex justify-content-between align-items-center small text-secondary"><span class="text-warning">${difficulty(recipe.difficulty)}</span><span>⏱ ${recipe.prepTime} 分鐘</span></div></div></div></a></div>`;
}

function recipesPage(cuisine = "all") {
  const filtered = cuisine === "all" ? recipes : recipes.filter((r) => r.cuisine === cuisine);
  const title = cuisine === "all" ? "全部菜式" : `${CUISINE_LABELS[cuisine]}菜式`;
  const hint = CUISINE_HINTS[cuisine];
  return `<!DOCTYPE html><html lang="zh-HK">${head(`${title} — SmartCook`, hint)}
<body class="d-flex flex-column min-vh-100">
${header({ title: "菜式庫", recipesActive: true })}
<div class="container app-main px-3">${cuisineNav(cuisine)}</div>
<main class="container app-main flex-grow-1 px-3 py-2">
<h2 class="h4 fw-bold mb-1">${h(title)}</h2>
<p class="text-secondary small mb-4">${h(hint)} 共 ${filtered.length} 款。</p>
<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">${filtered.map(recipeCard).join("")}</div>
</main>${footer()}</body></html>`;
}

function recipePage(recipe) {
  const steps = recipe.steps.map((step, i) => `<li class="list-group-item border rounded-3"><div class="d-flex justify-content-between align-items-start gap-2"><span>${h(step)}</span><button type="button" class="btn btn-sm btn-light flex-shrink-0 speak-step-btn" data-text="${h(step)}">🔊 朗讀</button></div></li>`).join("");
  return `<!DOCTYPE html><html lang="zh-HK">${head(`${recipe.name} — SmartCook`, recipe.description)}
<body class="d-flex flex-column min-vh-100">
${header({ showBack: true, title: recipe.name, backHref: cuisineUrl(recipe.cuisine), recipesActive: true })}
<div class="container app-main px-3">${cuisineNav(recipe.cuisine)}</div>
<main class="container app-main flex-grow-1 px-3 py-2"><article class="d-flex flex-column gap-4">
<div class="position-relative rounded-3 overflow-hidden shadow ratio ratio-16x9"><img src="${h(recipe.imageUrl)}" alt="${h(recipe.name)}" class="object-fit-cover w-100 h-100"></div>
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2"><div class="d-flex align-items-center gap-2"><span class="text-warning">${difficulty(recipe.difficulty)}</span><span class="badge bg-warning text-dark">${h(CUISINE_LABELS[recipe.cuisine])}</span></div><span class="text-secondary small">⏱ 約 ${recipe.prepTime} 分鐘 · 易潔鑊</span></div>
<section><h2 class="h5 fw-bold">簡介</h2><p class="text-secondary">${h(recipe.description)}</p></section>
<div class="card border-0 shadow-sm" id="serving-scaler"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-3"><h6 class="fw-bold mb-0">份量設定</h6><span class="badge bg-primary-subtle text-primary" id="scale-factor-badge">材料 × 1</span></div><div class="row g-3"><div class="col-6"><label class="form-label small text-secondary">煮幾多人食？</label><div class="d-flex align-items-center gap-2"><button type="button" class="btn btn-light btn-sm" data-servings-delta="-1">−</button><span class="fw-bold flex-grow-1 text-center" id="servings-label">${recipe.baseServings} 人</span><button type="button" class="btn btn-light btn-sm" data-servings-delta="1">+</button></div></div><div class="col-6"><label class="form-label small text-secondary">一次煮幾多餐？</label><div class="d-flex align-items-center gap-2"><button type="button" class="btn btn-light btn-sm" data-batches-delta="-1">−</button><span class="fw-bold flex-grow-1 text-center" id="batches-label">1 餐</span><button type="button" class="btn btn-light btn-sm" data-batches-delta="1">+</button></div></div></div><p class="small text-secondary mt-3 mb-0">菜式預設 ${recipe.baseServings} 人份量，調整後材料自動按比例計算。</p></div></div>
<section><h5 class="fw-bold mb-3">材料 <small class="text-secondary fw-normal" id="ingredients-heading">(${recipe.baseServings}人 × 1餐)</small></h5><ul class="list-group list-group-flush" id="ingredients-list"></ul><div class="my-4"><button type="button" class="btn btn-primary w-100" id="add-to-shopping-btn">🛒 一鍵加入買餸清單</button></div></section>
<section class="card border-0 shadow-sm"><div class="card-body"><h6 class="fw-bold">📅 預定煮食日子</h6><p class="small text-secondary">揀定幾時煮，會顯示喺煮食紀錄日曆，方便你提前買餸</p><label class="form-label small">幾時煮？</label><input type="date" class="form-control mb-3" id="plan-date"><button type="button" class="btn btn-outline-primary w-100" id="add-plan-btn">加入煮食日程</button></div></section>
<section><h2 class="h5 fw-bold mb-2">煮食步驟</h2><p class="text-secondary small mb-3">每個步驟都可以撳「朗讀步驟」用語音播放</p><ol class="list-group list-group-numbered gap-2" id="steps-list">${steps}</ol></section>
<section class="card border-0 shadow-sm"><div class="card-body"><label class="form-label small text-secondary">幾時煮？可以補登之前煮過嘅餸</label><input type="date" class="form-control mb-3" id="cooked-date"><p class="small text-secondary mb-2">幫自己評個分</p><div class="mb-3" id="rating-stars">${[1,2,3,4,5].map((i)=>`<button type="button" class="btn btn-link p-0 rating-star" data-rating="${i}">☆</button>`).join("")}</div><button type="button" class="btn btn-success w-100" id="complete-cooking-btn">✅ 完成煮食 · 打卡</button></div></section>
</article></main>
<script id="recipe-data" type="application/json">${JSON.stringify(recipe)}</script>
${footer([asset("assets/js/recipe-detail.js?v=20260703")])}</body></html>`;
}

function shellPage(title, current, mainHtml, script) {
  return `<!DOCTYPE html><html lang="zh-HK">${head(`${title} — SmartCook`)}
<body class="d-flex flex-column min-vh-100">
${header({ title, current })}
<main class="container app-main flex-grow-1 px-3 py-2">${mainHtml}</main>
${footer(script ? [asset(script)] : [])}</body></html>`;
}

function writeOut(relativePath, html) {
  const file = join(OUT, relativePath);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, html, "utf8");
  console.log(`  ${relativePath}`);
}

console.log("Building static site for GitHub Pages (Node)...");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(PHP_SITE, "assets"), join(OUT, "assets"), { recursive: true });
cpSync(join(PHP_SITE, "data"), join(OUT, "data"), { recursive: true });
writeFileSync(join(OUT, ".nojekyll"), "");

writeOut("recipes/index.html", recipesPage("all"));
for (const cuisine of ["chinese", "western", "japanese", "italian"]) {
  writeOut(`recipes/cuisine/${cuisine}/index.html`, recipesPage(cuisine));
}
for (const recipe of recipes) {
  writeOut(`recipes/${recipe.id}/index.html`, recipePage(recipe));
}

writeOut("shopping-list/index.html", shellPage("買餸清單", "shopping", `<div id="user-toggle" class="mb-3"></div><div class="d-flex flex-column gap-4"><form id="add-shopping-form" class="card border-0 shadow-sm"><div class="card-body"><h6 class="fw-bold mb-3">手動加入材料</h6><div class="row g-2"><div class="col-7"><input type="text" class="form-control" id="new-item-name" placeholder="材料名稱" required></div><div class="col-5"><input type="text" class="form-control" id="new-item-amount" placeholder="份量（可選）"></div></div><button type="submit" class="btn btn-primary w-100 mt-3">加入清單</button></div></form><button type="button" class="btn btn-outline-secondary" id="read-unbought-btn">🔊 朗讀未買材料</button><div id="shopping-list"></div><div class="card border-0 shadow-sm" id="shopping-total-card"><div class="card-body d-flex justify-content-between align-items-center"><span class="fw-bold">已購買總開支</span><span class="fs-5 fw-bold text-primary" id="shopping-total">$0</span></div></div></div>`, "assets/js/shopping.js?v=20260703"));

writeOut("history/index.html", shellPage("煮食日曆", "history", `<div id="user-toggle" class="mb-3"></div><p class="text-secondary small mb-3">撳日子查看預定煮食（藍點）同已完成（綠點）。可切換日曆或時間軸檢視。</p><div id="date-quick-nav" class="mb-3"></div><div class="btn-group w-100 mb-4" role="group"><input type="radio" class="btn-check" name="view-mode" id="view-calendar" checked><label class="btn btn-outline-primary flex-fill" for="view-calendar">📅 日曆</label><input type="radio" class="btn-check" name="view-mode" id="view-timeline"><label class="btn btn-outline-primary flex-fill" for="view-timeline">📋 時間軸</label></div><div id="calendar-view"></div><div id="timeline-view" class="d-none"></div>`, "assets/js/history.js?v=20260703"));

writeOut("expenses/index.html", shellPage("開支紀錄", "expenses", `<div id="user-toggle" class="mb-3"></div><div id="expense-month-nav" class="d-flex justify-content-between align-items-center mb-4"></div><div class="row g-3 mb-4" id="expense-summary"></div><div class="row g-3 mb-4"><div class="col-md-6"><div class="card border-0 shadow-sm h-100"><div class="card-body"><h6 class="fw-bold mb-3">按菜式開支</h6><div id="recipe-chart"></div></div></div></div><div class="col-md-6"><div class="card border-0 shadow-sm h-100"><div class="card-body"><h6 class="fw-bold mb-3">每餐平均開支</h6><div id="meal-chart"></div></div></div></div></div><div class="card border-0 shadow-sm"><div class="card-body"><h6 class="fw-bold mb-3">每日買餸紀錄</h6><div id="expense-ledger"></div></div></div>`, "assets/js/expenses.js?v=20260703"));

writeOut("account/index.html", `<!DOCTYPE html><html lang="zh-HK">${head("揀選帳戶 — SmartCook", "揀選 Kelvin 或 YuetSum 帳戶")}
<body class="d-flex flex-column min-vh-100 account-page">
${header({ title: "SmartCook" })}
<main class="container app-main flex-grow-1 px-3 py-4">
<div class="text-center mb-4"><div class="account-page-icon mb-3">👋</div><h1 class="h4 fw-bold mb-2">揀選帳戶</h1><p class="text-secondary small mb-0">唔使密碼，揀你嘅名字就可以保存自己嘅煮食紀錄</p><p id="current-account-hint" class="text-primary small mt-2 mb-0 d-none"></p></div>
<div class="d-grid gap-3 account-pick-grid">
<button type="button" class="btn btn-lg account-pick-btn" data-account="kelvin"><span class="account-pick-avatar">K</span><span class="account-pick-name">Kelvin</span></button>
<button type="button" class="btn btn-lg account-pick-btn" data-account="yuetsum"><span class="account-pick-avatar">Y</span><span class="account-pick-name">YuetSum</span></button>
</div>
<p class="text-secondary small text-center mt-4 mb-0">兩個帳戶可以互相睇對方嘅日曆同買餸清單，但唔可以修改</p>
</main>
${footer([asset("assets/js/account.js?v=20260703")])}</body></html>`);

writeOut("index.html", `<!DOCTYPE html><html lang="zh-HK"><head><meta charset="utf-8"><title>SmartCook</title><script>(function(){var base=${JSON.stringify(BASE)};var user=localStorage.getItem("smartcook_current_user");location.replace(user?base+"/recipes/":base+"/account/");})();</script></head><body></body></html>`);
cpSync(join(OUT, "recipes/index.html"), join(OUT, "404.html"));

console.log(`Done — ${recipes.length} recipe pages in ${OUT}`);
