# MyOrtLab WordPress Plugin - Краткое руководство

## 🚀 Быстрый старт

### Установка

1. Скопируйте папку `myortlab-wordpress` в `wp-content/plugins/`
2. Активируйте плагин в админке WordPress
3. Используйте шорткоды на страницах:
   - `[myortlab_dashboard]` - дашборд
   - `[myortlab_orders]` - список заказов
   - `[myortlab_catalog]` - каталог услуг

### Демо-аккаунты

После активации доступны:
- **admin** - Администратор ЛК
- **ztl** - Администратор ЗТЛ
- **doctor** - Доктор
- **tech1** - Техник
- **quality** - Менеджер качества

## 📋 Основные функции

### Управление заказами
- Создание заказов с автоматическим определением типа
- Конвейерная обработка с 16 статусами
- Назначение техников на работы
- Согласование работ доктором
- Коррекции с указанием причины

### Управление материалами
- Учёт остатков
- Автоматическое списание при выполнении работ
- Предупреждения о минимальном остатке

### Каталог услуг
- Группировка по категориям
- Выбор пути выполнения (авто/полный/CAD-CAM/физический)
- Расход материалов для каждой услуги

## 🔧 Структура плагина

```
myortlab-wordpress/
├── myortlab.php           # Основной файл
├── assets/
│   ├── css/
│   │   ├── admin.css      # Стили админки
│   │   └── frontend.css   # Стили фронтенда
│   └── js/
│       ├── admin.js       # JS админки
│       └── frontend.js    # JS фронтенда
├── templates/
│   ├── dashboard.php      # Дашборд
│   ├── orders.php         # Список заказов
│   └── catalog.php        # Каталог
└── README.md              # Документация
```

## 📊 База данных

При активации создаются таблицы:
- `wp_myortlab_users` - пользователи
- `wp_myortlab_patients` - пациенты
- `wp_myortlab_catalog` - каталог услуг
- `wp_myortlab_orders` - заказы
- `wp_myortlab_positions` - позиции заказов
- `wp_myortlab_work_items` - работы
- `wp_myortlab_materials` - материалы
- И другие...

## 🎨 Кастомизация

### Переопределение стилей
Добавьте в CSS вашей темы:
```css
.myortlab-kpi-value {
    color: #your-color !important;
}
```

### Кастомизация шаблонов
Скопируйте шаблоны в тему:
```
your-theme/myortlab/dashboard.php
your-theme/myortlab/orders.php
your-theme/myortlab/catalog.php
```

## 🔌 AJAX API

Примеры вызовов:

```javascript
// Получить заказы
jQuery.ajax({
    url: ajaxurl,
    type: 'POST',
    data: {
        action: 'myortlab_get_orders',
        nonce: myortlab_ajax.nonce
    }
});

// Создать заказ
jQuery.ajax({
    url: ajaxurl,
    type: 'POST',
    data: {
        action: 'myortlab_create_order',
        nonce: myortlab_ajax.nonce,
        patient_id: 1,
        doctor_id: 2,
        // ... другие параметры
    }
});
```

## ⚠️ Ограничения

- Нет реальной системы уведомлений
- Нет интеграции с AI-сервисом
- Только русский язык интерфейса

## 📄 Лицензия

GPL v2 or later

---

**Версия:** 1.0.0  
**Дата:** 2026-01-10
