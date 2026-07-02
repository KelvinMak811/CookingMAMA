<?php
require_once __DIR__ . '/includes/bootstrap.php';

$id = $_GET['id'] ?? '';
if ($id !== '' && str_starts_with($id, 'custom-')) {
    header('Location: ' . page_url('recipe-custom.php?id=' . rawurlencode($id)));
    exit;
}

$recipe = get_recipe_by_id($id);