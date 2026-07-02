document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("recipe-catalog-grid");
  if (!grid) return;

  const cuisine = document.body.dataset.cuisine || "all";
  const countEl = document.getElementById("recipe-catalog-count");
  const builtinCount = parseInt(grid.dataset.builtinCount || "0", 10);

  function renderCustom() {
    const custom = filterCustomRecipes(cuisine);
    custom.forEach((recipe) => {
      grid.insertAdjacentHTML("beforeend", buildRecipeCardHtml(recipe));
    });
    if (countEl) {
      countEl.textContent = String(builtinCount + custom.length);
    }
    updateCuisineBadges();
  }

  function updateCuisineBadges() {
    document.querySelectorAll("[data-cuisine-count]").forEach((badge) => {
      const value = badge.dataset.cuisineCount;
      const base = parseInt(badge.dataset.baseCount || "0", 10);
      const extra = value === "all"
        ? getCustomRecipes().length
        : getCustomRecipes().filter((r) => (r.cuisine || "chinese") === value).length;
      badge.textContent = String(base + extra);
    });
  }

  renderCustom();
});
