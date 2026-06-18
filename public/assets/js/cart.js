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
        updateCartPage();
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

// Добавление товара в корзину
function addToCart(productId, name, price, image, maxQuantity = 99) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < maxQuantity) {
            existingItem.quantity++;
        } else {
            showNotification('Достигнуто максимальное количество', 'warning');
            return;
        }
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification(`${name} добавлен в корзину!`, 'success');
}

// Удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showNotification('Товар удалён из корзины', 'info');
}

// Изменение количества товара
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
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
    cart = [];
    saveCart();
    showNotification('Корзина очищена', 'info');
}

// Обновление корзины в offcanvas
function updateCartOffcanvas() {
    const tbody = document.querySelector('.offcanvasCart-table tbody');
    const tfoot = document.querySelector('.offcanvasCart-table tfoot');
    
    if (!tbody) return;
    
    if (cart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="fa-solid fa-cart-plus fa-2x d-block mb-2"></i>
                    Корзина пуста
                </td>
            </tr>
        `;
        if (tfoot) {
            tfoot.innerHTML = `
                <tr>
                    <td colspan="4" class="text-end">Total:</td>
                    <td>$0</td>
                </tr>
            `;
        }
        return;
    }
    
    let html = '';
    cart.forEach((item, index) => {
        html += `
            <tr>
                <td class="product-img-td">
                    <a href="#"><img src="${item.image}" alt="${item.name}"></a>
                </td>
                <td><a href="#">${item.name}</a></td>
                <td>$${item.price}</td>
                <td>&times;${item.quantity}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">
                        <i class="fa-regular fa-circle-xmark"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    if (tfoot) {
        const total = getTotal();
        tfoot.innerHTML = `
            <tr>
                <td colspan="4" class="text-end">Total:</td>
                <td>$${total}</td>
            </tr>
        `;
    }
}

// Обновление страницы корзины (cart.html)
function updateCartPage() {
    const tbody = document.querySelector('.cart-content tbody');
    const subtotalEl = document.querySelector('.cart-summary .subtotal');
    const totalEl = document.querySelector('.cart-summary .total');
    const shippingEl = document.querySelector('.cart-summary .shipping');
    const couponEl = document.querySelector('.cart-summary .coupon');
    
    if (!tbody) return;
    
    if (cart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <i class="fa-solid fa-cart-plus fa-3x d-block mb-3 text-muted"></i>
                    <h4>Корзина пуста</h4>
                    <p class="text-muted">Добавьте товары в корзину, чтобы оформить заказ</p>
                    <a href="index.html" class="btn btn-warning">Вернуться к покупкам</a>
                </td>
            </tr>
        `;
        
        // Обновляем суммы
        if (subtotalEl) subtotalEl.textContent = '$0';
        if (totalEl) totalEl.textContent = '$0';
        return;
    }
    
    let html = '';
    cart.forEach((item) => {
        html += `
            <tr>
                <td class="product-img-td">
                    <a href="#">
                        <img src="${item.image}" alt="${item.name}">
                    </a>
                </td>
                <td>
                    <a href="#" class="cart-content-title">${item.name}</a>
                </td>
                <td>$${item.price}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary" onclick="decrementQuantity('${item.id}')">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <input type="number" value="${item.quantity}" class="form-control cart-qty" 
                               style="width:60px; text-align:center;" 
                               onchange="updateQuantity('${item.id}', parseInt(this.value))"
                               onfocus="this.select()">
                        <button class="btn btn-sm btn-outline-secondary" onclick="incrementQuantity('${item.id}')">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">
                        <i class="fa-regular fa-circle-xmark"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Обновляем суммы
    const subtotal = getTotal();
    const shipping = subtotal > 0 ? (subtotal > 500 ? 0 : 10) : 0;
    const coupon = 0;
    const total = subtotal + shipping - coupon;
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping}`;
    if (totalEl) totalEl.textContent = `$${total}`;
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
    updateCartPage();
    
    // Обработчики для кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            if (productCard) {
                const name = productCard.querySelector('.product-details h4 a')?.textContent || 'Товар';
                const priceText = productCard.querySelector('.product-price')?.textContent?.trim() || '0';
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                const image = productCard.querySelector('.product-thumb img')?.src || '/assets/img/default.jpg';
                const id = 'product_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                addToCart(id, name, price, image);
            }
        });
    });
    
    // Обработчик для кнопки "Очистить корзину"
    const clearBtn = document.getElementById('clearCart');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Очистить корзину?')) {
                clearCart();
            }
        });
    }
    
    // Обработчик для кнопки "Update Cart" (обновить корзину)
    const updateBtn = document.querySelector('.btn-outline-warning[value="Update Cart"]');
    if (updateBtn) {
        updateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            updateCartPage();
            showNotification('Корзина обновлена', 'success');
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