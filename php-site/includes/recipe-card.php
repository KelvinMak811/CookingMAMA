<?php
/** @var array $recipe */
?>
<div class="col">
  <a href="<?php echo h(recipe_url((string) $recipe['id'])); ?>" class="text-decoration-none text-dark h-100 d-block">
    <div class="card h-100 border-0 shadow-sm overflow-hidden">
      <div class="recipe-card-img">
        <img
          src="<?php echo h((string) $recipe['imageUrl']); ?>"
          alt="<?php echo h((string) $recipe['name']); ?>"
          class="object-fit-cover w-100 h-100"
          loading="lazy"
        >
      </div>
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <h6 class="card-title mb-0"><?php echo h((string) $recipe['name']); ?></h6>
          <span class="badge bg-light text-secondary fw-normal">
            <?php echo h(CUISINE_LABELS[$recipe['cuisine']] ?? ''); ?>
          </span>
        </div>
        <div class="d-flex justify-content-between align-items-center small text-secondary">
          <span class="text-warning"><?php echo render_difficulty((int) ($recipe['difficulty'] ?? 1)); ?></span>
          <span>⏱ <?php echo (int) ($recipe['prepTime'] ?? 0); ?> 分鐘</span>
        </div>
      </div>
    </div>
  </a>
</div>
