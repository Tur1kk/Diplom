/**
 * Orders Management
 */

// Загружаем заказы при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Страница заказов загружена');
    fetchOrders();
});

/**
 * Получение списка заказов с сервера
 */
function fetchOrders() {
    const container = document.getElementById('ordersContainer');
    
    if (!container) {
        console.error('❌ Контейнер ordersContainer не найден');
        return;
    }
    
    console.log('🔄 Загрузка заказов...');
    
    container.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            <p class="mt-2 text-muted">Загрузка заказов...</p>
        </div>
    `;
    
    fetch('/api/orders')
        .then(response => {
            console.log('📡 Ответ получен, статус:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }
            return response.json();
        })
        .then(orders => {
            console.log('📊 Получено заказов:', orders.length);
            renderOrders(orders);
        })
        .catch(error => {
            console.error('❌ Ошибка загрузки:', error);
            container.innerHTML = `
                <div class="empty-orders">
                    <i class="fa-solid fa-triangle-exclamation text-danger"></i>
                    <h3>Ошибка загрузки</h3>
                    <p class="text-muted">${error.message}</p>
                    <button class="btn btn-warning mt-2" onclick="fetchOrders()">
                        <i class="fa-solid fa-rotate"></i> Попробовать снова
                    </button>
                </div>
            `;
        });
}

/**
 * Обновление статуса заказа
 */
function updateOrderStatus(orderId, status) {
    if (!confirm(`Вы уверены, что хотите ${status === 'cancelled' ? 'отменить' : 'подтвердить'} заказ #${orderId}?`)) {
        return;
    }
    
    fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: status })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification(`Заказ #${orderId} ${status === 'cancelled' ? 'отменён' : 'подтверждён'}!`, 'success');
            fetchOrders(); // Обновляем список
        } else {
            showNotification(data.error || 'Ошибка обновления статуса', 'danger');
        }
    })
    .catch(error => {
        console.error('❌ Ошибка:', error);
        showNotification('Ошибка соединения с сервером', 'danger');
    });
}

/**
 * Отрисовка таблицы с заказами
 */
function renderOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    console.log('🎨 Начинаем отрисовку...');
    
    if (!container) {
        console.error('❌ Контейнер не найден!');
        return;
    }
    
    if (!Array.isArray(orders)) {
        console.error('❌ orders не является массивом:', orders);
        orders = [];
    }
    
    if (orders.length === 0) {
        console.log('📭 Заказов нет, показываем пустое состояние');
        container.innerHTML = `
            <div class="empty-orders">
                <i class="fa-solid fa-box-open"></i>
                <h3>Заказов пока нет</h3>
                <p class="text-muted">Первый заказ будет отображаться здесь</p>
                <a href="/" class="btn btn-warning">
                    <i class="fa-solid fa-shopping-bag"></i> Перейти к покупкам
                </a>
            </div>
        `;
        return;
    }
    
    console.log('📝 Строим таблицу для', orders.length, 'заказов');
    
    let tableHtml = `
        <div class="orders-table-wrap">
            <div class="orders-table-scroll">
                <table class="orders-table table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>ФИО</th>
                            <th>Телефон</th>
                            <th>Email</th>
                            <th>Адрес</th>
                            <th>Товары</th>
                            <th>Сумма</th>
                            <th class="text-center">Статус</th>
                            <th class="text-center">Согласие</th>
                            <th>Дата</th>
                            <th class="text-center">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    orders.forEach((order, index) => {
        // Статус заказа (по умолчанию 'new')
        const status = order.status || 'new';
        let statusHtml = '';
        let actionsHtml = '';
        
        switch(status) {
            case 'new':
                statusHtml = `<span class="status-badge status-new"><i class="fa-regular fa-clock"></i> Новый</span>`;
                actionsHtml = `
                    <button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id}, 'confirmed')">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;
                break;
            case 'confirmed':
                statusHtml = `<span class="status-badge status-confirmed"><i class="fa-solid fa-check-circle"></i> Подтверждён</span>`;
                actionsHtml = `
                    <button class="btn btn-sm btn-danger" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                        <i class="fa-solid fa-xmark"></i> Отменить
                    </button>
                `;
                break;
            case 'cancelled':
                statusHtml = `<span class="status-badge status-cancelled"><i class="fa-solid fa-circle-xmark"></i> Отменён</span>`;
                actionsHtml = `
                    <span class="text-muted small">Без действий</span>
                `;
                break;
            default:
                statusHtml = `<span class="status-badge status-new"><i class="fa-regular fa-clock"></i> Новый</span>`;
                actionsHtml = `
                    <button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id}, 'confirmed')">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;
        }
        
        // Форматируем дату
        let formattedDate = 'Нет даты';
        if (order.created_at) {
            try {
                const date = new Date(order.created_at);
                formattedDate = date.toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                console.warn('⚠️ Ошибка форматирования даты:', e);
            }
        }
        
        // Согласие
        const consentHtml = order.consent == 1 
            ? `<span class="consent-badge yes"><i class="fa-solid fa-check-circle"></i> Да</span>`
            : `<span class="consent-badge no"><i class="fa-solid fa-times-circle"></i> Нет</span>`;
        
        // Товары (в колонку)
        let itemsHtml = '';
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            itemsHtml = `<ul class="order-items-list">`;
            order.items.forEach(item => {
                itemsHtml += `
                    <li class="order-item">
                        <span class="item-name">${escapeHtml(item.name)}</span>
                        <span class="item-qty">× ${item.quantity}</span>
                        <span class="item-price">${Number(item.price).toLocaleString()} ₽</span>
                    </li>
                `;
            });
            itemsHtml += `</ul>`;
        } else {
            itemsHtml = '<span class="text-muted">Нет товаров</span>';
        }
        
        // Сумма
        const total = order.total || (order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0);
        
        tableHtml += `
            <tr>
                <td><span class="order-number">${index + 1}</span></td>
                <td><span class="order-name">${escapeHtml(order.fullname)}</span></td>
                <td class="order-phone">${escapeHtml(order.phone)}</td>
                <td class="order-email"><a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email)}</a></td>
                <td class="order-address">${escapeHtml(order.address)}</td>
                <td class="order-items">${itemsHtml}</td>
                <td class="order-total"><strong>${Number(total).toLocaleString()} ₽</strong></td>
                <td class="text-center">${statusHtml}</td>
                <td class="text-center">${consentHtml}</td>
                <td class="order-date"><i class="fa-regular fa-calendar me-1"></i>${formattedDate}</td>
                <td class="text-center order-actions">${actionsHtml}</td>
            </tr>
        `;
    });
    
    tableHtml += `
                    </tbody>
                </table>
            </div>
            <div class="orders-stats">
                <span class="stat-item">
                    <i class="fa-solid fa-list"></i>
                    Всего заказов: <strong>${orders.length}</strong>
                </span>
                <span class="stat-item">
                    <i class="fa-regular fa-clock"></i>
                    Последнее обновление: <strong>${new Date().toLocaleString('ru-RU')}</strong>
                </span>
                <button class="btn btn-sm btn-outline-warning ms-auto btn-refresh" onclick="fetchOrders()">
                    <i class="fa-solid fa-rotate"></i> Обновить
                </button>
            </div>
        </div>
    `;
    
    console.log('✅ Таблица построена, вставляем в DOM');
    container.innerHTML = tableHtml;
    console.log('✅ Готово!');
}

/**
 * Показать уведомление
 */
function showNotification(message, type = 'info') {
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
            width: 100%;
        `;
        document.body.appendChild(container);
    }
    
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'warning' ? 'alert-warning' : 
                      type === 'danger' ? 'alert-danger' : 'alert-info';
    
    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }
    }, 3000);
}

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}