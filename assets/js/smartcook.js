/**
 * SmartCook — 共用儲存層（相容 Next.js Zustand persist 格式）
 */
const STORAGE_KEYS = {
  SHOPPING: "smartcook_shopping",
  COOKING_LOG: "smartcook_cooking_log",
  MEAL_PLAN: "smartcook_meal_plan",
};

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

function getShoppingItems() {
  return loadZustandState(STORAGE_KEYS.SHOPPING, { items: [] }).items || [];
}

function setShoppingItems(items) {
  saveZustandState(STORAGE_KEYS.SHOPPING, { items });
  updateShoppingBubble();
}

function getCookingRecords() {
  return loadZustandState(STORAGE_KEYS.COOKING_LOG, { records: [] }).records || [];
}

function setCookingRecords(records) {
  saveZustandState(STORAGE_KEYS.COOKING_LOG, { records });
}

function getMealPlans() {
  return loadZustandState(STORAGE_KEYS.MEAL_PLAN, { plans: [] }).plans || [];
}

function setMealPlans(plans) {
  saveZustandState(STORAGE_KEYS.MEAL_PLAN, { plans });
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
  if (!("speechSynthesis" in window)) {
    alert("你嘅瀏覽器唔支援語音播放");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-HK";
  window.speechSynthesis.speak(utter);
}

document.addEventListener("DOMContentLoaded", updateShoppingBubble);
