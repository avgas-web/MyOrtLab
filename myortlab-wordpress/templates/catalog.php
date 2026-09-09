<?php
/**
 * Template: Catalog
 */

if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;

// Получение каталога услуг
$services = $wpdb->get_results("
    SELECT * FROM {$wpdb->prefix}myortlab_catalog
    WHERE hidden = 0
    ORDER BY cat, sub, name
", ARRAY_A);

// Группировка по категориям
$grouped = array();
foreach ($services as $service) {
    if (!isset($grouped[$service['cat']])) {
        $grouped[$service['cat']] = array();
    }
    if (!isset($grouped[$service['cat']][$service['sub']])) {
        $grouped[$service['cat']][$service['sub']] = array();
    }
    $grouped[$service['cat']][$service['sub']][] = $service;
}
?>

<div class="myortlab-frontend">
    <div class="myortlab-container">
        <div class="myortlab-frontend-header">
            <h1>📁 Каталог услуг</h1>
            <p>Справочник услуг лаборатории</p>
        </div>
        
        <!-- Поиск -->
        <div class="myortlab-frontend-card">
            <div class="myortlab-form-group">
                <label>Поиск услуги</label>
                <input type="text" id="catalog-search" placeholder="Начните вводить название...">
            </div>
        </div>
        
        <!-- Каталог -->
        <div id="catalog-content">
            <?php foreach ($grouped as $cat => $subs): ?>
                <div class="myortlab-frontend-card catalog-category" data-category="<?php echo esc_attr($cat); ?>">
                    <h2><?php echo esc_html($cat); ?></h2>
                    
                    <?php foreach ($subs as $sub => $items): ?>
                        <div class="catalog-subcategory" data-subcategory="<?php echo esc_attr($sub); ?>">
                            <h3 style="color: #6b7280; font-size: 16px; margin: 20px 0 10px 0;">
                                <?php echo esc_html($sub); ?>
                            </h3>
                            
                            <table class="myortlab-table">
                                <thead>
                                    <tr>
                                        <th>Наименование</th>
                                        <th>Цена</th>
                                        <th>Срок</th>
                                        <th>Путь</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($items as $service): ?>
                                        <tr>
                                            <td><?php echo esc_html($service['name']); ?></td>
                                            <td>
                                                <?php if ($service['price']): ?>
                                                    <?php echo number_format($service['price'], 0, ',', ' '); ?> ₽
                                                <?php else: ?>
                                                    <span style="color: #9ca3af;">По запросу</span>
                                                <?php endif; ?>
                                            </td>
                                            <td><?php echo esc_html($service['term']); ?></td>
                                            <td>
                                                <?php
                                                $route_labels = array(
                                                    'auto' => 'Авто',
                                                    'full' => 'Полный',
                                                    'cadcam_only' => 'CAD/CAM',
                                                    'phys_only' => 'Физика'
                                                );
                                                $route_colors = array(
                                                    'auto' => '#6b7280',
                                                    'full' => '#3b82f6',
                                                    'cadcam_only' => '#8b5cf6',
                                                    'phys_only' => '#10b981'
                                                );
                                                ?>
                                                <span style="background: <?php echo $route_colors[$service['route']]; ?>; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">
                                                    <?php echo $route_labels[$service['route']]; ?>
                                                </span>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endforeach; ?>
        </div>
        
        <?php if (empty($services)): ?>
            <div class="myortlab-frontend-card">
                <div class="myortlab-empty">
                    <div class="myortlab-empty-icon">📭</div>
                    <div class="myortlab-empty-text">Каталог пуст</div>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    $('#catalog-search').on('input', function() {
        var search = $(this).val().toLowerCase();
        
        if (!search) {
            $('.catalog-category, .catalog-subcategory, .myortlab-table tbody tr').show();
            return;
        }
        
        // Скрыть все
        $('.catalog-category, .catalog-subcategory').hide();
        $('.myortlab-table tbody tr').hide();
        
        // Показать совпадения
        $('.myortlab-table tbody tr').each(function() {
            var text = $(this).text().toLowerCase();
            if (text.indexOf(search) > -1) {
                $(this).show();
                $(this).closest('.catalog-subcategory').show();
                $(this).closest('.catalog-category').show();
            }
        });
    });
});
</script>
