/**
 * Оформление заказа
 * Отправка данных на сервер вместе с товарами из корзины
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    if (!form) {
        console.error('❌ Форма #orderForm не найдена');
        return;
    }
    
    console.log('✅ Форма заказа найдена');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📤 Отправка формы...');

        // Получаем элементы
        const fullname = document.getElementById('fullname');
        const phone = document.getElementById('phone');
        const email = document.getElementById('email');
        const address = document.getElementById('address');
        const consentCheck = document.getElementById('consentCheck');
        const messageDiv = document.getElementById('formMessage');
        const submitBtn = document.getElementById('submitOrderBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');

        // Проверяем, что все элементы найдены
        if (!fullname || !phone || !email || !address || !consentCheck) {
            console.error('❌ Не найдены поля формы');
            showFormMessage('Ошибка: не все поля формы найдены', 'danger');
            return;
        }

        // Очищаем предыдущее сообщение
        if (messageDiv) {
            messageDiv.style.display = 'none';
            messageDiv.className = 'mt-3';
        }

        // Проверка согласия
        if (!consentCheck.checked) {
            showFormMessage('Пожалуйста, дайте согласие на обработку персональных данных', 'danger');
            return;
        }

        // Получаем товары из корзины
        let cartItems = [];
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                cartItems = JSON.parse(savedCart);
                console.log('📦 Товары из корзины:', cartItems);
            }
        } catch (error) {
            console.error('❌ Ошибка получения корзины:', error);
        }

        // Проверяем, что корзина не пуста
        if (cartItems.length === 0) {
            showFormMessage('Корзина пуста! Добавьте товары перед оформлением заказа.', 'danger');
            return;
        }

        // Сбор данных формы
        const formData = {
            fullname: fullname.value.trim(),
            phone: phone.value.trim(),
            email: email.value.trim(),
            address: address.value.trim(),
            consent: consentCheck.checked ? 1 : 0,
            items: cartItems, // Добавляем товары из корзины
            total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) // Общая сумма
        };

        console.log('📝 Данные заказа:', formData);

        // Валидация
        if (!formData.fullname || !formData.phone || !formData.email || !formData.address) {
            showFormMessage('Пожалуйста, заполните все обязательные поля', 'danger');
            return;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showFormMessage('Пожалуйста, введите корректный email адрес', 'danger');
            return;
        }

        // Валидация телефона
        const phoneRegex = /^[\d\+\(\)\s-]{7,}$/;
        if (!phoneRegex.test(formData.phone)) {
            showFormMessage('Пожалуйста, введите корректный номер телефона', 'danger');
            return;
        }

        // Показываем спиннер
        submitBtn.disabled = true;
        submitText.textContent = 'Отправка...';
        submitSpinner.style.display = 'inline-block';

        try {
            console.log('🔄 Отправка запроса на /api/orders...');
            
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('📡 Статус ответа:', response.status);
            
            const result = await response.json();
            console.log('📦 Ответ сервера:', result);

            if (response.ok && result.success) {
                showFormMessage('✅ Заказ успешно оформлен!', 'success');
                form.reset();
                
                // Очищаем корзину после успешного заказа
                localStorage.removeItem('cart');
                // Обновляем бейдж корзины
                const badges = document.querySelectorAll('.cart-badge');
                badges.forEach(badge => {
                    badge.textContent = '0';
                });
                // Обновляем корзину в offcanvas
                if (window.updateCartOffcanvas) {
                    window.updateCartOffcanvas();
                }
                
                // Закрываем модальное окно через 2 секунды
                setTimeout(() => {
                    closeModalSafely('checkoutModal');
                    showNotification('Спасибо за заказ! Мы свяжемся с вами в ближайшее время.', 'success');
                }, 2000);
            } else {
                showFormMessage(result.error || 'Ошибка при оформлении заказа', 'danger');
            }
        } catch (error) {
            console.error('❌ Ошибка:', error);
            showFormMessage('Ошибка соединения с сервером. Попробуйте позже.', 'danger');
        } finally {
            // Скрываем спиннер
            submitBtn.disabled = false;
            submitText.textContent = 'Оформить заказ';
            submitSpinner.style.display = 'none';
        }
    });

    /**
     * Безопасное закрытие модального окна
     */
    function closeModalSafely(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.warn(`⚠️ Модальное окно #${modalId} не найдено`);
            return;
        }
        
        try {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
                console.log(`✅ Модальное окно #${modalId} закрыто через Bootstrap API`);
                return;
            }
        } catch (e) {
            console.warn('⚠️ Ошибка при получении экземпляра Bootstrap:', e);
        }
        
        try {
            if (typeof $ !== 'undefined' && $.fn && $.fn.modal) {
                $(modalElement).modal('hide');
                console.log(`✅ Модальное окно #${modalId} закрыто через jQuery`);
                return;
            }
        } catch (e) {
            console.warn('⚠️ Ошибка при использовании jQuery:', e);
        }
        
        try {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop && backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            console.log(`✅ Модальное окно #${modalId} закрыто вручную (fallback)`);
        } catch (e) {
            console.error('❌ Критическая ошибка при закрытии модального окна:', e);
        }
    }

    /**
     * Показать сообщение в форме
     */
    function showFormMessage(text, type = 'info') {
        const messageDiv = document.getElementById('formMessage');
        if (!messageDiv) return;

        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'danger' ? 'alert-danger' : 'alert-info';
        
        messageDiv.className = `alert ${alertClass} mt-3`;
        messageDiv.textContent = text;
        messageDiv.style.display = 'block';
        console.log(`💬 Сообщение (${type}):`, text);
    }

    /**
     * Показать уведомление на странице
     */
    function showNotification(text, type = 'info') {
        const oldContainer = document.getElementById('notificationContainer');
        if (oldContainer) {
            oldContainer.remove();
        }
        
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            width: 100%;
        `;
        document.body.appendChild(container);

        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'danger' ? 'alert-danger' : 'alert-info';
        
        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} alert-dismissible fade show`;
        notification.role = 'alert';
        notification.innerHTML = `
            ${text}
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
        }, 5000);
    }
});