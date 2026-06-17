document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = {
            name: form.querySelector('[name="name"]').value,
            email: form.querySelector('[name="email"]').value,
            phone: form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value : '',
            subject: form.querySelector('[name="subject"]').value,
            message: form.querySelector('[name="message"]').value,
            consent: form.querySelector('[name="consent"]').checked
        }

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            alert('Заполни все поля!!!')
            return
        }

        if (!formData.consent) {
            alert('Дай согласие')
            return
        }

        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json();

            if (response.ok) {
                alert('Ваше сообщение принято')
                form.reset()
            }
            else {
                alert('Ошибка' + (result.error))
            }
        }
        catch (error) {
            console.error(error)
            alert('Произошла ошибка', error)
        }

    })
})