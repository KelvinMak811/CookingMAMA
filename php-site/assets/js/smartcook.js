/**
 * SmartCook — 共用儲存層（相容 Next.js Zustand persist 格式）
 */
const ACCOUNTS = {
  kelvin: { id: "kelvin", name: "Kelvin" },
  yuetsum: { id: "yuetsum", name: "YuetSum" },
};

const STORAGE_KEY_CURRENT_USER = "smartcook_current_user";

const STORAGE_KEYS = {
  SHOPPING: "smartcook_shopping",
  COOKING_LOG: "smartcook_cooking_log",
  MEAL_PLAN: "smartcook_meal_plan",
  CUSTOM_RECIPES: "smartcook_custom_recipes",
};

const CUISINE_LABELS = {
  chinese: "中餐",
  western: "西餐",
  japanese: "日式",
  italian: "意式",
};

const DEFAULT_RECIPE_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Cooking_pot_stew_%28Unsplash%29.jpg/640px-Cooking_pot_stew_%28Unsplash%29.jpg";

const LEGACY_KEYS = { ...STORAGE_KEYS };

function userStorageKey(baseKey, userId) {
  return `${baseKey}_${userId}`;
}

function getCurrentUserId() {
  const id = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  return id && ACCOUNTS[id] ? id : null;
}

function getCurrentUser() {
  const id = getCurrentUserId();
  return id ? ACCOUNTS[id] : null;
}

function getAccountName(userId) {
  return ACCOUNTS[userId]?.name || userId;
}

function getOtherUserId(userId) {
  return Object.keys(ACCOUNTS).find((id) => id !== userId) || null;
}

function setCurrentUser(userId) {
  if (!ACCOUNTS[userId]) return;
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, userId);
  migrateLegacyData(userId);
  updateShoppingBubble();
  updateAccountMenu();
}

function canEditUser(userId) {
  return userId === getCurrentUserId();
}

function accountPageUrl() {
  const base = window.SMARTCOOK_BASE || "";
  if (window.SMARTCOOK_STATIC) {
    return `${base}/account/`;
  }
  return `${base}/account.php`;
}

function historyPageUrl() {
  const base = window.SMARTCOOK_BASE || "";
  if (window.SMARTCOOK_STATIC) {
    return `${base}/history/`;
  }
  return `${base}/history.php`;
}

function shoppingPageUrl() {
  const base = window.SMARTCOOK_BASE || "";
  if (window.SMARTCOOK_STATIC) {
    return `${base}/shopping-list/`;
  }
  return `${base}/shopping-list.php`;
}

function requireCurrentUser() {
  if (getCurrentUserId()) return;
  location.replace(accountPageUrl());
}

function migrateLegacyData(targetUserId) {
  if (!targetUserId) return;
  const pairs = [
    [LEGACY_KEYS.SHOPPING, STORAGE_KEYS.SHOPPING, { items: [] }],
    [LEGACY_KEYS.COOKING_LOG, STORAGE_KEYS.COOKING_LOG, { records: [] }],
    [LEGACY_KEYS.MEAL_PLAN, STORAGE_KEYS.MEAL_PLAN, { plans: [] }],
  ];
  pairs.forEach(([legacyKey, baseKey, fallback]) => {
    const userKey = userStorageKey(baseKey, targetUserId);
    if (localStorage.getItem(userKey)) return;
    const legacyRaw = localStorage.getItem(legacyKey);
    if (!legacyRaw) return;
    localStorage.setItem(userKey, legacyRaw);
    localStorage.removeItem(legacyKey);
  });
}

function loadZustandState(key, fallbackState) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackState;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.state) {
      return parsed.state;
    }
    return parsed;
  } catch {
    return fallbackState;
  }
}

function saveZustandState(key, state) {
  localStorage.setItem(key, JSON.stringify({ state, version: 0 }));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDateHK(date) {
  const d = new Date(date);
  return d.toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function toDateInputValue(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const FIXED_AMOUNTS = /適量|少許|隨意/;

function scaleAmount(amount, factor) {
  if (factor === 1 || FIXED_AMOUNTS.test(amount)) return amount;
  const halfMatch = amount.match(/^半(.+)$/);
  if (halfMatch && factor === 2) return `1${halfMatch[1]}`;
  if (halfMatch) return amount;
  const numMatch = amount.match(/^([\d.]+)\s*(.*)$/);
  if (numMatch) {
    const scaled = parseFloat(numMatch[1]) * factor;
    const unit = numMatch[2];
    const formatted = Number.isInteger(scaled)
      ? String(scaled)
      : scaled.toFixed(1).replace(/\.0$/, "");
    return unit ? `${formatted}${unit.startsWith(" ") ? " " : ""}${unit.trim()}` : formatted;
  }
  return amount;
}

function scaleIngredients(ingredients, baseServings, servings, mealBatches) {
  const factor = (servings / baseServings) * mealBatches;
  return ingredients.map((ing) => ({
    ...ing,
    amount: scaleAmount(ing.amount, factor),
  }));
}

function resolveUserId(userId) {
  return userId || getCurrentUserId();
}

function getShoppingItems(userId) {
  const id = resolveUserId(userId);
  if (!id) return [];
  migrateLegacyData(id);
  const key = userStorageKey(STORAGE_KEYS.SHOPPING, id);
  return loadZustandState(key, { items: [] }).items || [];
}

function setShoppingItems(items, userId) {
  const id = resolveUserId(userId);
  if (!id || !canEditUser(id)) return;
  saveZustandState(userStorageKey(STORAGE_KEYS.SHOPPING, id), { items });
  updateShoppingBubble();
}

function getCookingRecords(userId) {
  const id = resolveUserId(userId);
  if (!id) return [];
  migrateLegacyData(id);
  const key = userStorageKey(STORAGE_KEYS.COOKING_LOG, id);
  return loadZustandState(key, { records: [] }).records || [];
}

function setCookingRecords(records, userId) {
  const id = resolveUserId(userId);
  if (!id || !canEditUser(id)) return;
  saveZustandState(userStorageKey(STORAGE_KEYS.COOKING_LOG, id), { records });
}

function getMealPlans(userId) {
  const id = resolveUserId(userId);
  if (!id) return [];
  migrateLegacyData(id);
  const key = userStorageKey(STORAGE_KEYS.MEAL_PLAN, id);
  return loadZustandState(key, { plans: [] }).plans || [];
}

function setMealPlans(plans, userId) {
  const id = resolveUserId(userId);
  if (!id || !canEditUser(id)) return;
  saveZustandState(userStorageKey(STORAGE_KEYS.MEAL_PLAN, id), { plans });
}

function updateShoppingBubble() {
  const bubble = document.getElementById("shopping-bubble");
  const countEl = document.getElementById("shopping-bubble-count");
  if (!bubble || !countEl) return;
  const unbought = getShoppingItems().filter((i) => !i.isBought).length;
  if (unbought > 0) {
    bubble.classList.remove("d-none");
    countEl.textContent = String(unbought);
  } else {
    bubble.classList.add("d-none");
  }
}

function recipePageUrl(recipeId) {
  const base = window.SMARTCOOK_BASE || "";
  if (String(recipeId).startsWith("custom-")) {
    if (window.SMARTCOOK_STATIC) {
      return `${base}/recipes/custom/?id=${encodeURIComponent(recipeId)}`;
    }
    return `${base}/recipe-custom.php?id=${encodeURIComponent(recipeId)}`;
  }
  if (window.SMARTCOOK_STATIC) {
    return `${base}/recipes/${encodeURIComponent(recipeId)}/`;
  }
  return `${base}/recipe.php?id=${encodeURIComponent(recipeId)}`;
}

function addRecipePageUrl(recipeId) {
  const base = window.SMARTCOOK_BASE || "";
  const query = recipeId ? `?id=${encodeURIComponent(recipeId)}` : "";
  if (window.SMARTCOOK_STATIC) {
    return `${base}/add-recipe/${query}`;
  }
  return `${base}/add-recipe.php${query}`;
}

function recipesCatalogUrl() {
  const base = window.SMARTCOOK_BASE || "";
  if (window.SMARTCOOK_STATIC) {
    return `${base}/recipes/`;
  }
  return `${base}/recipes.php`;
}

function getCustomRecipes() {
  return loadZustandState(STORAGE_KEYS.CUSTOM_RECIPES, { recipes: [] }).recipes || [];
}

function saveCustomRecipes(recipes) {
  saveZustandState(STORAGE_KEYS.CUSTOM_RECIPES, { recipes });
}

function getCustomRecipeById(id) {
  return getCustomRecipes().find((r) => r.id === id) || null;
}

function canEditCustomRecipe(recipe) {
  return recipe && recipe.createdBy === getCurrentUserId();
}

function deleteCustomRecipe(id) {
  const recipe = getCustomRecipeById(id);
  if (!recipe || !canEditCustomRecipe(recipe)) return false;
  saveCustomRecipes(getCustomRecipes().filter((r) => r.id !== id));
  return true;
}

function upsertCustomRecipe(recipe) {
  const recipes = getCustomRecipes();
  const index = recipes.findIndex((r) => r.id === recipe.id);
  if (index >= 0) {
    if (!canEditCustomRecipe(recipes[index])) return false;
    recipes[index] = recipe;
  } else {
    recipes.unshift(recipe);
  }
  saveCustomRecipes(recipes);
  return true;
}

function filterCustomRecipes(cuisine) {
  const all = getCustomRecipes();
  if (!cuisine || cuisine === "all") return all;
  return all.filter((r) => (r.cuisine || "chinese") === cuisine);
}

function generateCustomRecipeId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function renderDifficultyStars(n) {
  const filled = Math.max(1, Math.min(5, Number(n) || 1));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildRecipeCardHtml(recipe) {
  const cuisine = CUISINE_LABELS[recipe.cuisine] || CUISINE_LABELS.chinese;
  const imageUrl = recipe.imageUrl || DEFAULT_RECIPE_IMAGE;
  const prepTime = recipe.prepTime ? `${recipe.prepTime} 分鐘` : "—";
  const creator = recipe.isCustom
    ? `<div class="small text-primary mt-1">👤 ${escapeHtml(recipe.createdByName || "")} 加入</div>`
    : "";
  const customBadge = recipe.isCustom
    ? `<span class="badge bg-primary-subtle text-primary fw-normal me-1">自訂</span>`
    : "";
  return `<div class="col">
    <a href="${recipePageUrl(recipe.id)}" class="text-decoration-none text-dark h-100 d-block">
      <div class="card h-100 border-0 shadow-sm overflow-hidden ${recipe.isCustom ? "border border-primary-subtle" : ""}">
        <div class="recipe-card-img">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(recipe.name)}" class="object-fit-cover w-100 h-100" loading="lazy">
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h6 class="card-title mb-0">${escapeHtml(recipe.name)}</h6>
            <span class="text-end">${customBadge}<span class="badge bg-light text-secondary fw-normal">${escapeHtml(cuisine)}</span></span>
          </div>
          <div class="d-flex justify-content-between align-items-center small text-secondary">
            <span class="text-warning">${renderDifficultyStars(recipe.difficulty)}</span>
            <span>⏱ ${prepTime}</span>
          </div>
          ${creator}
        </div>
      </div>
    </a>
  </div>`;
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    alert("你嘅瀏覽器唔支援語音播放");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-HK";
  window.speechSynthesis.speak(utter);
}

function updateAccountMenu() {
  const nameEl = document.getElementById("account-display-name");
  const menu = document.getElementById("account-menu");
  const user = getCurrentUser();
  if (nameEl) {
    nameEl.textContent = user ? user.name : "帳戶";
  }
  if (menu) {
    menu.classList.toggle("d-none", !user);
  }
}

function renderUserToggle(containerEl, viewingUserId, onChange) {
  if (!containerEl) return;
  const currentId = getCurrentUserId();
  containerEl.innerHTML = `
    <div class="btn-group w-100 user-toggle" role="group" aria-label="揀選要睇邊個帳戶嘅紀錄">
      ${Object.values(ACCOUNTS)
        .map((acc) => {
          const active = viewingUserId === acc.id;
          const suffix = acc.id === currentId ? "（我）" : "";
          return `<button type="button" class="btn btn-sm ${active ? "btn-primary" : "btn-outline-primary"}" data-view-user="${acc.id}">${acc.name}${suffix}</button>`;
        })
        .join("")}
    </div>
    ${
      viewingUserId !== currentId
        ? `<div class="alert alert-info py-2 small mb-0 mt-2">只限閱讀 <strong>${getAccountName(viewingUserId)}</strong> 嘅紀錄，唔可以修改</div>`
        : ""
    }`;
  containerEl.querySelectorAll("[data-view-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      onChange(btn.dataset.viewUser);
    });
  });
}

function initAppShell() {
  updateAccountMenu();
  updateShoppingBubble();
  const path = location.pathname;
  const isAccountPage = path.includes("/account") || path.endsWith("account.php");
  if (!isAccountPage) {
    requireCurrentUser();
  }
}

document.addEventListener("DOMContentLoaded", initAppShell);
