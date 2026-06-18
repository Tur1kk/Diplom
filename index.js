const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const db = new Database('database.db');

// Создаём таблицу для заказов
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

// Создаём таблицу для обратной связи (если нужно)
db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        consent INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// === API для заказов ===

// Добавить новый заказ
app.post('/api/orders', (req, res) => {
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
        return res.status(400).json({ error: 'Необходимо согласие на обработку персональных данных' });
    }
    
    try {
        const result = db.prepare(`
            INSERT INTO orders (fullname, phone, email, address, consent) 
            VALUES (?, ?, ?, ?, ?)
        `).run(fullname, phone, email, address, consent ? 1 : 0);
        
        const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Получить все заказы
app.get('/api/orders', (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Получить заказ по ID
app.get('/api/orders/:id', (req, res) => {
    try {
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: error.message });
    }
});

// === API для обратной связи (существующий) ===

app.post('/api/requests', (req, res) => {
    const { name, email, message, consent } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Имя, email и сообщение обязательны' });
    }
    
    if (!consent) {
        return res.status(400).json({ error: 'Необходимо согласие на обработку персональных данных' });
    }
    
    try {
        const result = db.prepare(`
            INSERT INTO requests (name, email, message, consent) 
            VALUES (?, ?, ?, ?)
        `).run(name, email, message, consent ? 1 : 0);
        
        const newRequest = db.prepare('SELECT * FROM requests WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, request: newRequest });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/requests', (req, res) => {
    try {
        const requests = db.prepare('SELECT * FROM requests ORDER BY created_at DESC').all();
        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Database: database.db`);
});