document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("recipe-catalog-grid");
  if (!grid) return;

  const cuisine = document.body.dataset.cuisine || "all";
  const countEl = document.getElementById("recipe-catalog-count");
  const emptyEl = document.getElementById("recipe-catalog-empty");
  const hintEl = document.getElementById("recipe-catalog-hint");
  const builtinCount = parseInt(grid.dataset.builtinCount || "0", 10);
  const clearBtn = document.getElementById("recipe-filter-clear");
  const params = new URLSearchParams(window.location.search);

  let meats = RecipeIngredientFilters.parseList(params.get("m"));
  let vegs = RecipeIngredientFilters.parseList(params.get("v"));

  function syncChipUi() {
    document.querySelectorAll("[data-filter-meat]").forEach((btn) => {
      const active = meats.includes(btn.dataset.filterMeat);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll("[data-filter-veg]").forEach((btn) => {
      const active = vegs.includes(btn.dataset.filterVeg);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (clearBtn) {
      clearBtn.classList.toggle("d-none", meats.length === 0 && vegs.length === 0);
    }
  }

  function writeUrl() {
    const next = new URLSearchParams(window.location.search);
    if (meats.length) next.set("m", meats.join(","));
    else next.delete("m");
    if (vegs.length) next.set("v", vegs.join(","));
    else next.delete("v");
    const qs = next.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, "", url);
  }

  function applyFilters() {
    const cards = [...grid.querySelectorAll("[data-recipe-card]")];
    let visible = 0;
    cards.forEach((card) => {
      const hay = card.dataset.haystack || "";
      const show = RecipeIngredientFilters.matchesFilters(hay, meats, vegs);
      card.classList.toggle("d-none", !show);
      if (show) visible += 1;
    });
    if (emptyEl) {
      emptyEl.classList.toggle("d-none", visible > 0);
      emptyEl.textContent =
        meats.length || vegs.length
          ? "搵唔到符合條件嘅菜式，試下改篩選。"
          : "呢個分類暫時冇菜式";
    }
    if (hintEl) {
      const baseHint = hintEl.dataset.baseHint || "";
      hintEl.textContent =
        meats.length || vegs.length
          ? `材料篩選 — 搵到 ${visible} 款。`
          : `${baseHint} 共 ${visible} 款。`;
    } else if (countEl) {
      countEl.textContent = String(visible);
    }
  }

  function renderCustom() {
    const custom = filterCustomRecipes(cuisine);
    custom.forEach((recipe) => {
      grid.insertAdjacentHTML("beforeend", buildRecipeCardHtml(recipe));
    });
    updateCuisineBadges();
    applyFilters();
  }

  function updateCuisineBadges() {
    document.querySelectorAll("[data-cuisine-count]").forEach((badge) => {
      const value = badge.dataset.cuisineCount;
      const base = parseInt(badge.dataset.baseCount || "0", 10);
      const extra =
        value === "all"
          ? getCustomRecipes().length
          : getCustomRecipes().filter((r) => (r.cuisine || "chinese") === value).length;
      badge.textContent = String(base + extra);
    });
  }

  document.querySelectorAll("[data-filter-meat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.filterMeat;
      meats = meats.includes(id) ? meats.filter((x) => x !== id) : [...meats, id];
      syncChipUi();
      writeUrl();
      applyFilters();
    });
  });

  document.querySelectorAll("[data-filter-veg]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.filterVeg;
      vegs = vegs.includes(id) ? vegs.filter((x) => x !== id) : [...vegs, id];
      syncChipUi();
      writeUrl();
      applyFilters();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      meats = [];
      vegs = [];
      syncChipUi();
      writeUrl();
      applyFilters();
    });
  }

  syncChipUi();
  renderCustom();
});
