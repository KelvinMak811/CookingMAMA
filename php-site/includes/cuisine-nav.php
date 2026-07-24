<?php
/** @var string $activeCuisine */

$query = $_GET;
unset($query['cuisine']); // cuisine is path/param per page

function cuisine_nav_href(array $item, array $query): string
{
    $href = (string) $item['href'];
    $qs = http_build_query($query);
    if ($qs === '') {
        return $href;
    }
    $sep = str_contains($href, '?') ? '&' : '?';
    return $href . $sep . $qs;
}
?>
<nav class="cuisine-nav-sticky border-bottom py-1 mb-0" aria-label="菜式類別">
  <div class="date-nav-scroll">
    <ul class="nav nav-pills flex-nowrap gap-1 mb-0">
      <?php foreach (cuisine_nav_items() as $item): ?>
        <?php $isActive = ($activeCuisine ?? 'all') === $item['value']; ?>
        <li class="nav-item">
          <a
            href="<?php echo h(cuisine_nav_href($item, $query)); ?>"
            class="nav-link cuisine-nav-btn rounded-2 d-flex align-items-center gap-1 <?php echo $isActive ? 'active' : ''; ?>"
          >
            <span class="cuisine-nav-btn-icon"><?php echo $item['icon']; ?></span>
            <span class="cuisine-nav-btn-label"><?php echo h($item['label']); ?></span>
            <span class="badge rounded-pill cuisine-nav-btn-count <?php echo $isActive ? 'bg-light text-primary' : 'bg-secondary-subtle text-secondary'; ?>" data-cuisine-count="<?php echo h($item['value']); ?>" data-base-count="<?php echo cuisine_count($item['value']); ?>">
              <?php echo cuisine_count($item['value']); ?>
            </span>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</nav>
