<?php
/**
 * Template: Orders List
 */

if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;

// Получение всех заказов
$orders = $wpdb->get_results("
    SELECT o.*, p.fio as patient_name, u.name as doctor_name
    FROM {$wpdb->prefix}myortlab_orders o
    LEFT JOIN {$wpdb->prefix}myortlab_patients p ON o.patient_id = p.id
    LEFT JOIN {$wpdb->prefix}myortlab_users u ON o.doctor_id = u.id
    ORDER BY o.created_at DESC
", ARRAY_A);

$status_names = array(
    'quality' => 'Проверка файлов',
    'returned' => 'Возврат',
    'accept' => 'Принятие решения',
    'gypsum' => 'Гипсовка',
    'scanning' => 'Сканирование',
    'admin_pricing' => 'Ценообразование',
    'payment' => 'Оплата',
    'cadcam' => 'CAD/CAM',
    'approve' => 'Согласование',
    'correction' => 'Коррекция',
    'production' => 'Производство',
    'delivery' => 'Доставка',
    'handover' => 'Сдача',
    'closing' => 'Закрытие',
    'done' => 'Выполнено',
    'cancelled' => 'Отменён'
);
?>

<div class="myortlab-frontend">
    <div class="myortlab-container">
        <div class="myortlab-frontend-header">
            <h1>📋 Заказы</h1>
            <p>Управление заказами лаборатории</p>
        </div>
        
        <!-- Фильтры -->
        <div class="myortlab-frontend-card">
            <div class="myortlab-grid myortlab-grid-3">
                <div class="myortlab-form-group">
                    <label>Поиск</label>
                    <input type="text" id="orders-search" placeholder="Поиск по номеру, пациенту...">
                </div>
                
                <div class="myortlab-form-group">
                    <label>Статус</label>
                    <select id="orders-status-filter">
                        <option value="">Все статусы</option>
                        <?php foreach ($status_names as $key => $name): ?>
                            <option value="<?php echo $key; ?>"><?php echo $name; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="myortlab-form-group">
                    <label>&nbsp;</label>
                    <button class="myortlab-btn myortlab-btn-primary" data-modal="create-order-modal">
                        ➕ Создать заказ
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Таблица заказов -->
        <div class="myortlab-frontend-card">
            <table class="myortlab-table" id="orders-table">
                <thead>
                    <tr>
                        <th data-sort="num">№</th>
                        <th data-sort="patient">Пациент</th>
                        <th data-sort="doctor">Доктор</th>
                        <th data-sort="status">Статус</th>
                        <th data-sort="due_date">Срок сдачи</th>
                        <th data-sort="total">Сумма</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orders as $order): 
                        // Расчет суммы заказа
                        $total = $wpdb->get_var($wpdb->prepare("
                            SELECT SUM(price * qty) 
                            FROM {$wpdb->prefix}myortlab_positions 
                            WHERE order_id = %d
                        ", $order['id']));
                    ?>
                        <tr>
                            <td data-col="num">
                                <strong><?php echo esc_html($order['num']); ?></strong>
                            </td>
                            <td data-col="patient"><?php echo esc_html($order['patient_name']); ?></td>
                            <td data-col="doctor"><?php echo esc_html($order['doctor_name']); ?></td>
                            <td data-col="status">
                                <span class="myortlab-status myortlab-status-<?php echo $order['status']; ?>">
                                    <?php echo $status_names[$order['status']]; ?>
                                </span>
                            </td>
                            <td data-col="due_date">
                                <?php echo date('d.m.Y', strtotime($order['due_date'])); ?>
                                <?php if ($order['due_date'] < date('Y-m-d') && !in_array($order['status'], array('done', 'cancelled'))): ?>
                                    <span class="myortlab-badge myortlab-badge-urgent">Просрочен</span>
                                <?php endif; ?>
                            </td>
                            <td data-col="total">
                                <?php echo number_format($total, 0, ',', ' '); ?> ₽
                            </td>
                            <td>
                                <button class="myortlab-btn myortlab-btn-outline" 
                                        data-modal="order-modal-<?php echo $order['id']; ?>">
                                    Открыть
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <?php if (empty($orders)): ?>
                <div class="myortlab-empty">
                    <div class="myortlab-empty-icon">📭</div>
                    <div class="myortlab-empty-text">Заказов пока нет</div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Фильтрация по поиску
    $('#orders-search').on('input', function() {
        var search = $(this).val().toLowerCase();
        $('#orders-table tbody tr').each(function() {
            var text = $(this).text().toLowerCase();
            $(this).toggle(text.indexOf(search) > -1);
        });
    });
    
    // Фильтрация по статусу
    $('#orders-status-filter').on('change', function() {
        var status = $(this).val();
        $('#orders-table tbody tr').each(function() {
            if (!status) {
                $(this).show();
            } else {
                var rowStatus = $(this).find('.myortlab-status').attr('class').split(' ').pop().replace('myortlab-status-', '');
                $(this).toggle(rowStatus === status);
            }
        });
    });
});
</script>
