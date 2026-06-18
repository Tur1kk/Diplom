/**
 * Orders Management
 * Загрузка и отображение заказов
 */

// Загружаем заказы при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
});

/**
 * Получение списка заказов с сервера
 */
function fetchOrders() {
    const container = document.getElementById('ordersContainer');
    
    // Показываем спиннер
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
            if (!response.ok) {
                throw new Error('Ошибка при загрузке заказов');
            }
            return response.json();
        })
        .then(orders => {
            renderOrders(orders);
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = `
                <div class="empty-orders">
                    <i class="fa-solid fa-triangle-exclamation text-danger"></i>
                    <h3>Ошибка загрузки</h3>
                    <p class="text-muted">Не удалось загрузить список заказов. Попробуйте позже.</p>
                    <button class="btn btn-warning" onclick="fetchOrders()">
                        <i class="fa-solid fa-rotate"></i> Попробовать снова
                    </button>
                </div>
            `;
        });
}

/**
 * Отрисовка таблицы с заказами
 * @param {Array} orders - Массив заказов
 */
function renderOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    // Проверяем, есть ли заказы
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <i class="fa-solid fa-box-open"></i>
                <h3>Заказов пока нет</h3>
                <p class="text-muted">Первый заказ будет отображаться здесь</p>
                <a href="index.html" class="btn btn-warning">
                    <i class="fa-solid fa-shopping-bag"></i> Перейти к покупкам
                </a>
            </div>
        `;
        return;
    }
    
    // Строим таблицу
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
                            <th class="text-center">Согласие</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    orders.forEach((order, index) => {
        // Форматируем дату
        const date = new Date(order.created_at);
        const formattedDate = date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Согласие
        const consentHtml = order.consent == 1 
            ? `<span class="consent-badge yes"><i class="fa-solid fa-check-circle"></i> Да</span>`
            : `<span class="consent-badge no"><i class="fa-solid fa-times-circle"></i> Нет</span>`;
        
        tableHtml += `
            <tr>
                <td><span class="order-number">${index + 1}</span></td>
                <td><span class="order-name">${escapeHtml(order.fullname)}</span></td>
                <td class="order-phone">${escapeHtml(order.phone)}</td>
                <td class="order-email"><a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email)}</a></td>
                <td class="order-address">${escapeHtml(order.address)}</td>
                <td class="text-center">${consentHtml}</td>
                <td class="order-date"><i class="fa-regular fa-calendar me-1"></i>${formattedDate}</td>
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
    
    container.innerHTML = tableHtml;
}

/**
 * Экранирование HTML для защиты от XSS
 * @param {string} text - Текст для экранирования
 * @returns {string} Экранированный текст
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}