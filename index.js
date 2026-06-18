const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

// === JSON хранилище ===
const DATA_FILE = path.join(__dirname, 'orders.json');

// Функция для чтения заказов
function getOrders() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Если файла нет, создаём его с пустым массивом
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            console.log('📁 Создан новый файл orders.json');
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const orders = JSON.parse(data);
        return orders;
    } catch (error) {
        console.error('❌ Ошибка чтения orders.json:', error);
        return [];
    }
}

// Функция для сохранения заказов
function saveOrders(orders) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
        console.log(`💾 Сохранено ${orders.length} заказов в orders.json`);
    } catch (error) {
        console.error('❌ Ошибка записи orders.json:', error);
    }
}

// === API ===

// Получить все заказы
app.get('/api/orders', (req, res) => {
    try {
        const orders = getOrders();
        console.log(`📊 Найдено заказов: ${orders.length}`);
        res.json(orders);
    } catch (error) {
        console.error('❌ Ошибка получения заказов:', error);
        res.status(500).json({ error: error.message });
    }
});

// Создать заказ
app.post('/api/orders', (req, res) => {
    console.log('📝 POST /api/orders', req.body);
    
    const { fullname, phone, email, address, consent } = req.body;
    
    // Валидация
    if (!fullname || !phone || !email || !address) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Некорректный email адрес' });
    }
    
    if (!consent) {
        return res.status(400).json({ error: 'Необходимо согласие на обработку данных' });
    }
    
    try {
        const orders = getOrders();
        
        // Создаём новый заказ
        const newOrder = {
            id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
            fullname: fullname.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            consent: consent ? 1 : 0,
            created_at: new Date().toISOString()
        };
        
        orders.push(newOrder);
        saveOrders(orders);
        
        console.log('✅ Заказ создан:', newOrder);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('❌ Ошибка создания заказа:', error);
        res.status(500).json({ error: error.message });
    }
});

// Удалить заказ (опционально)
app.delete('/api/orders/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let orders = getOrders();
        const initialLength = orders.length;
        orders = orders.filter(order => order.id !== id);
        
        if (orders.length === initialLength) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        saveOrders(orders);
        res.json({ success: true, message: 'Заказ удалён' });
    } catch (error) {
        console.error('❌ Ошибка удаления заказа:', error);
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 Данные хранятся в: ${DATA_FILE}`);
    
    // Проверяем существование файла
    if (fs.existsSync(DATA_FILE)) {
        const stats = fs.statSync(DATA_FILE);
        console.log(`📊 Размер файла: ${stats.size} байт`);
        const orders = getOrders();
        console.log(`📊 Текущее количество заказов: ${orders.length}`);
    } else {
        console.log('📁 Файл orders.json будет создан при первом заказе');
    }
});