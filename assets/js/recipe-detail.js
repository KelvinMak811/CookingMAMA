function initRecipeDetail(recipe) {
  let servings = recipe.baseServings || 2;
  let mealBatches = 1;
  let rating = 0;

  const servingsLabel = document.getElementById("servings-label");
  const batchesLabel = document.getElementById("batches-label");
  const factorBadge = document.getElementById("scale-factor-badge");
  const ingredientsHeading = document.getElementById("ingredients-heading");
  const ingredientsList = document.getElementById("ingredients-list");
  const planDate = document.getElementById("plan-date");
  const cookedDate = document.getElementById("cooked-date");

  const today = toDateInputValue();
  if (planDate) planDate.value = today;
  if (cookedDate) cookedDate.value = today;

  function renderIngredients() {
    const scaled = scaleIngredients(
      recipe.ingredients || [],
      recipe.baseServings || 2,
      servings,
      mealBatches
    );
    const factor = (servings / (recipe.baseServings || 2)) * mealBatches;
    if (factorBadge) {
      factorBadge.textContent = `材料 × ${Number.isInteger(factor) ? factor : factor.toFixed(1)}`;
    }
    if (servingsLabel) servingsLabel.textContent = `${servings} 人`;
    if (batchesLabel) batchesLabel.textContent = `${mealBatches} 餐`;
    if (ingredientsHeading) ingredientsHeading.textContent = `(${servings}人 × ${mealBatches}餐)`;
    if (!ingredientsList) return;
    ingredientsList.innerHTML = scaled
      .map(
        (ing) =>
          `<li class="list-group-item px-0 d-flex justify-content-between"><span>${escapeHtml(ing.name)}</span><span class="text-secondary">${escapeHtml(ing.amount || "")}</span></li>`
      )
      .join("");
  }

  document.querySelectorAll("[data-servings-delta]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.servingsDelta, 10);
      servings = Math.max(1, Math.min(12, servings + delta));
      renderIngredients();
    });
  });

  document.querySelectorAll("[data-batches-delta]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const delta = parseInt(btn.dataset.batchesDelta, 10);
      mealBatches = Math.max(1, Math.min(7, mealBatches + delta));
      renderIngredients();
    });
  });

  document.getElementById("add-to-shopping-btn")?.addEventListener("click", () => {
    const scaled = scaleIngredients(
      recipe.ingredients || [],
      recipe.baseServings || 2,
      servings,
      mealBatches
    );
    const items = getShoppingItems();
    let added = 0;
    scaled.forEach((ing) => {
      const exists = items.some(
        (item) =>
          !item.isBought &&
          item.ingredientName === ing.name &&
          item.amount === ing.amount &&
          item.recipeId === recipe.id
      );
      if (!exists) {
        items.unshift({
          id: generateId(),
          ingredientName: ing.name,
          amount: ing.amount || undefined,
          recipeId: recipe.id,
          recipeName: recipe.name,
          isBought: false,
          price: 0,
          addedAt: new Date().toISOString(),
        });
        added++;
      }
    });
    setShoppingItems(items);
    if (typeof trackEvent === "function") {
      trackEvent("shopping_add", {
        dish_id: recipe.id,
        dish_name: recipe.name,
        metadata: { items_added: added },
      });
    }
    alert(added > 0 ? `已加入 ${added} 項材料到買餸清單` : "材料已經喺清單入面");
  });

  document.getElementById("add-plan-btn")?.addEventListener("click", () => {
    const dateVal = planDate?.value;
    if (!dateVal) return;
    const plans = getMealPlans();
    const date = new Date(dateVal + "T12:00:00");
    const duplicate = plans.some(
      (p) => p.recipeId === recipe.id && isSameDay(p.plannedDate, date)
    );
    if (duplicate) {
      alert("呢個日子已經預定咗呢道菜");
      return;
    }
    plans.unshift({
      id: generateId(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      plannedDate: date.toISOString(),
      servings,
      mealBatches,
      createdAt: new Date().toISOString(),
    });
    setMealPlans(plans);
    if (typeof trackEvent === "function") {
      trackEvent("meal_plan_add", { dish_id: recipe.id, dish_name: recipe.name, metadata: { date: dateVal } });
    }
    alert("已加入煮食日程");
  });

  document.querySelectorAll(".speak-step-btn").forEach((btn) => {
    btn.addEventListener("click", () => speakText(btn.dataset.text || ""));
  });

  document.querySelectorAll(".rating-star").forEach((btn) => {
    btn.addEventListener("click", () => {
      rating = parseInt(btn.dataset.rating, 10);
      document.querySelectorAll(".rating-star").forEach((star, i) => {
        star.textContent = i < rating ? "★" : "☆";
        star.classList.toggle("active", i < rating);
      });
    });
  });

  document.getElementById("complete-cooking-btn")?.addEventListener("click", () => {
    const dateVal = cookedDate?.value || today;
    const records = getCookingRecords();
    records.unshift({
      id: generateId(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      cookedDate: new Date(dateVal + "T12:00:00").toISOString(),
      rating: rating || undefined,
    });
    setCookingRecords(records);
    if (typeof trackEvent === "function") {
      trackEvent("cooking_complete", { dish_id: recipe.id, dish_name: recipe.name, metadata: { rating: rating || null } });
    }
    alert("打卡成功！");
  });

  renderIngredients();
  if (typeof trackDishView === "function") {
    trackDishView(recipe);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const dataEl = document.getElementById("recipe-data");
  if (!dataEl) return;
  initRecipeDetail(JSON.parse(dataEl.textContent));
});
