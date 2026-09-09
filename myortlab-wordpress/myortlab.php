<?php
/**
 * Plugin Name: MyOrtLab - Dental Lab Management System
 * Plugin URI: https://myortlab.com
 * Description: Полнофункциональная система управления зуботехнической лабораторией с конвейерной обработкой заказов, управлением материалами, пользователями и CRM-функциями
 * Version: 1.0.0
 * Author: MyOrtLab Team
 * Author URI: https://myortlab.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: myortlab
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Защита от прямого доступа
if (!defined('ABSPATH')) {
    exit;
}

// Константы плагина
define('MYORTLAB_VERSION', '1.0.0');
define('MYORTLAB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MYORTLAB_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MYORTLAB_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Главный класс плагина
 */
class MyOrtLab {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Хуки активации/деактивации
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Загрузка текстового домена
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        
        // Инициализация
        add_action('init', array($this, 'init'));
        
        // Подключение скриптов и стилей
        add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_scripts'));
        
        // Регистрация AJAX обработчиков
        $this->register_ajax_handlers();
        
        // Регистрация шорткодов
        add_shortcode('myortlab_dashboard', array($this, 'shortcode_dashboard'));
        add_shortcode('myortlab_orders', array($this, 'shortcode_orders'));
        add_shortcode('myortlab_catalog', array($this, 'shortcode_catalog'));
    }
    
    /**
     * Активация плагина
     */
    public function activate() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Таблица пользователей системы
        $table_users = $wpdb->prefix . 'myortlab_users';
        $sql_users = "CREATE TABLE $table_users (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            wp_user_id bigint(20) DEFAULT NULL,
            login varchar(100) NOT NULL,
            name varchar(255) NOT NULL,
            role varchar(50) NOT NULL,
            clinic varchar(255) DEFAULT '',
            email varchar(255) DEFAULT '',
            phone varchar(50) DEFAULT '',
            specialization varchar(255) DEFAULT '',
            mirror tinyint(1) DEFAULT 0,
            avatar_url text DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY login (login),
            KEY role (role)
        ) $charset_collate;";
        
        // Таблица пациентов
        $table_patients = $wpdb->prefix . 'myortlab_patients';
        $sql_patients = "CREATE TABLE $table_patients (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            fio varchar(255) NOT NULL,
            sex varchar(10) DEFAULT 'мужской',
            bd date DEFAULT NULL,
            clinic varchar(255) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY fio (fio)
        ) $charset_collate;";
        
        // Таблица связи пациентов и докторов
        $table_patient_doctors = $wpdb->prefix . 'myortlab_patient_doctors';
        $sql_patient_doctors = "CREATE TABLE $table_patient_doctors (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            patient_id bigint(20) NOT NULL,
            doctor_id bigint(20) NOT NULL,
            PRIMARY KEY (id),
            KEY patient_id (patient_id),
            KEY doctor_id (doctor_id)
        ) $charset_collate;";
        
        // Таблица каталога услуг
        $table_catalog = $wpdb->prefix . 'myortlab_catalog';
        $sql_catalog = "CREATE TABLE $table_catalog (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            cat varchar(100) NOT NULL,
            sub varchar(100) NOT NULL,
            name varchar(255) NOT NULL,
            price decimal(10,2) DEFAULT NULL,
            term varchar(100) DEFAULT '',
            term_days int(11) DEFAULT NULL,
            route varchar(50) DEFAULT 'auto',
            hidden tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY cat (cat),
            KEY sub (sub)
        ) $charset_collate;";
        
        // Таблица видов работ
        $table_work_types = $wpdb->prefix . 'myortlab_work_types';
        $sql_work_types = "CREATE TABLE $table_work_types (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            def_price decimal(10,2) DEFAULT 0,
            time_norm int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Таблица материалов
        $table_materials = $wpdb->prefix . 'myortlab_materials';
        $sql_materials = "CREATE TABLE $table_materials (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            unit varchar(50) DEFAULT 'шт',
            current_stock decimal(10,2) DEFAULT 0,
            cost_per_unit decimal(10,2) DEFAULT 0,
            min_stock decimal(10,2) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Таблица заказов
        $table_orders = $wpdb->prefix . 'myortlab_orders';
        $sql_orders = "CREATE TABLE $table_orders (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            num varchar(50) NOT NULL,
            patient_id bigint(20) NOT NULL,
            doctor_id bigint(20) NOT NULL,
            clinic varchar(255) DEFAULT '',
            category varchar(100) DEFAULT 'ЗТЛ',
            type varchar(50) DEFAULT 'full',
            notes_text text DEFAULT NULL,
            plan text DEFAULT NULL,
            due_date date DEFAULT NULL,
            due_time time DEFAULT NULL,
            term_days int(11) DEFAULT NULL,
            status varchar(50) DEFAULT 'quality',
            corrections int(11) DEFAULT 0,
            payment_type varchar(50) DEFAULT 'pre100',
            price_undefined tinyint(1) DEFAULT 0,
            paid tinyint(1) DEFAULT 0,
            free_approved tinyint(1) DEFAULT 0,
            address text DEFAULT NULL,
            sent tinyint(1) DEFAULT 0,
            received tinyint(1) DEFAULT 0,
            handed tinyint(1) DEFAULT 0,
            final_fixed tinyint(1) DEFAULT 0,
            prod_ready tinyint(1) DEFAULT 0,
            pay_recheck tinyint(1) DEFAULT 0,
            has_physical_impressions tinyint(1) DEFAULT 0,
            is_urgent tinyint(1) DEFAULT 0,
            priority tinyint(1) DEFAULT 0,
            return_reason text DEFAULT NULL,
            repair_order_num varchar(50) DEFAULT NULL,
            repair_description text DEFAULT NULL,
            guarantee_description text DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            accepted_at datetime DEFAULT NULL,
            completed_at datetime DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY num (num),
            KEY patient_id (patient_id),
            KEY doctor_id (doctor_id),
            KEY status (status),
            KEY due_date (due_date)
        ) $charset_collate;";
        
        // Таблица позиций заказа
        $table_positions = $wpdb->prefix . 'myortlab_positions';
        $sql_positions = "CREATE TABLE $table_positions (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            order_id bigint(20) NOT NULL,
            svc_id bigint(20) DEFAULT NULL,
            name varchar(255) NOT NULL,
            cat varchar(100) DEFAULT '',
            qty int(11) DEFAULT 1,
            price decimal(10,2) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY order_id (order_id),
            KEY svc_id (svc_id)
        ) $charset_collate;";
        
        // Таблица работ в позициях
        $table_work_items = $wpdb->prefix . 'myortlab_work_items';
        $sql_work_items = "CREATE TABLE $table_work_items (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            position_id bigint(20) NOT NULL,
            wt_id bigint(20) DEFAULT NULL,
            name varchar(255) NOT NULL,
            tech_id bigint(20) DEFAULT NULL,
            fee decimal(10,2) DEFAULT 0,
            done tinyint(1) DEFAULT 0,
            proddone tinyint(1) DEFAULT 0,
            doc_ok tinyint(1) DEFAULT 0,
            doc_ok_at datetime DEFAULT NULL,
            requires_doctor_approval tinyint(1) DEFAULT 0,
            assigned_at datetime DEFAULT CURRENT_TIMESTAMP,
            completed_at datetime DEFAULT NULL,
            PRIMARY KEY (id),
            KEY position_id (position_id),
            KEY tech_id (tech_id),
            KEY wt_id (wt_id)
        ) $charset_collate;";
        
        // Таблица файлов заказов
        $table_files = $wpdb->prefix . 'myortlab_files';
        $sql_files = "CREATE TABLE $table_files (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            order_id bigint(20) NOT NULL,
            name varchar(255) NOT NULL,
            size int(11) DEFAULT 0,
            type_cat varchar(50) DEFAULT 'other',
            file_url text DEFAULT NULL,
            uploaded_by bigint(20) DEFAULT NULL,
            uploaded_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY order_id (order_id)
        ) $charset_collate;";
        
        // Таблица комментариев
        $table_comments = $wpdb->prefix . 'myortlab_comments';
        $sql_comments = "CREATE TABLE $table_comments (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            order_id bigint(20) NOT NULL,
            user_id bigint(20) NOT NULL,
            role varchar(50) DEFAULT '',
            text text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY order_id (order_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        // Таблица истории
        $table_history = $wpdb->prefix . 'myortlab_history';
        $sql_history = "CREATE TABLE $table_history (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            order_id bigint(20) NOT NULL,
            user_id bigint(20) NOT NULL,
            text text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY order_id (order_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        // Таблица прихода материалов
        $table_stock_in = $wpdb->prefix . 'myortlab_stock_in';
        $sql_stock_in = "CREATE TABLE $table_stock_in (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            mat_id bigint(20) NOT NULL,
            qty decimal(10,2) DEFAULT 0,
            price decimal(10,2) DEFAULT 0,
            note text DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY mat_id (mat_id)
        ) $charset_collate;";
        
        // Таблица расхода материалов
        $table_material_usage = $wpdb->prefix . 'myortlab_material_usage';
        $sql_material_usage = "CREATE TABLE $table_material_usage (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            mat_id bigint(20) NOT NULL,
            qty decimal(10,2) DEFAULT 0,
            order_id bigint(20) DEFAULT NULL,
            work_item_id bigint(20) DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY mat_id (mat_id),
            KEY order_id (order_id)
        ) $charset_collate;";
        
        // Таблица новостей
        $table_news = $wpdb->prefix . 'myortlab_news';
        $sql_news = "CREATE TABLE $table_news (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            text text NOT NULL,
            image_url text DEFAULT NULL,
            video_url text DEFAULT NULL,
            author_id bigint(20) DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // Таблица настроек
        $table_settings = $wpdb->prefix . 'myortlab_settings';
        $sql_settings = "CREATE TABLE $table_settings (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            setting_key varchar(100) NOT NULL,
            setting_value text DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY setting_key (setting_key)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        dbDelta($sql_users);
        dbDelta($sql_patients);
        dbDelta($sql_patient_doctors);
        dbDelta($sql_catalog);
        dbDelta($sql_work_types);
        dbDelta($sql_materials);
        dbDelta($sql_orders);
        dbDelta($sql_positions);
        dbDelta($sql_work_items);
        dbDelta($sql_files);
        dbDelta($sql_comments);
        dbDelta($sql_history);
        dbDelta($sql_stock_in);
        dbDelta($sql_material_usage);
        dbDelta($sql_news);
        dbDelta($sql_settings);
        
        // Добавление демо-данных
        $this->insert_demo_data();
        
        // Создание ролей WordPress
        $this->create_roles();
        
        // Сохранение версии
        update_option('myortlab_version', MYORTLAB_VERSION);
    }
    
    /**
     * Деактивация плагина
     */
    public function deactivate() {
        // Очистка временных данных
        delete_transient('myortlab_cache');
    }
    
    /**
     * Загрузка текстового домена
     */
    public function load_textdomain() {
        load_plugin_textdomain('myortlab', false, dirname(MYORTLAB_PLUGIN_BASENAME) . '/languages');
    }
    
    /**
     * Инициализация
     */
    public function init() {
        // Регистрация пользовательских типов записей (если нужно)
        // Регистрация таксономий (если нужно)
    }
    
    /**
     * Подключение скриптов для админки
     */
    public function admin_scripts($hook) {
        // Подключаем только на страницах плагина
        if (strpos($hook, 'myortlab') === false) {
            return;
        }
        
        wp_enqueue_style('myortlab-admin', MYORTLAB_PLUGIN_URL . 'assets/css/admin.css', array(), MYORTLAB_VERSION);
        wp_enqueue_script('myortlab-admin', MYORTLAB_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), MYORTLAB_VERSION, true);
        
        wp_localize_script('myortlab-admin', 'myortlab_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('myortlab_nonce')
        ));
    }
    
    /**
     * Подключение скриптов для фронтенда
     */
    public function frontend_scripts() {
        wp_enqueue_style('myortlab-frontend', MYORTLAB_PLUGIN_URL . 'assets/css/frontend.css', array(), MYORTLAB_VERSION);
        wp_enqueue_script('myortlab-frontend', MYORTLAB_PLUGIN_URL . 'assets/js/frontend.js', array('jquery'), MYORTLAB_VERSION, true);
        
        wp_localize_script('myortlab-frontend', 'myortlab_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('myortlab_nonce')
        ));
    }
    
    /**
     * Регистрация AJAX обработчиков
     */
    private function register_ajax_handlers() {
        // Заказы
        add_action('wp_ajax_myortlab_get_orders', array($this, 'ajax_get_orders'));
        add_action('wp_ajax_myortlab_create_order', array($this, 'ajax_create_order'));
        add_action('wp_ajax_myortlab_update_order', array($this, 'ajax_update_order'));
        add_action('wp_ajax_myortlab_update_order_status', array($this, 'ajax_update_order_status'));
        
        // Пациенты
        add_action('wp_ajax_myortlab_get_patients', array($this, 'ajax_get_patients'));
        add_action('wp_ajax_myortlab_create_patient', array($this, 'ajax_create_patient'));
        
        // Каталог
        add_action('wp_ajax_myortlab_get_catalog', array($this, 'ajax_get_catalog'));
        add_action('wp_ajax_myortlab_create_service', array($this, 'ajax_create_service'));
        add_action('wp_ajax_myortlab_update_service', array($this, 'ajax_update_service'));
        
        // Виды работ
        add_action('wp_ajax_myortlab_get_work_types', array($this, 'ajax_get_work_types'));
        add_action('wp_ajax_myortlab_create_work_type', array($this, 'ajax_create_work_type'));
        
        // Материалы
        add_action('wp_ajax_myortlab_get_materials', array($this, 'ajax_get_materials'));
        add_action('wp_ajax_myortlab_add_stock', array($this, 'ajax_add_stock'));
        
        // Файлы
        add_action('wp_ajax_myortlab_upload_file', array($this, 'ajax_upload_file'));
        
        // Комментарии
        add_action('wp_ajax_myortlab_add_comment', array($this, 'ajax_add_comment'));
        
        // Назначение техников
        add_action('wp_ajax_myortlab_assign_technician', array($this, 'ajax_assign_technician'));
        
        // Настройки
        add_action('wp_ajax_myortlab_save_settings', array($this, 'ajax_save_settings'));
    }
    
    /**
     * Создание ролей WordPress
     */
    private function create_roles() {
        // Роль администратора лаборатории
        add_role('myortlab_admin', 'Администратор ЛК', array(
            'read' => true,
            'myortlab_manage_all' => true
        ));
        
        // Роль администратора ЗТЛ
        add_role('myortlab_admin_ztl', 'Администратор ЗТЛ', array(
            'read' => true,
            'myortlab_manage_orders' => true,
            'myortlab_manage_patients' => true
        ));
        
        // Роль доктора
        add_role('myortlab_doctor', 'Доктор', array(
            'read' => true,
            'myortlab_create_orders' => true,
            'myortlab_view_own_orders' => true
        ));
        
        // Роль техника
        add_role('myortlab_technician', 'Техник', array(
            'read' => true,
            'myortlab_view_assigned_orders' => true
        ));
        
        // Роль менеджера по качеству
        add_role('myortlab_quality', 'Менеджер по качеству', array(
            'read' => true,
            'myortlab_check_files' => true
        ));
    }
    
    /**
     * Вставка демо-данных
     */
    private function insert_demo_data() {
        global $wpdb;
        
        // Проверка, есть ли уже данные
        $count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}myortlab_users");
        if ($count > 0) {
            return;
        }
        
        // Демо-пользователи
        $demo_users = array(
            array('login' => 'admin', 'name' => 'Администратор', 'role' => 'admin', 'email' => 'admin@myortlab.com'),
            array('login' => 'ztl', 'name' => 'Админ ЗТЛ', 'role' => 'admin_ztl', 'email' => 'ztl@myortlab.com'),
            array('login' => 'doctor', 'name' => 'Доктор Иванов', 'role' => 'doctor', 'email' => 'doctor@myortlab.com', 'clinic' => 'Клиника 1'),
            array('login' => 'tech1', 'name' => 'Техник 1', 'role' => 'technician', 'email' => 'tech1@myortlab.com', 'specialization' => 'CAD/CAM'),
            array('login' => 'quality', 'name' => 'Менеджер качества', 'role' => 'quality', 'email' => 'quality@myortlab.com'),
        );
        
        foreach ($demo_users as $user) {
            $wpdb->insert(
                $wpdb->prefix . 'myortlab_users',
                $user
            );
        }
        
        // Демо-каталог услуг
        $demo_services = array(
            array('cat' => 'ЗТЛ', 'sub' => 'Ортопедия', 'name' => 'Коронка металлокерамическая', 'price' => 15000, 'term' => '14 дней', 'term_days' => 14),
            array('cat' => 'ЗТЛ', 'sub' => 'Ортопедия', 'name' => 'Винир керамический', 'price' => 20000, 'term' => '10 дней', 'term_days' => 10),
            array('cat' => 'Гнатология', 'sub' => 'Сплинты', 'name' => 'Сплинт релаксационный', 'price' => 8000, 'term' => '7 дней', 'term_days' => 7),
        );
        
        foreach ($demo_services as $service) {
            $wpdb->insert(
                $wpdb->prefix . 'myortlab_catalog',
                $service
            );
        }
        
        // Демо-виды работ
        $demo_work_types = array(
            array('name' => 'CAD-моделирование', 'def_price' => 3000, 'time_norm' => 120),
            array('name' => 'Фрезеровка', 'def_price' => 2500, 'time_norm' => 60),
            array('name' => 'Керамика', 'def_price' => 4000, 'time_norm' => 180),
        );
        
        foreach ($demo_work_types as $wt) {
            $wpdb->insert(
                $wpdb->prefix . 'myortlab_work_types',
                $wt
            );
        }
        
        // Демо-материалы
        $demo_materials = array(
            array('name' => 'Керамика Zirconia', 'unit' => 'шт', 'current_stock' => 50, 'cost_per_unit' => 1500, 'min_stock' => 10),
            array('name' => 'Металл CoCr', 'unit' => 'шт', 'current_stock' => 80, 'cost_per_unit' => 2000, 'min_stock' => 15),
        );
        
        foreach ($demo_materials as $mat) {
            $wpdb->insert(
                $wpdb->prefix . 'myortlab_materials',
                $mat
            );
        }
    }
    
    // ==================== AJAX ОБРАБОТЧИКИ ====================
    
    /**
     * Получить список заказов
     */
    public function ajax_get_orders() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $orders = $wpdb->get_results("
            SELECT o.*, p.fio as patient_name, u.name as doctor_name
            FROM {$wpdb->prefix}myortlab_orders o
            LEFT JOIN {$wpdb->prefix}myortlab_patients p ON o.patient_id = p.id
            LEFT JOIN {$wpdb->prefix}myortlab_users u ON o.doctor_id = u.id
            ORDER BY o.created_at DESC
        ", ARRAY_A);
        
        wp_send_json_success($orders);
    }
    
    /**
     * Создать заказ
     */
    public function ajax_create_order() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $data = $_POST;
        
        // Генерация номера заказа
        $num = 'GT-' . time();
        
        $wpdb->insert(
            $wpdb->prefix . 'myortlab_orders',
            array(
                'num' => $num,
                'patient_id' => $data['patient_id'],
                'doctor_id' => $data['doctor_id'],
                'clinic' => $data['clinic'],
                'category' => $data['category'],
                'type' => $data['type'],
                'plan' => $data['plan'],
                'due_date' => $data['due_date'],
                'due_time' => $data['due_time'],
                'term_days' => $data['term_days'],
                'status' => 'quality',
                'has_physical_impressions' => isset($data['has_physical_impressions']) ? 1 : 0,
            )
        );
        
        $order_id = $wpdb->insert_id;
        
        // Добавление позиций
        if (isset($data['positions']) && is_array($data['positions'])) {
            foreach ($data['positions'] as $pos) {
                $wpdb->insert(
                    $wpdb->prefix . 'myortlab_positions',
                    array(
                        'order_id' => $order_id,
                        'svc_id' => $pos['svc_id'],
                        'name' => $pos['name'],
                        'cat' => $pos['cat'],
                        'qty' => $pos['qty'],
                        'price' => $pos['price'],
                    )
                );
            }
        }
        
        wp_send_json_success(array('order_id' => $order_id, 'num' => $num));
    }
    
    /**
     * Обновить статус заказа
     */
    public function ajax_update_order_status() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $order_id = intval($_POST['order_id']);
        $new_status = sanitize_text_field($_POST['status']);
        $reason = sanitize_textarea_field($_POST['reason'] ?? '');
        
        $wpdb->update(
            $wpdb->prefix . 'myortlab_orders',
            array('status' => $new_status),
            array('id' => $order_id)
        );
        
        // Добавление в историю
        $wpdb->insert(
            $wpdb->prefix . 'myortlab_history',
            array(
                'order_id' => $order_id,
                'user_id' => get_current_user_id(),
                'text' => "Статус изменен на: $new_status" . ($reason ? ". Причина: $reason" : ''),
            )
        );
        
        wp_send_json_success();
    }
    
    /**
     * Получить список пациентов
     */
    public function ajax_get_patients() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $patients = $wpdb->get_results("
            SELECT * FROM {$wpdb->prefix}myortlab_patients
            ORDER BY fio ASC
        ", ARRAY_A);
        
        wp_send_json_success($patients);
    }
    
    /**
     * Создать пациента
     */
    public function ajax_create_patient() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $wpdb->insert(
            $wpdb->prefix . 'myortlab_patients',
            array(
                'fio' => sanitize_text_field($_POST['fio']),
                'sex' => sanitize_text_field($_POST['sex']),
                'bd' => sanitize_text_field($_POST['bd']),
                'clinic' => sanitize_text_field($_POST['clinic']),
            )
        );
        
        wp_send_json_success(array('patient_id' => $wpdb->insert_id));
    }
    
    /**
     * Получить каталог услуг
     */
    public function ajax_get_catalog() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $services = $wpdb->get_results("
            SELECT * FROM {$wpdb->prefix}myortlab_catalog
            WHERE hidden = 0
            ORDER BY cat, sub, name ASC
        ", ARRAY_A);
        
        wp_send_json_success($services);
    }
    
    /**
     * Создать услугу
     */
    public function ajax_create_service() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $wpdb->insert(
            $wpdb->prefix . 'myortlab_catalog',
            array(
                'cat' => sanitize_text_field($_POST['cat']),
                'sub' => sanitize_text_field($_POST['sub']),
                'name' => sanitize_text_field($_POST['name']),
                'price' => floatval($_POST['price']),
                'term' => sanitize_text_field($_POST['term']),
                'term_days' => intval($_POST['term_days']),
                'route' => sanitize_text_field($_POST['route'] ?? 'auto'),
            )
        );
        
        wp_send_json_success(array('service_id' => $wpdb->insert_id));
    }
    
    /**
     * Получить виды работ
     */
    public function ajax_get_work_types() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $work_types = $wpdb->get_results("
            SELECT * FROM {$wpdb->prefix}myortlab_work_types
            ORDER BY name ASC
        ", ARRAY_A);
        
        wp_send_json_success($work_types);
    }
    
    /**
     * Получить материалы
     */
    public function ajax_get_materials() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $materials = $wpdb->get_results("
            SELECT * FROM {$wpdb->prefix}myortlab_materials
            ORDER BY name ASC
        ", ARRAY_A);
        
        wp_send_json_success($materials);
    }
    
    /**
     * Назначить техника
     */
    public function ajax_assign_technician() {
        check_ajax_referer('myortlab_nonce', 'nonce');
        
        global $wpdb;
        
        $work_item_id = intval($_POST['work_item_id']);
        $tech_id = intval($_POST['tech_id']);
        
        $wpdb->update(
            $wpdb->prefix . 'myortlab_work_items',
            array('tech_id' => $tech_id),
            array('id' => $work_item_id)
        );
        
        wp_send_json_success();
    }
    
    // ==================== ШОРТКОДЫ ====================
    
    /**
     * Шорткод дашборда
     */
    public function shortcode_dashboard($atts) {
        ob_start();
        include MYORTLAB_PLUGIN_DIR . 'templates/dashboard.php';
        return ob_get_clean();
    }
    
    /**
     * Шорткод списка заказов
     */
    public function shortcode_orders($atts) {
        ob_start();
        include MYORTLAB_PLUGIN_DIR . 'templates/orders.php';
        return ob_get_clean();
    }
    
    /**
     * Шорткод каталога
     */
    public function shortcode_catalog($atts) {
        ob_start();
        include MYORTLAB_PLUGIN_DIR . 'templates/catalog.php';
        return ob_get_clean();
    }
}

// Инициализация плагина
function myortlab_init() {
    return MyOrtLab::get_instance();
}

// Запуск плагина
myortlab_init();
