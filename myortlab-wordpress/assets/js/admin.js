/**
 * MyOrtLab Admin JavaScript
 */

(function($) {
    'use strict';
    
    // Инициализация при загрузке DOM
    $(document).ready(function() {
        initMyOrtLab();
    });
    
    function initMyOrtLab() {
        // Инициализация модальных окон
        initModals();
        
        // Инициализация вкладок
        initTabs();
        
        // Инициализация форм
        initForms();
        
        // Инициализация таблиц
        initTables();
        
        // Инициализация канбан-доски
        initKanban();
    }
    
    // ==================== МОДАЛЬНЫЕ ОКНА ====================
    
    function initModals() {
        // Открытие модального окна
        $(document).on('click', '[data-modal]', function(e) {
            e.preventDefault();
            var modalId = $(this).data('modal');
            openModal(modalId);
        });
        
        // Закрытие модального окна
        $(document).on('click', '.myortlab-modal-close, .myortlab-modal', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Закрытие по Escape
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
    
    function openModal(modalId) {
        var $modal = $('#' + modalId);
        if ($modal.length) {
            $modal.addClass('active');
            $('body').css('overflow', 'hidden');
        }
    }
    
    function closeModal() {
        $('.myortlab-modal').removeClass('active');
        $('body').css('overflow', '');
    }
    
    // ==================== ВКЛАДКИ ====================
    
    function initTabs() {
        $(document).on('click', '.myortlab-tab', function() {
            var $tab = $(this);
            var tabId = $tab.data('tab');
            
            // Деактивация всех вкладок
            $tab.siblings().removeClass('active');
            
            // Активация выбранной вкладки
            $tab.addClass('active');
            
            // Скрытие всех контентов
            $tab.closest('.myortlab-card').find('.myortlab-tab-content').removeClass('active');
            
            // Показ выбранного контента
            $('#' + tabId).addClass('active');
        });
    }
    
    // ==================== ФОРМЫ ====================
    
    function initForms() {
        // Создание заказа
        $(document).on('submit', '#myortlab-create-order-form', function(e) {
            e.preventDefault();
            createOrder($(this));
        });
        
        // Создание пациента
        $(document).on('submit', '#myortlab-create-patient-form', function(e) {
            e.preventDefault();
            createPatient($(this));
        });
        
        // Создание услуги
        $(document).on('submit', '#myortlab-create-service-form', function(e) {
            e.preventDefault();
            createService($(this));
        });
        
        // Обновление статуса заказа
        $(document).on('click', '[data-action="update-status"]', function() {
            var orderId = $(this).data('order-id');
            var newStatus = $(this).data('status');
            var reason = prompt('Введите причину (если требуется):');
            
            if (reason !== null) {
                updateOrderStatus(orderId, newStatus, reason);
            }
        });
        
        // Назначение техника
        $(document).on('change', '[data-action="assign-technician"]', function() {
            var workItemId = $(this).data('work-item-id');
            var techId = $(this).val();
            assignTechnician(workItemId, techId);
        });
    }
    
    // ==================== ЗАКАЗЫ ====================
    
    function createOrder($form) {
        var data = $form.serialize();
        
        $.ajax({
            url: myortlab_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'myortlab_create_order',
                nonce: myortlab_ajax.nonce,
                data: data
            },
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Заказ успешно создан');
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    showAlert('error', 'Ошибка создания заказа');
                }
            },
            error: function() {
                showAlert('error', 'Ошибка сервера');
            }
        });
    }
    
    function updateOrderStatus(orderId, status, reason) {
        $.ajax({
            url: myortlab_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'myortlab_update_order_status',
                nonce: myortlab_ajax.nonce,
                order_id: orderId,
                status: status,
                reason: reason
            },
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Статус заказа обновлен');
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    showAlert('error', 'Ошибка обновления статуса');
                }
            },
            error: function() {
                showAlert('error', 'Ошибка сервера');
            }
        });
    }
    
    // ==================== ПАЦИЕНТЫ ====================
    
    function createPatient($form) {
        var data = $form.serialize();
        
        $.ajax({
            url: myortlab_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'myortlab_create_patient',
                nonce: myortlab_ajax.nonce,
                data: data
            },
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Пациент успешно создан');
                    closeModal();
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    showAlert('error', 'Ошибка создания пациента');
                }
            },
            error: function() {
                showAlert('error', 'Ошибка сервера');
            }
        });
    }
    
    // ==================== КАТАЛОГ ====================
    
    function createService($form) {
        var data = $form.serialize();
        
        $.ajax({
            url: myortlab_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'myortlab_create_service',
                nonce: myortlab_ajax.nonce,
                data: data
            },
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Услуга успешно создана');
                    closeModal();
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    showAlert('error', 'Ошибка создания услуги');
                }
            },
            error: function() {
                showAlert('error', 'Ошибка сервера');
            }
        });
    }
    
    // ==================== ТЕХНИКИ ====================
    
    function assignTechnician(workItemId, techId) {
        $.ajax({
            url: myortlab_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'myortlab_assign_technician',
                nonce: myortlab_ajax.nonce,
                work_item_id: workItemId,
                tech_id: techId
            },
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Техник назначен');
                } else {
                    showAlert('error', 'Ошибка назначения техника');
                }
            },
            error: function() {
                showAlert('error', 'Ошибка сервера');
            }
        });
    }
    
    // ==================== ТАБЛИЦЫ ====================
    
    function initTables() {
        // Сортировка таблиц
        $(document).on('click', '.myortlab-table th[data-sort]', function() {
            var $th = $(this);
            var column = $th.data('sort');
            var $table = $th.closest('table');
            var $tbody = $table.find('tbody');
            var $rows = $tbody.find('tr');
            
            // Определение направления сортировки
            var asc = !$th.hasClass('sort-asc');
            
            // Удаление классов сортировки
            $th.siblings().removeClass('sort-asc sort-desc');
            $th.addClass(asc ? 'sort-asc' : 'sort-desc');
            
            // Сортировка
            $rows.sort(function(a, b) {
                var aVal = $(a).find('[data-col="' + column + '"]').text();
                var bVal = $(b).find('[data-col="' + column + '"]').text();
                
                if (asc) {
                    return aVal.localeCompare(bVal);
                } else {
                    return bVal.localeCompare(aVal);
                }
            });
            
            $tbody.append($rows);
        });
        
        // Фильтрация таблиц
        $(document).on('input', '[data-table-filter]', function() {
            var filter = $(this).val().toLowerCase();
            var tableId = $(this).data('table-filter');
            var $rows = $('#' + tableId).find('tbody tr');
            
            $rows.each(function() {
                var text = $(this).text().toLowerCase();
                $(this).toggle(text.indexOf(filter) > -1);
            });
        });
    }
    
    // ==================== КАНБАН-ДОСКА ====================
    
    function initKanban() {
        // Перетаскивание карточек (базовая реализация)
        var draggedCard = null;
        
        $(document).on('dragstart', '.myortlab-kanban-card', function(e) {
            draggedCard = this;
            $(this).addClass('dragging');
        });
        
        $(document).on('dragend', '.myortlab-kanban-card', function(e) {
            $(this).removeClass('dragging');
            draggedCard = null;
        });
        
        $(document).on('dragover', '.myortlab-kanban-column', function(e) {
            e.preventDefault();
        });
        
        $(document).on('drop', '.myortlab-kanban-column', function(e) {
            e.preventDefault();
            if (draggedCard) {
                $(this).find('.myortlab-kanban-cards').append(draggedCard);
                
                // Здесь можно добавить AJAX запрос для обновления статуса
                var orderId = $(draggedCard).data('order-id');
                var newStatus = $(this).data('status');
                
                // updateOrderStatus(orderId, newStatus, '');
            }
        });
    }
    
    // ==================== УВЕДОМЛЕНИЯ ====================
    
    function showAlert(type, message) {
        var alertClass = 'myortlab-alert-' + type;
        var $alert = $('<div class="myortlab-alert ' + alertClass + '">' + message + '</div>');
        
        $('.myortlab-wrap').prepend($alert);
        
        setTimeout(function() {
            $alert.fadeOut(function() {
                $(this).remove();
            });
        }, 3000);
    }
    
    // ==================== УТИЛИТЫ ====================
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    function formatDate(dateString) {
        var date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
    
    function formatDateTime(dateString) {
        var date = new Date(dateString);
        return date.toLocaleString('ru-RU');
    }
    
    // Экспорт функций в глобальную область
    window.myortlab = {
        openModal: openModal,
        closeModal: closeModal,
        showAlert: showAlert,
        formatCurrency: formatCurrency,
        formatDate: formatDate,
        formatDateTime: formatDateTime
    };
    
})(jQuery);
