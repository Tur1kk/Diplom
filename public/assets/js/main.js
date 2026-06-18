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

// === Кнопки закрытия корзины ===
document.querySelectorAll('.closecart').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const offcanvasEl = document.getElementById('offcanvasCart');
        if (offcanvasEl) {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (offcanvas) {
                try {
                    offcanvas.hide();
                } catch (error) {
                    console.warn('⚠️ Ошибка закрытия корзины:', error);
                }
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