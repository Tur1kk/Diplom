(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})();

window.addEventListener('scroll', function () {
    const headerNav = document.getElementById('header-nav');
    if (headerNav) {
        headerNav.classList.toggle('headernav-scroll', window.scrollY > 135);
    }
});

// === Инициализация Offcanvas для корзины (только если элемент существует) ===
const offcanvasCartEl = document.getElementById('offcanvasCart');
let offcanvasCart = null;

if (offcanvasCartEl) {
    try {
        offcanvasCart = new bootstrap.Offcanvas(offcanvasCartEl);
        console.log('✅ Offcanvas корзины инициализирован');
    } catch (error) {
        console.warn('⚠️ Ошибка инициализации Offcanvas:', error);
    }
}

// === Кнопка открытия корзины ===
const cartOpenBtn = document.getElementById('cart-open');
if (cartOpenBtn && offcanvasCart) {
    cartOpenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
            offcanvasCart.toggle();
        } catch (error) {
            console.warn('⚠️ Ошибка открытия корзины:', error);
        }
    });
} else if (cartOpenBtn) {
    // Если корзина не инициализирована, просто логируем
    cartOpenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('ℹ️ Корзина не доступна на этой странице');
    });
}

// === Кнопки закрытия корзины ===
document.querySelectorAll('.closecart').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        if (offcanvasCart) {
            try {
                offcanvasCart.hide();
            } catch (error) {
                console.warn('⚠️ Ошибка закрытия корзины:', error);
            }
        }
        const href = item.dataset.href;
        if (href) {
            const target = document.getElementById(href);
            if (target) {
                target.scrollIntoView();
            }
        }
    });
});

// === Кнопка "Наверх" ===
$(document).ready(function () {
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('#top').fadeIn();
        } else {
            $('#top').fadeOut();
        }
    });

    $('#top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 500);
        return false;
    });

    // Owl Carousel (только если есть на странице)
    if ($(".owl-carousel-full").length) {
        $(".owl-carousel-full").owlCarousel({
            margin: 20,
            responsive: {
                0: {
                    items: 1
                },
                500: {
                    items: 2
                },
                700: {
                    items: 3
                },
                1000: {
                    items: 4
                }
            }
        });
    }
});