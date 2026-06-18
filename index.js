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

// === Путь к файлу данных ===
const DATA_FILE = path.join(__dirname, 'orders.json');
console.log(`📁 Файл данных: ${DATA_FILE}`);

// === Функции работы с данными ===

function getOrders() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.log('📁 Создаём новый файл orders.json');
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const orders = JSON.parse(data);
        console.log(`📊 Прочитано ${orders.length} заказов`);
        return orders;
    } catch (error) {
        console.error('❌ Ошибка чтения:', error);
        return [];
    }
}

function saveOrders(orders) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
        console.log(`💾 Сохранено ${orders.length} заказов`);
        console.log(`📁 Размер файла: ${fs.statSync(DATA_FILE).size} байт`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка записи:', error);
        return false;
    }
}

// === API ===

// Получить все заказы
app.get('/api/orders', (req, res) => {
    console.log('📥 GET /api/orders');
    try {
        const orders = getOrders();
        console.log(`📤 Отправка ${orders.length} заказов`);
        res.json(orders);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({ error: error.message });
    }
});

// Создать заказ (с товарами)
app.post('/api/orders', (req, res) => {
    console.log('📝 POST /api/orders');
    console.log('📦 Тело запроса:', JSON.stringify(req.body, null, 2));
    
    const { fullname, phone, email, address, consent, items, total } = req.body;
    
    // Валидация
    if (!fullname || !phone || !email || !address) {
        console.log('❌ Не все поля заполнены');
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    if (!consent) {
        console.log('❌ Нет согласия');
        return res.status(400).json({ error: 'Необходимо согласие' });
    }
    
    // Проверяем наличие товаров
    if (!items || !Array.isArray(items) || items.length === 0) {
        console.log('❌ Корзина пуста');
        return res.status(400).json({ error: 'Корзина пуста. Добавьте товары.' });
    }
    
    try {
        const orders = getOrders();
        console.log(`📊 Текущее количество заказов: ${orders.length}`);
        
        // Создаём новый заказ с товарами
        const newOrder = {
            id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
            fullname: fullname.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            consent: consent ? 1 : 0,
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image || ''
            })),
            total: total || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            created_at: new Date().toISOString()
        };
        
        console.log('📝 Новый заказ:', JSON.stringify(newOrder, null, 2));
        
        orders.push(newOrder);
        const saved = saveOrders(orders);
        
        if (!saved) {
            console.error('❌ Не удалось сохранить');
            return res.status(500).json({ error: 'Ошибка сохранения' });
        }
        
        console.log('✅ Заказ создан! ID:', newOrder.id);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('❌ Ошибка создания:', error);
        res.status(500).json({ error: error.message });
    }
});

// Проверка статуса
app.get('/api/status', (req, res) => {
    const orders = getOrders();
    const exists = fs.existsSync(DATA_FILE);
    let size = 0;
    let content = null;
    
    if (exists) {
        size = fs.statSync(DATA_FILE).size;
        try {
            content = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (e) {}
    }
    
    res.json({
        status: 'ok',
        ordersCount: orders.length,
        dataFile: DATA_FILE,
        fileExists: exists,
        fileSize: size,
        fileContent: content,
        nodeVersion: process.version,
        cwd: process.cwd()
    });
});

// === Запуск ===

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 Рабочая директория: ${__dirname}`);
    console.log(`📁 Файл данных: ${DATA_FILE}`);
    
    if (fs.existsSync(DATA_FILE)) {
        const stats = fs.statSync(DATA_FILE);
        console.log(`📊 Размер файла: ${stats.size} байт`);
        const orders = getOrders();
        console.log(`📊 Количество заказов: ${orders.length}`);
    } else {
        console.log('📁 Файл orders.json будет создан при первом заказе');
    }
});