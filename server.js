const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'prices.db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }
});

// 初始化資料表，使用 AUTOINCREMENT
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS egg_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    name TEXT,
    price REAL
  )`);
});

// 取得所有紀錄（符合 B2）
app.get('/api/eggs', (req, res) => {
  db.all('SELECT * FROM egg_prices ORDER BY date DESC, id DESC', [], (err, rows) => {
    if (err) return res.status(500).send({ error: err.message });
    res.json(rows);
  });
});

// 新增紀錄
app.post('/api/eggs', (req, res) => {
  const { date, name, price } = req.body;
  if (!date || !name || price == null) return res.status(400).send({ error: 'Missing fields' });
  const stmt = db.prepare('INSERT INTO egg_prices (date, name, price) VALUES (?, ?, ?)');
  stmt.run([date, name, price], function (err) {
    if (err) return res.status(500).send({ error: err.message });
    res.json({ id: this.lastID });
  });
  stmt.finalize();
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
