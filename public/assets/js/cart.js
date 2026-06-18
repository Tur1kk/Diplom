/**
 * Корзина товаров
 * Управление товарами, количеством и суммой
 */

// Данные корзины (хранятся в localStorage)
let cart = [];

// Загрузка корзины из localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        } else {
            cart = [];
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        cart = [];
    }
    return cart;
}

// Сохранение корзины в localStorage
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        updateCartOffcanvas();
    } catch (error) {
        console.error('Ошибка сохранения корзины:', error);
    }
}

// Обновление бейджа с количеством товаров
function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badges.forEach(badge => {
        badge.textContent = totalItems;
    });
}

// Добавление товара в корзину (ОБЪЕДИНЯЕТ ОДИНАКОВЫЕ ТОВАРЫ)
function addToCart(productId, name, price, image, maxQuantity = 99) {
    // Ищем товар с таким же ID
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Если товар уже есть - увеличиваем количество
        if (existingItem.quantity < maxQuantity) {
            existingItem.quantity++;
            saveCart();
            showNotification(`${name} (${existingItem.quantity} шт.)`, 'success');
        } else {
            showNotification('Достигнуто максимальное количество', 'warning');
        }
    } else {
        // Если товара нет - добавляем новый
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
        saveCart();
        showNotification(`${name} добавлен в корзину!`, 'success');
    }
}

// Удаление товара из корзины (оставляем для совместимости, но не используем)
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showNotification('Товар удалён из корзины', 'info');
}

// Изменение количества товара
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        // Если количество меньше 1 - удаляем товар
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
    }
}

// Получение общей суммы
function getTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Получение количества товаров
function getTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Очистка корзины
function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Очистить корзину?')) {
        cart = [];
        saveCart();
        showNotification('Корзина очищена', 'info');
    }
}

// Обновление корзины в offcanvas (БЕЗ КНОПКИ УДАЛЕНИЯ)
function updateCartOffcanvas() {
    const tbody = document.querySelector('.offcanvasCart-table tbody');
    const tfoot = document.querySelector('.offcanvasCart-table tfoot');
    
    if (!tbody) return;
    
    if (cart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted empty-cart">
                    <i class="fa-solid fa-cart-plus fa-2x d-block mb-2"></i>
                    Корзина пуста
                </td>
            </tr>
        `;
        if (tfoot) {
            tfoot.innerHTML = `
                <tr>
                    <td colspan="4" class="text-end fw-bold">Итого:</td>
                    <td class="fw-bold">0 ₽</td>
                </tr>
            `;
        }
        return;
    }
    
    let html = '';
    cart.forEach((item) => {
        const totalPrice = (item.price * item.quantity);
        html += `
            <tr>
                <td class="product-img-td">
                    <a href="#"><img src="${item.image}" alt="${item.name}"></a>
                </td>
                <td class="product-name-td">
                    <a href="#">${item.name}</a>
                </td>
                <td class="product-price-td">${Number(item.price).toLocaleString()} ₽</td>
                <td class="product-qty-td">
                    <div class="d-flex align-items-center gap-1">
                        <button class="btn btn-sm btn-outline-secondary qty-btn" 
                                onclick="decrementQuantity('${item.id}')">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary qty-btn" 
                                onclick="incrementQuantity('${item.id}')">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="product-total-td">${Number(totalPrice).toLocaleString()} ₽</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    if (tfoot) {
        const total = getTotal();
        tfoot.innerHTML = `
            <tr>
                <td colspan="4" class="text-end fw-bold">Итого:</td>
                <td class="fw-bold">${Number(total).toLocaleString()} ₽</td>
            </tr>
        `;
    }
}

// Увеличение количества
function incrementQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity++;
        saveCart();
    }
}

// Уменьшение количества
function decrementQuantity(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
            saveCart();
        } else {
            // Если количество становится 0 - удаляем товар
            removeFromCart(productId);
        }
    }
}

// Показать уведомление
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartBadge();
    updateCartOffcanvas();
    
    // Обработчики для кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            if (productCard) {
                const nameEl = productCard.querySelector('.product-details h4 a');
                const name = nameEl ? nameEl.textContent : 'Товар';
                
                // === ИСПРАВЛЕНИЕ: БЕРЁМ СКИДОЧНУЮ ЦЕНУ ===
                const priceEl = productCard.querySelector('.product-price');
                let price = 0;
                
                if (priceEl) {
                    // Ищем основную цену (без тега <small>)
                    const mainPrice = priceEl.textContent.trim();
                    // Убираем старую цену в <small> если она есть
                    const smallPrice = priceEl.querySelector('small');
                    let priceText = mainPrice;
                    if (smallPrice) {
                        // Если есть <small>, берём только то, что после него
                        priceText = mainPrice.replace(smallPrice.textContent, '').trim();
                    }
                    // Извлекаем число
                    const priceMatch = priceText.match(/([\d\s]+)/);
                    if (priceMatch) {
                        price = parseFloat(priceMatch[0].replace(/\s/g, ''));
                    }
                }
                
                const image = productCard.querySelector('.product-thumb img')?.src || '/assets/img/default.jpg';
                // Используем название товара + цена для ID
                const id = 'product_' + name.replace(/\s/g, '_').substring(0, 30) + '_' + price;
                
                if (price > 0) {
                    addToCart(id, name, price, image);
                } else {
                    showNotification('Не удалось определить цену товара', 'warning');
                }
            }
        });
    });
    
    // Обработчик для кнопки "Очистить корзину" в offcanvas
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearCart();
        });
    }
});

// Делаем функции глобальными для использования в HTML
window.cart = cart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.incrementQuantity = incrementQuantity;
window.decrementQuantity = decrementQuantity;
window.clearCart = clearCart;
window.getTotal = getTotal;
window.getTotalItems = getTotalItems;
window.updateCartOffcanvas = updateCartOffcanvas;