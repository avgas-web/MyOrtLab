<?php
/**
 * Template: Dashboard
 */

if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;

// Получение статистики
$total_orders = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}myortlab_orders WHERE status != 'done' AND status != 'cancelled'");
$completed_orders = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}myortlab_orders WHERE status = 'done'");
$overdue_orders = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}myortlab_orders WHERE due_date < CURDATE() AND status NOT IN ('done', 'cancelled')");
$total_revenue = $wpdb->get_var("SELECT SUM(price * qty) FROM {$wpdb->prefix}myortlab_positions p JOIN {$wpdb->prefix}myortlab_orders o ON p.order_id = o.id WHERE o.paid = 1");

// Получение заказов для канбан-доски
$orders = $wpdb->get_results("
    SELECT o.*, p.fio as patient_name
    FROM {$wpdb->prefix}myortlab_orders o
    LEFT JOIN {$wpdb->prefix}myortlab_patients p ON o.patient_id = p.id
    WHERE o.status NOT IN ('done', 'cancelled')
    ORDER BY o.created_at DESC
    LIMIT 50
", ARRAY_A);

// Группировка заказов по статусам
$orders_by_status = array();
foreach ($orders as $order) {
    $orders_by_status[$order['status']][] = $order;
}

$status_names = array(
    'quality' => 'Проверка файлов',
    'accept' => 'Принятие решения',
    'gypsum' => 'Гипсовка',
    'scanning' => 'Сканирование',
    'admin_pricing' => 'Ценообразование',
    'payment' => 'Оплата',
    'cadcam' => 'CAD/CAM',
    'approve' => 'Согласование',
    'production' => 'Производство',
    'delivery' => 'Доставка',
    'handover' => 'Сдача',
    'closing' => 'Закрытие'
);
?>

<div class="myortlab-frontend">
    <div class="myortlab-container">
        <!-- Заголовок -->
        <div class="myortlab-frontend-header">
            <h1>🦷 MyOrtLab</h1>
            <p>Система управления зуботехнической лабораторией</p>
        </div>
        
        <!-- KPI Карточки -->
        <div class="myortlab-kpi-grid">
            <div class="myortlab-kpi-card">
                <div class="myortlab-kpi-icon">📋</div>
                <div class="myortlab-kpi-value"><?php echo $total_orders; ?></div>
                <div class="myortlab-kpi-label">Заказов в работе</div>
            </div>
            
            <div class="myortlab-kpi-card">
                <div class="myortlab-kpi-icon">✅</div>
                <div class="myortlab-kpi-value"><?php echo $completed_orders; ?></div>
                <div class="myortlab-kpi-label">Выполнено</div>
            </div>
            
            <div class="myortlab-kpi-card">
                <div class="myortlab-kpi-icon">⏰</div>
                <div class="myortlab-kpi-value"><?php echo $overdue_orders; ?></div>
                <div class="myortlab-kpi-label">Просрочено</div>
            </div>
            
            <div class="myortlab-kpi-card">
                <div class="myortlab-kpi-icon">💰</div>
                <div class="myortlab-kpi-value"><?php echo number_format($total_revenue, 0, ',', ' '); ?> ₽</div>
                <div class="myortlab-kpi-label">Оплачено</div>
            </div>
        </div>
        
        <!-- Канбан-доска -->
        <div class="myortlab-frontend-card">
            <h2>📊 Конвейер заказов</h2>
            
            <div class="myortlab-kanban">
                <?php foreach ($status_names as $status => $name): ?>
                    <?php if (isset($orders_by_status[$status]) && count($orders_by_status[$status]) > 0): ?>
                        <div class="myortlab-kanban-column" data-status="<?php echo $status; ?>">
                            <h3>
                                <?php echo $name; ?>
                                <span class="count"><?php echo count($orders_by_status[$status]); ?></span>
                            </h3>
                            <div class="myortlab-kanban-cards">
                                <?php foreach ($orders_by_status[$status] as $order): ?>
                                    <div class="myortlab-kanban-card" 
                                         data-order-id="<?php echo $order['id']; ?>"
                                         data-modal="order-modal-<?php echo $order['id']; ?>"
                                         draggable="true">
                                        <div class="myortlab-kanban-card-title">
                                            <?php echo esc_html($order['num']); ?>
                                        </div>
                                        <div class="myortlab-kanban-card-meta">
                                            <?php echo esc_html($order['patient_name']); ?>
                                        </div>
                                        <div class="myortlab-kanban-card-badges">
                                            <?php if ($order['is_urgent']): ?>
                                                <span class="myortlab-badge myortlab-badge-urgent">Срочно</span>
                                            <?php endif; ?>
                                            <?php if ($order['corrections'] > 0): ?>
                                                <span class="myortlab-badge myortlab-badge-correction">К<?php echo $order['corrections']; ?></span>
                                            <?php endif; ?>
                                            <?php if ($order['has_physical_impressions']): ?>
                                                <span class="myortlab-badge myortlab-badge-impressions">Слепки</span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>
        
        <!-- Быстрые действия -->
        <div class="myortlab-frontend-card">
            <h2>⚡ Быстрые действия</h2>
            <div class="myortlab-grid myortlab-grid-3">
                <a href="#" class="myortlab-btn myortlab-btn-primary" data-modal="create-order-modal">
                    ➕ Создать заказ
                </a>
                <a href="#" class="myortlab-btn myortlab-btn-primary" data-modal="create-patient-modal">
                    👤 Добавить пациента
                </a>
                <a href="<?php echo admin_url('admin.php?page=myortlab-orders'); ?>" class="myortlab-btn myortlab-btn-outline">
                    📋 Все заказы
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Модальные окна для заказов -->
<?php foreach ($orders as $order): ?>
    <div id="order-modal-<?php echo $order['id']; ?>" class="myortlab-modal">
        <div class="myortlab-modal-content">
            <button class="myortlab-modal-close">&times;</button>
            <h2>Заказ <?php echo esc_html($order['num']); ?></h2>
            
            <div class="myortlab-tabs">
                <div class="myortlab-tab active" data-tab="info-<?php echo $order['id']; ?>">Информация</div>
                <div class="myortlab-tab" data-tab="actions-<?php echo $order['id']; ?>">Действия</div>
            </div>
            
            <div id="info-<?php echo $order['id']; ?>" class="myortlab-tab-content active">
                <ul class="myortlab-info-list">
                    <li>
                        <span class="myortlab-info-label">Пациент:</span>
                        <span class="myortlab-info-value"><?php echo esc_html($order['patient_name']); ?></span>
                    </li>
                    <li>
                        <span class="myortlab-info-label">Статус:</span>
                        <span class="myortlab-info-value">
                            <span class="myortlab-status myortlab-status-<?php echo $order['status']; ?>">
                                <?php echo $status_names[$order['status']]; ?>
                            </span>
                        </span>
                    </li>
                    <li>
                        <span class="myortlab-info-label">Срок сдачи:</span>
                        <span class="myortlab-info-value"><?php echo date('d.m.Y', strtotime($order['due_date'])); ?></span>
                    </li>
                    <li>
                        <span class="myortlab-info-label">Тип оплаты:</span>
                        <span class="myortlab-info-value">
                            <?php 
                            $payment_types = array(
                                'pre100' => 'Предоплата 100%',
                                'pre50' => 'Предоплата 50%',
                                'post100' => 'Постоплата',
                                'internal' => 'Внутренний',
                                'free' => 'Бесплатно'
                            );
                            echo $payment_types[$order['payment_type']] ?? $order['payment_type'];
                            ?>
                        </span>
                    </li>
                </ul>
            </div>
            
            <div id="actions-<?php echo $order['id']; ?>" class="myortlab-tab-content">
                <div class="myortlab-grid myortlab-grid-2">
                    <?php
                    // Определение доступных действий на основе статуса
                    $actions = array();
                    
                    if ($order['status'] === 'quality') {
                        $actions[] = array('status' => 'accept', 'label' => '✓ Принять файлы', 'class' => 'success');
                        $actions[] = array('status' => 'returned', 'label' => '↩ Вернуть', 'class' => 'danger');
                    }
                    
                    if ($order['status'] === 'accept') {
                        if ($order['has_physical_impressions']) {
                            $actions[] = array('status' => 'gypsum', 'label' => '→ Гипсовка', 'class' => 'primary');
                        } else {
                            $actions[] = array('status' => 'admin_pricing', 'label' => '→ Ценообразование', 'class' => 'primary');
                        }
                    }
                    
                    if ($order['status'] === 'cadcam') {
                        $actions[] = array('status' => 'approve', 'label' => '→ На согласование', 'class' => 'primary');
                    }
                    
                    if ($order['status'] === 'approve') {
                        $actions[] = array('status' => 'production', 'label' => '✓ Согласовать', 'class' => 'success');
                        $actions[] = array('status' => 'correction', 'label' => '↩ В доработку', 'class' => 'danger');
                    }
                    
                    foreach ($actions as $action):
                    ?>
                        <button class="myortlab-btn myortlab-btn-<?php echo $action['class']; ?>" 
                                data-action="update-status"
                                data-order-id="<?php echo $order['id']; ?>"
                                data-status="<?php echo $action['status']; ?>">
                            <?php echo $action['label']; ?>
                        </button>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
<?php endforeach; ?>

<!-- Модальное окно создания заказа -->
<div id="create-order-modal" class="myortlab-modal">
    <div class="myortlab-modal-content">
        <button class="myortlab-modal-close">&times;</button>
        <h2>Создать новый заказ</h2>
        
        <form class="myortlab-create-order-form" method="post">
            <input type="hidden" name="action" value="myortlab_create_order">
            <input type="hidden" name="nonce" value="<?php echo wp_create_nonce('myortlab_nonce'); ?>">
            
            <div class="myortlab-form-group">
                <label>Пациент *</label>
                <select name="patient_id" required>
                    <option value="">Выберите пациента</option>
                    <?php
                    $patients = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}myortlab_patients ORDER BY fio", ARRAY_A);
                    foreach ($patients as $patient):
                    ?>
                        <option value="<?php echo $patient['id']; ?>"><?php echo esc_html($patient['fio']); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="myortlab-form-group">
                <label>Категория *</label>
                <select name="category" required>
                    <option value="ЗТЛ">ЗТЛ</option>
                    <option value="Гнатология">Гнатология</option>
                    <option value="Ремонтные работы">Ремонтные работы</option>
                    <option value="Гарантия">Гарантия</option>
                </select>
            </div>
            
            <div class="myortlab-form-group">
                <label>Тип заказа *</label>
                <select name="type" required>
                    <option value="full">Полный</option>
                    <option value="cadcam_only">Только CAD/CAM</option>
                    <option value="phys_only">Только физическое</option>
                </select>
            </div>
            
            <div class="myortlab-form-group">
                <label>Срок сдачи *</label>
                <input type="date" name="due_date" required>
            </div>
            
            <div class="myortlab-form-group">
                <label>Время сдачи</label>
                <input type="time" name="due_time" value="10:00">
            </div>
            
            <div class="myortlab-form-group">
                <label>План лечения</label>
                <textarea name="plan" rows="4"></textarea>
            </div>
            
            <div class="myortlab-form-group">
                <label>
                    <input type="checkbox" name="has_physical_impressions" value="1">
                    Физические слепки отправлены
                </label>
            </div>
            
            <button type="submit" class="myortlab-btn myortlab-btn-primary">Создать заказ</button>
        </form>
    </div>
</div>

<!-- Модальное окно создания пациента -->
<div id="create-patient-modal" class="myortlab-modal">
    <div class="myortlab-modal-content">
        <button class="myortlab-modal-close">&times;</button>
        <h2>Добавить нового пациента</h2>
        
        <form class="myortlab-create-patient-form" method="post">
            <input type="hidden" name="action" value="myortlab_create_patient">
            <input type="hidden" name="nonce" value="<?php echo wp_create_nonce('myortlab_nonce'); ?>">
            
            <div class="myortlab-form-group">
                <label>ФИО *</label>
                <input type="text" name="fio" required>
            </div>
            
            <div class="myortlab-form-group">
                <label>Пол *</label>
                <select name="sex" required>
                    <option value="мужской">Мужской</option>
                    <option value="женский">Женский</option>
                </select>
            </div>
            
            <div class="myortlab-form-group">
                <label>Дата рождения</label>
                <input type="date" name="bd">
            </div>
            
            <div class="myortlab-form-group">
                <label>Клиника</label>
                <input type="text" name="clinic">
            </div>
            
            <button type="submit" class="myortlab-btn myortlab-btn-primary">Добавить пациента</button>
        </form>
    </div>
</div>
