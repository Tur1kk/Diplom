const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static('public'));
app.use(express.json());

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

// === JSON хранилище ===
const DATA_FILE = path.join(__dirname, 'orders.json');

function getOrders() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Ошибка чтения:', error);
        return [];
    }
}

function saveOrders(orders) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
    } catch (error) {
        console.error('❌ Ошибка записи:', error);
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
        console.error('❌ Ошибка:', error);
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
        const newOrder = {
            id: orders.length + 1,
            fullname,
            phone,
            email,
            address,
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

// Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 Данные хранятся в: ${DATA_FILE}`);
    console.log(`📊 Текущее количество заказов: ${getOrders().length}`);
});