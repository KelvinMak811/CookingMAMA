<?php
/** @var array $recipe */
$cuisineLabel = CUISINE_LABELS[$recipe['cuisine'] ?? ''] ?? '';
$isCustom = !empty($recipe['isCustom']);
$ingredientNames = array_map(
    static fn($ing): string => (string) ($ing['name'] ?? ''),
    is_array($recipe['ingredients'] ?? null) ? $recipe['ingredients'] : []
);
$haystack = trim((string) ($recipe['name'] ?? '') . ' ' . implode(' ', $ingredientNames));
?>
<div
  class="col"
  data-recipe-card
  data-recipe-id="<?php echo h((string) $recipe['id']); ?>"
  data-haystack="<?php echo h($haystack); ?>"
>
  <a href="<?php echo h(recipe_url((string) $recipe['id'])); ?>" class="text-decoration-none text-dark h-100 d-block">
    <div class="recipe-pick-card h-100 <?php echo $isCustom ? 'recipe-pick-card--custom' : ''; ?>">
      <div class="d-flex justify-content-between align-items-start gap-1 mb-1">
        <h6 class="recipe-pick-title mb-0"><?php echo h((string) $recipe['name']); ?></h6>
        <span class="badge bg-light text-secondary fw-normal flex-shrink-0"><?php echo h($cuisineLabel); ?></span>
      </div>
      <div class="d-flex justify-content-between align-items-center recipe-pick-meta">
        <span class="text-warning"><?php echo render_difficulty((int) ($recipe['difficulty'] ?? 1)); ?></span>
        <span>⏱ <?php echo (int) ($recipe['prepTime'] ?? 0); ?>分</span>
      </div>
      <?php if ($isCustom): ?>
        <div class="mt-1">
          <span class="badge bg-primary-subtle text-primary fw-normal">自訂</span>
        </div>
      <?php endif; ?>
    </div>
  </a>
</div>
