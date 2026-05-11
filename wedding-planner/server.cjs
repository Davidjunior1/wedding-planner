const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '50mb' }));

// API: Weddings list
app.get('/api/weddings', async (req, res) => {
  try {
    const weddings = await db.getWeddings();
    res.json(weddings);
  } catch (err) {
    console.error('GET /api/weddings error:', err);
    res.json([]);
  }
});

app.post('/api/weddings', async (req, res) => {
  try {
    await db.saveWeddings(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/weddings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Wedding detailed data
app.get('/api/wedding-data/:id', async (req, res) => {
  try {
    const data = await db.getWeddingData(req.params.id);
    res.json(data);
  } catch (err) {
    console.error('GET /api/wedding-data error:', err);
    res.json(null);
  }
});

app.post('/api/wedding-data/:id', async (req, res) => {
  try {
    await db.saveWeddingData(req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/wedding-data error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from dist (production)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
async function start() {
  try {
    await db.initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
      if (process.env.DATABASE_URL) {
        console.log('📦 Usando PostgreSQL');
      } else {
        console.log('📦 Usando SQLite (data/database.sqlite)');
      }
    });
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

start();
