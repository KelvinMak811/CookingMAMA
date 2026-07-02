document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-recipe-form");
  if (!form) return;

  const params = new URLSearchParams(location.search);
  const editId = params.get("id");
  const ingredientsList = document.getElementById("ingredients-list-form");
  const stepsList = document.getElementById("steps-list-form");
  const pageTitle = document.getElementById("add-recipe-page-title");
  const submitBtn = document.getElementById("submit-recipe-btn");
  const deleteBtn = document.getElementById("delete-recipe-btn");

  let editingRecipe = null;
  if (editId) {
    editingRecipe = getCustomRecipeById(editId);
    if (!editingRecipe || !canEditCustomRecipe(editingRecipe)) {
      alert("你無權編輯呢個菜式");
      location.replace(addRecipePageUrl());
      return;
    }
    if (pageTitle) pageTitle.textContent = "編輯菜式";
    if (submitBtn) submitBtn.textContent = "儲存更改";
    if (deleteBtn) deleteBtn.classList.remove("d-none");
    fillForm(editingRecipe);
  }

  function addIngredientRow(name = "", amount = "") {
    const row = document.createElement("div");
    row.className = "ingredient-row row g-2 align-items-end mb-2";
    row.innerHTML = `
      <div class="col-5">
        <label class="form-label small text-secondary mb-1">材料名稱 <span class="text-danger">*</span></label>
        <input type="text" class="form-control ingredient-name" placeholder="例如：雞蛋" value="${escapeHtml(name)}" required>
      </div>
      <div class="col-5">
        <label class="form-label small text-secondary mb-1">份量</label>
        <input type="text" class="form-control ingredient-amount" placeholder="例如：2隻" value="${escapeHtml(amount)}">
      </div>
      <div class="col-2">
        <button type="button" class="btn btn-light w-100 remove-row-btn" aria-label="移除">✕</button>
      </div>`;
    row.querySelector(".remove-row-btn").addEventListener("click", () => {
      if (ingredientsList.querySelectorAll(".ingredient-row").length > 1) {
        row.remove();
      }
    });
    ingredientsList.appendChild(row);
  }

  function addStepRow(text = "") {
    const row = document.createElement("div");
    row.className = "step-row d-flex gap-2 mb-2";
    row.innerHTML = `
      <textarea class="form-control step-text" rows="2" placeholder="描述呢個步驟…">${escapeHtml(text)}</textarea>
      <button type="button" class="btn btn-light flex-shrink-0 remove-row-btn" aria-label="移除">✕</button>`;
    row.querySelector(".remove-row-btn").addEventListener("click", () => row.remove());
    stepsList.appendChild(row);
  }

  function fillForm(recipe) {
    form.querySelector('[name="name"]').value = recipe.name || "";
    form.querySelector('[name="cuisine"]').value = recipe.cuisine || "chinese";
    form.querySelector('[name="description"]').value = recipe.description || "";
    form.querySelector('[name="difficulty"]').value = String(recipe.difficulty || 1);
    form.querySelector('[name="prepTime"]').value = recipe.prepTime ? String(recipe.prepTime) : "";
    form.querySelector('[name="baseServings"]').value = String(recipe.baseServings || 2);
    form.querySelector('[name="imageUrl"]').value = recipe.imageUrl || "";
    ingredientsList.innerHTML = "";
    (recipe.ingredients || []).forEach((ing) => addIngredientRow(ing.name, ing.amount || ""));
    stepsList.innerHTML = "";
    (recipe.steps || []).forEach((step) => addStepRow(step));
    if (!recipe.steps || recipe.steps.length === 0) addStepRow();
  }

  document.getElementById("add-ingredient-btn")?.addEventListener("click", () => addIngredientRow());
  document.getElementById("add-step-btn")?.addEventListener("click", () => addStepRow());

  if (!editingRecipe) {
    addIngredientRow();
    addStepRow();
  }

  deleteBtn?.addEventListener("click", () => {
    if (!editingRecipe) return;
    if (!confirm(`確定要刪除「${editingRecipe.name}」？`)) return;
    if (deleteCustomRecipe(editingRecipe.id)) {
      const base = window.SMARTCOOK_BASE || "";
      location.replace(recipesCatalogUrl());
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      alert("請先揀選帳戶");
      location.replace(accountPageUrl());
      return;
    }

    const name = form.querySelector('[name="name"]').value.trim();
    if (!name) {
      alert("請輸入菜式名稱");
      return;
    }

    const ingredients = [];
    ingredientsList.querySelectorAll(".ingredient-row").forEach((row) => {
      const ingName = row.querySelector(".ingredient-name").value.trim();
      const amount = row.querySelector(".ingredient-amount").value.trim();
      if (ingName) {
        ingredients.push({
          id: generateId(),
          name: ingName,
          amount: amount || "適量",
        });
      }
    });

    if (ingredients.length === 0) {
      alert("請至少加入一項材料");
      return;
    }

    const steps = [];
    stepsList.querySelectorAll(".step-text").forEach((el) => {
      const text = el.value.trim();
      if (text) steps.push(text);
    });

    const cuisine = form.querySelector('[name="cuisine"]').value || "chinese";
    const description = form.querySelector('[name="description"]').value.trim();
    const difficulty = parseInt(form.querySelector('[name="difficulty"]').value, 10) || 1;
    const prepTimeRaw = form.querySelector('[name="prepTime"]').value.trim();
    const prepTime = prepTimeRaw ? parseInt(prepTimeRaw, 10) : 0;
    const baseServings = parseInt(form.querySelector('[name="baseServings"]').value, 10) || 2;
    const imageUrl = form.querySelector('[name="imageUrl"]').value.trim();

    const recipe = {
      id: editingRecipe ? editingRecipe.id : generateCustomRecipeId(),
      name,
      cuisine,
      baseServings: Math.max(1, Math.min(12, baseServings)),
      description,
      difficulty: Math.max(1, Math.min(5, difficulty)),
      prepTime: Math.max(0, prepTime),
      imageUrl: imageUrl || "",
      ingredients,
      steps,
      isCustom: true,
      createdBy: editingRecipe ? editingRecipe.createdBy : user.id,
      createdByName: editingRecipe ? editingRecipe.createdByName : user.name,
      createdAt: editingRecipe ? editingRecipe.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!upsertCustomRecipe(recipe)) {
      alert("儲存失敗，請重試");
      return;
    }

    alert(editingRecipe ? "菜式已更新" : "菜式已加入");
    location.replace(recipePageUrl(recipe.id));
  });
});
