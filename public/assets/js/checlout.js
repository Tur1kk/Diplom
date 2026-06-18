/**
 * Оформление заказа
 * Отправка данных на сервер
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

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

        // Сбор данных
        const formData = {
            fullname: fullname.value.trim(),
            phone: phone.value.trim(),
            email: email.value.trim(),
            address: address.value.trim(),
            consent: consentCheck.checked ? 1 : 0
        };

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

        // Валидация телефона (минимальная)
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
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showFormMessage('✅ Заказ успешно оформлен!', 'success');
                form.reset();
                
                // Закрываем модальное окно через 2 секунды
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
                    if (modal) modal.hide();
                    
                    // Показываем уведомление на странице
                    showNotification('Спасибо за заказ! Мы свяжемся с вами в ближайшее время.', 'success');
                }, 2000);
            } else {
                showFormMessage(result.error || 'Ошибка при оформлении заказа', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showFormMessage('Ошибка соединения с сервером. Попробуйте позже.', 'danger');
        } finally {
            // Скрываем спиннер
            submitBtn.disabled = false;
            submitText.textContent = 'Оформить заказ';
            submitSpinner.style.display = 'none';
        }
    });

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
    }

    /**
     * Показать уведомление на странице
     */
    function showNotification(text, type = 'info') {
        // Проверяем, есть ли контейнер для уведомлений
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
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
        }

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
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
});