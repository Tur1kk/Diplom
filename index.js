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

// Создаём таблицу
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

// Добавить новую заявку 
app.post('/api/requests', (req, res) => {
    const { name, email, message, consent } = req.body;
    
   
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Имя, email и сообщение обязательны' });
    }
    
    // Проверяем согласие на обработку данных
    if (!consent) {
        return res.status(400).json({ error: 'Необходимо согласие на обработку персональных данных' });
    }
    
    try {
        const result = db.prepare(`
            INSERT INTO requests (name, email, message, consent) 
            VALUES (?, ?, ?, ?)
        `).run(name, email, message, consent ? 1 : 0);
        
        const newRequest = db.prepare('SELECT * FROM requests WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, request: newRequest});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получить все заявки
app.get('/api/requests', (req, res) => {
    try {
        const requests = db.prepare('SELECT * FROM requests ORDER BY created_at DESC').all();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on ${PORT}`);
});