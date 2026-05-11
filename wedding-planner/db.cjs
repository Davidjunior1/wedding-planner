const path = require('path');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL;
let db;

async function initDB() {
  if (DATABASE_URL) {
    // PostgreSQL (production - Render, Supabase, etc.)
    const { Pool } = require('pg');
    db = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await db.query(`
      CREATE TABLE IF NOT EXISTS weddings (
        id TEXT PRIMARY KEY,
        couple_name TEXT NOT NULL DEFAULT '',
        project_name TEXT DEFAULT '',
        event_date TEXT DEFAULT '',
        phrase TEXT DEFAULT ''
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS wedding_data (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}'
      );
    `);
    console.log('📦 Conectado ao PostgreSQL');
  } else {
    // SQLite (local)
    const Database = require('better-sqlite3');
    const dbPath = path.join(__dirname, 'data', 'database.sqlite');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS weddings (
        id TEXT PRIMARY KEY,
        couple_name TEXT NOT NULL DEFAULT '',
        project_name TEXT DEFAULT '',
        event_date TEXT DEFAULT '',
        phrase TEXT DEFAULT ''
      );
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS wedding_data (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL DEFAULT '{}'
      );
    `);
    console.log('📦 Conectado ao SQLite');
  }
}

function isPostgres() {
  return !!DATABASE_URL;
}

async function getWeddings() {
  if (isPostgres()) {
    const r = await db.query('SELECT * FROM weddings ORDER BY rowid');
    return r.rows.map(w => ({ id: w.id, name: w.couple_name, coupleName: w.couple_name, projectName: w.project_name, eventDate: w.event_date, phrase: w.phrase }));
  }
  const rows = db.prepare('SELECT * FROM weddings').all();
  return rows.map(w => ({ id: w.id, name: w.couple_name, coupleName: w.couple_name, projectName: w.project_name, eventDate: w.event_date, phrase: w.phrase }));
}

async function saveWeddings(weddings) {
  if (isPostgres()) {
    await db.query('DELETE FROM weddings');
    for (const w of weddings) {
      await db.query('INSERT INTO weddings (id, couple_name, project_name, event_date, phrase) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET couple_name=$2, project_name=$3, event_date=$4, phrase=$5',
        [w.id, w.coupleName || '', w.projectName || '', w.eventDate || '', w.phrase || '']);
    }
  } else {
    const upsert = db.prepare('INSERT OR REPLACE INTO weddings (id, couple_name, project_name, event_date, phrase) VALUES (?, ?, ?, ?, ?)');
    const del = db.prepare('DELETE FROM weddings');
    const tx = db.transaction(() => {
      del.run();
      for (const w of weddings) {
        upsert.run(w.id, w.coupleName || '', w.projectName || '', w.eventDate || '', w.phrase || '');
      }
    });
    tx();
  }
}

async function getWeddingData(id) {
  if (isPostgres()) {
    const r = await db.query('SELECT data FROM wedding_data WHERE id = $1', [id]);
    return r.rows.length > 0 ? r.rows[0].data : null;
  }
  const r = db.prepare('SELECT data FROM wedding_data WHERE id = ?').get(id);
  return r ? JSON.parse(r.data) : null;
}

async function saveWeddingData(id, data) {
  const json = JSON.stringify(data);
  if (isPostgres()) {
    await db.query('INSERT INTO wedding_data (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET data = $2::jsonb', [id, json]);
  } else {
    db.prepare('INSERT OR REPLACE INTO wedding_data (id, data) VALUES (?, ?)').run(id, json);
  }
}

async function closeDB() {
  if (db) {
    if (isPostgres()) await db.end();
    else db.close();
  }
}

module.exports = { initDB, getWeddings, saveWeddings, getWeddingData, saveWeddingData, closeDB };
