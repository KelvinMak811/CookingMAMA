<?php
/** @var string $activeCuisine */
?>
<nav class="cuisine-nav-sticky border-bottom py-1 mb-0" aria-label="菜式類別">
  <div class="date-nav-scroll">
    <ul class="nav nav-pills flex-nowrap gap-2 mb-0">
      <?php foreach (cuisine_nav_items() as $item): ?>
        <?php $isActive = ($activeCuisine ?? 'all') === $item['value']; ?>
        <li class="nav-item">
          <a
            href="<?php echo h($item['href']); ?>"
            class="nav-link rounded-3 d-flex align-items-center gap-1 px-3 <?php echo $isActive ? 'active' : ''; ?>"
          >
            <span><?php echo $item['icon']; ?></span>
            <span><?php echo h($item['label']); ?></span>
            <span class="badge rounded-pill <?php echo $isActive ? 'bg-light text-primary' : 'bg-secondary-subtle text-secondary'; ?>">
              <?php echo cuisine_count($item['value']); ?>
            </span>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</nav>
