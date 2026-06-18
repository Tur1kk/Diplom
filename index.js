const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

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

// Создаём БД (файл создастся автоматически)
const db = new Database('database.db');

// Создаём таблицы
db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        consent INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('✅ База данных и таблицы созданы');

// === API ===

// Получить все заказы
app.get('/api/orders', (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
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
    
    if (!fullname || !phone || !email || !address) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    if (!consent) {
        return res.status(400).json({ error: 'Необходимо согласие' });
    }
    
    try {
        const result = db.prepare(`
            INSERT INTO orders (fullname, phone, email, address, consent) 
            VALUES (?, ?, ?, ?, ?)
        `).run(fullname, phone, email, address, consent ? 1 : 0);
        
        const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
        console.log('✅ Заказ создан:', newOrder);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});