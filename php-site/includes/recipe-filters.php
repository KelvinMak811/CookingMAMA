<?php
/** Ingredient filter chips — mirrors Next.js RecipeFilterChips */
?>
<div class="recipe-filter-bar" id="recipe-ingredient-filters" aria-label="材料篩選">
  <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
    <span class="small text-secondary">材料篩選</span>
    <button type="button" class="btn btn-link btn-sm text-decoration-none p-0 text-secondary d-none" id="recipe-filter-clear">
      清除篩選
    </button>
  </div>
  <div class="recipe-filter-row">
    <span class="recipe-filter-row-label">肉／蛋白</span>
    <div class="recipe-filter-chips" role="group" aria-label="肉／蛋白" data-filter-group="meat">
      <button type="button" class="recipe-filter-chip" data-filter-meat="pork" aria-pressed="false">豬肉</button>
      <button type="button" class="recipe-filter-chip" data-filter-meat="beef" aria-pressed="false">牛肉</button>
      <button type="button" class="recipe-filter-chip" data-filter-meat="chicken" aria-pressed="false">雞肉</button>
      <button type="button" class="recipe-filter-chip" data-filter-meat="seafood" aria-pressed="false">海鮮</button>
      <button type="button" class="recipe-filter-chip" data-filter-meat="egg" aria-pressed="false">蛋</button>
      <button type="button" class="recipe-filter-chip" data-filter-meat="tofu_veg" aria-pressed="false">豆腐／素</button>
    </div>
  </div>
  <div class="recipe-filter-row">
    <span class="recipe-filter-row-label">蔬菜</span>
    <div class="recipe-filter-chips" role="group" aria-label="蔬菜" data-filter-group="veg">
      <button type="button" class="recipe-filter-chip" data-filter-veg="choy_sum" aria-pressed="false">菜心</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="water_spinach" aria-pressed="false">通菜</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="tomato" aria-pressed="false">番茄</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="onion" aria-pressed="false">洋蔥</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="eggplant" aria-pressed="false">茄子</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="broccoli" aria-pressed="false">西蘭花</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="carrot" aria-pressed="false">甘筍</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="potato" aria-pressed="false">薯仔</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="mushroom" aria-pressed="false">菇菌</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="pepper" aria-pressed="false">椒類</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="gai_lan" aria-pressed="false">芥蘭</button>
      <button type="button" class="recipe-filter-chip" data-filter-veg="bitter_melon" aria-pressed="false">涼瓜</button>
    </div>
  </div>
</div>
