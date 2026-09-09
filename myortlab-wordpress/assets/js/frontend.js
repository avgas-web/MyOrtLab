/**
 * MyOrtLab Frontend JavaScript
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        initFrontend();
    });
    
    function initFrontend() {
        initModals();
        initTabs();
        initForms();
        initKanban();
    }
    
    // ==================== МОДАЛЬНЫЕ ОКНА ====================
    
    function initModals() {
        $(document).on('click', '[data-modal]', function(e) {
            e.preventDefault();
            var modalId = $(this).data('modal');
            openModal(modalId);
        });
        
        $(document).on('click', '.myortlab-modal-close, .myortlab-modal', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
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
            
            $tab.siblings().removeClass('active');
            $tab.addClass('active');
            
            $tab.closest('.myortlab-frontend-card').find('.myortlab-tab-content').removeClass('active');
            $('#' + tabId).addClass('active');
        });
    }
    
    // ==================== ФОРМЫ ====================
    
    function initForms() {
        // Создание заказа
        $(document).on('submit', '.myortlab-create-order-form', function(e) {
            e.preventDefault();
            createOrder($(this));
        });
        
        // Создание пациента
        $(document).on('submit', '.myortlab-create-patient-form', function(e) {
            e.preventDefault();
            createPatient($(this));
        });
        
        // Обновление статуса
        $(document).on('click', '[data-action="update-status"]', function() {
            var orderId = $(this).data('order-id');
            var newStatus = $(this).data('status');
            var reason = prompt('Введите причину (если требуется):');
            
            if (reason !== null) {
                updateOrderStatus(orderId, newStatus, reason);
            }
        });
    }
    
    // ==================== ЗАКАЗЫ ====================
    
    function createOrder($form) {
        var formData = new FormData($form[0]);
        
        $.ajax({
            url: myortlab_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Заказ успешно создан');
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    showAlert('error', response.data || 'Ошибка создания заказа');
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
            }
        });
    }
    
    // ==================== ПАЦИЕНТЫ ====================
    
    function createPatient($form) {
        var formData = new FormData($form[0]);
        
        $.ajax({
            url: myortlab_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    showAlert('success', 'Пациент успешно создан');
                    closeModal();
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                } else {
                    showAlert('error', response.data || 'Ошибка создания пациента');
                }
            }
        });
    }
    
    // ==================== КАНБАН-ДОСКА ====================
    
    function initKanban() {
        var draggedCard = null;
        
        $(document).on('dragstart', '.myortlab-kanban-card', function() {
            draggedCard = this;
            $(this).addClass('dragging');
        });
        
        $(document).on('dragend', '.myortlab-kanban-card', function() {
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
            }
        });
    }
    
    // ==================== УВЕДОМЛЕНИЯ ====================
    
    function showAlert(type, message) {
        var alertClass = 'myortlab-alert-' + type;
        var $alert = $('<div class="myortlab-alert ' + alertClass + '">' + message + '</div>');
        
        $('.myortlab-frontend').prepend($alert);
        
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
    
    // Экспорт
    window.myortlab = {
        openModal: openModal,
        closeModal: closeModal,
        showAlert: showAlert,
        formatCurrency: formatCurrency,
        formatDate: formatDate
    };
    
})(jQuery);
