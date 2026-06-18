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
console.log(`📁 Путь к файлу данных: ${DATA_FILE}`);

// === Функции работы с данными ===

function getOrders() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.log('📁 Файл orders.json не существует, создаём новый');
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const orders = JSON.parse(data);
        console.log(`📊 Прочитано ${orders.length} заказов из файла`);
        return orders;
    } catch (error) {
        console.error('❌ Ошибка чтения orders.json:', error);
        return [];
    }
}

function saveOrders(orders) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
        console.log(`💾 Сохранено ${orders.length} заказов в файл`);
        console.log(`📁 Файл: ${DATA_FILE}`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка записи orders.json:', error);
        console.error('❌ Детали ошибки:', error.message);
        return false;
    }
}

// === API ===

// Получить все заказы
app.get('/api/orders', (req, res) => {
    try {
        const orders = getOrders();
        console.log(`📊 Отправка ${orders.length} заказов клиенту`);
        res.json(orders);
    } catch (error) {
        console.error('❌ Ошибка получения заказов:', error);
        res.status(500).json({ error: error.message });
    }
});

// Создать заказ
app.post('/api/orders', (req, res) => {
    console.log('📝 POST /api/orders');
    console.log('📦 Тело запроса:', JSON.stringify(req.body, null, 2));
    
    const { fullname, phone, email, address, consent } = req.body;
    
    // Валидация
    if (!fullname || !phone || !email || !address) {
        console.log('❌ Не все поля заполнены');
        return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('❌ Некорректный email');
        return res.status(400).json({ error: 'Некорректный email адрес' });
    }
    
    if (!consent) {
        console.log('❌ Нет согласия');
        return res.status(400).json({ error: 'Необходимо согласие на обработку данных' });
    }
    
    try {
        // Получаем текущие заказы
        const orders = getOrders();
        console.log(`📊 Текущее количество заказов: ${orders.length}`);
        
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
        
        console.log('📝 Новый заказ:', JSON.stringify(newOrder, null, 2));
        
        // Добавляем заказ
        orders.push(newOrder);
        
        // Сохраняем
        const saved = saveOrders(orders);
        
        if (!saved) {
            console.error('❌ Не удалось сохранить заказ');
            return res.status(500).json({ error: 'Ошибка сохранения заказа' });
        }
        
        console.log('✅ Заказ успешно создан! ID:', newOrder.id);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('❌ Ошибка создания заказа:', error);
        res.status(500).json({ error: error.message });
    }
});

// Проверка статуса (для отладки)
app.get('/api/status', (req, res) => {
    const orders = getOrders();
    const fileExists = fs.existsSync(DATA_FILE);
    let fileSize = 0;
    let fileContent = '';
    
    if (fileExists) {
        const stats = fs.statSync(DATA_FILE);
        fileSize = stats.size;
        try {
            fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        } catch (e) {}
    }
    
    res.json({
        status: 'ok',
        ordersCount: orders.length,
        dataFile: DATA_FILE,
        fileExists: fileExists,
        fileSize: fileSize,
        fileContent: fileContent ? JSON.parse(fileContent) : null,
        nodeVersion: process.version,
        cwd: process.cwd(),
        dirContent: fs.readdirSync(__dirname)
    });
});

// Запуск сервера
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 Рабочая директория: ${__dirname}`);
    console.log(`📁 Файл данных: ${DATA_FILE}`);
    
    // Проверяем существование файла
    if (fs.existsSync(DATA_FILE)) {
        const stats = fs.statSync(DATA_FILE);
        console.log(`📊 Размер файла: ${stats.size} байт`);
        const orders = getOrders();
        console.log(`📊 Количество заказов: ${orders.length}`);
    } else {
        console.log('📁 Файл orders.json будет создан при первом заказе');
    }
    
    // Показываем содержимое директории
    console.log('📁 Содержимое директории:');
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
        const stats = fs.statSync(path.join(__dirname, file));
        const type = stats.isDirectory() ? '📁' : '📄';
        console.log(`  ${type} ${file} ${stats.isDirectory() ? '' : `(${stats.size} байт)`}`);
    });
});