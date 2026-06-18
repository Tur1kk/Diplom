const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Раздача статических файлов из папки public
app.use(express.static('public'));
app.use(express.json());

// === Маршруты ===

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница заказов
app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

// === Работа с данными ===

// Путь к файлу данных
const DATA_DIR = fs.existsSync('/data') ? '/data' : __dirname;
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

console.log(`🚀 Запуск сервера...`);
console.log(`📁 Рабочая директория: ${__dirname}`);
console.log(`📁 Имя файла: ${__filename}`);
console.log(`📁 Директория данных: ${DATA_DIR}`);
console.log(`📁 Файл данных: ${DATA_FILE}`);

// Функция чтения заказов
function getOrders() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.log('📁 Создаём новый файл orders.json');
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

// Функция сохранения заказов
function saveOrders(orders) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
        console.log(`💾 Сохранено ${orders.length} заказов`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка записи:', error);
        return false;
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
    console.log('📝 POST /api/orders');
    console.log('📦 Данные:', req.body);
    
    const { fullname, phone, email, address, consent } = req.body;
    
    // Валидация
    if (!fullname || !phone || !email || !address) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Некорректный email' });
    }
    
    if (!consent) {
        return res.status(400).json({ error: 'Необходимо согласие' });
    }
    
    try {
        const orders = getOrders();
        
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
        console.error('❌ Ошибка:', error);
        res.status(500).json({ error: error.message });
    }
});

// Проверка статуса (для отладки)
app.get('/api/status', (req, res) => {
    const orders = getOrders();
    res.json({
        status: 'ok',
        ordersCount: orders.length,
        dataFile: DATA_FILE,
        fileExists: fs.existsSync(DATA_FILE),
        nodeVersion: process.version,
        cwd: process.cwd(),
        filename: __filename
    });
});

// === Запуск сервера ===

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 URL: http://localhost:${PORT}`);
    console.log(`📁 Страница заказов: http://localhost:${PORT}/orders`);
    
    // Проверяем содержимое папки
    console.log('📁 Содержимое директории:');
    try {
        const files = fs.readdirSync(__dirname);
        files.forEach(file => {
            const stats = fs.statSync(path.join(__dirname, file));
            const type = stats.isDirectory() ? '📁' : '📄';
            console.log(`  ${type} ${file}`);
        });
    } catch (error) {
        console.error('❌ Ошибка чтения директории:', error);
    }
});