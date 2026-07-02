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
};

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
  if (window.SMARTCOOK_STATIC) {
    return `${base}/recipes/${encodeURIComponent(recipeId)}/`;
  }
  return `${base}/recipe.php?id=${encodeURIComponent(recipeId)}`;
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
