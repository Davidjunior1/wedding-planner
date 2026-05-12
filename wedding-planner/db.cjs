const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;
let db;

async function initDB(retries = 5, delay = 2000) {
  if (DATABASE_URL) {
    const { Pool } = require('pg');
    db = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
    for (let i = 0; i < retries; i++) {
      try {
        await db.query(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT NOW());`);
        await db.query(`CREATE TABLE IF NOT EXISTS weddings (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), couple_name TEXT NOT NULL DEFAULT '', project_name TEXT DEFAULT '', event_date TEXT DEFAULT '', phrase TEXT DEFAULT '');`);
        await db.query(`CREATE TABLE IF NOT EXISTS wedding_data (id TEXT PRIMARY KEY REFERENCES weddings(id) ON DELETE CASCADE, data JSONB NOT NULL DEFAULT '{}');`);
        await db.query(`CREATE TABLE IF NOT EXISTS project_permissions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id), permission TEXT NOT NULL DEFAULT 'view', shared_by TEXT, created_at TEXT DEFAULT NOW(), UNIQUE(project_id, user_id));`);
        await db.query(`CREATE TABLE IF NOT EXISTS share_links (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, token TEXT UNIQUE NOT NULL, permission TEXT NOT NULL DEFAULT 'view', created_by TEXT, created_at TEXT DEFAULT NOW(), expires_at TEXT);`);
        console.log('📦 Conectado ao PostgreSQL');
        return;
      } catch (err) {
        console.error(`⏳ PostgreSQL tentativa ${i + 1}/${retries} falhou:`, err.message);
        if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
        else throw err;
      }
    }
  } else {
    const Database = require('better-sqlite3');
    const dbPath = path.join(__dirname, 'data', 'database.sqlite');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));`);
    db.exec(`CREATE TABLE IF NOT EXISTS weddings (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), couple_name TEXT NOT NULL DEFAULT '', project_name TEXT DEFAULT '', event_date TEXT DEFAULT '', phrase TEXT DEFAULT '');`);
    db.exec(`CREATE TABLE IF NOT EXISTS wedding_data (id TEXT PRIMARY KEY REFERENCES weddings(id) ON DELETE CASCADE, data TEXT NOT NULL DEFAULT '{}');`);
    db.exec(`CREATE TABLE IF NOT EXISTS project_permissions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id), permission TEXT NOT NULL DEFAULT 'view', shared_by TEXT, created_at TEXT DEFAULT (datetime('now')), UNIQUE(project_id, user_id));`);
    db.exec(`CREATE TABLE IF NOT EXISTS share_links (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES weddings(id) ON DELETE CASCADE, token TEXT UNIQUE NOT NULL, permission TEXT NOT NULL DEFAULT 'view', created_by TEXT, created_at TEXT DEFAULT (datetime('now')), expires_at TEXT);`);
    console.log('📦 Conectado ao SQLite');
  }
}

function isPostgres() { return !!DATABASE_URL; }

// ---- Users ----
async function createUser(id, name, email, password) {
  const hash = await bcrypt.hash(password, 10);
  if (isPostgres()) {
    await db.query('INSERT INTO users (id, name, email, password_hash) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING', [id, name, email, hash]);
  } else {
    db.prepare('INSERT OR IGNORE INTO users (id, name, email, password_hash) VALUES (?,?,?,?)').run(id, name, email, hash);
  }
}

async function findUserByEmail(email) {
  if (isPostgres()) {
    const r = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return r.rows[0] || null;
  }
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
}

async function findUserById(id) {
  if (isPostgres()) {
    const r = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
    return r.rows[0] || null;
  }
  return db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(id) || null;
}

async function verifyPassword(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;
  return { id: user.id, name: user.name, email: user.email };
}

// ---- Weddings (user-scoped) ----
async function getUserWeddings(userId) {
  if (isPostgres()) {
    const r = await db.query(
      `SELECT w.* FROM weddings w WHERE w.user_id = $1
       UNION
       SELECT w.* FROM weddings w JOIN project_permissions p ON p.project_id = w.id WHERE p.user_id = $1
       ORDER BY couple_name`,
      [userId]
    );
    return r.rows.map(w => ({ id: w.id, userId: w.user_id, name: w.couple_name, coupleName: w.couple_name, projectName: w.project_name, eventDate: w.event_date, phrase: w.phrase }));
  }
  const rows = db.prepare(
    `SELECT w.* FROM weddings w WHERE w.user_id = ?
     UNION
     SELECT w.* FROM weddings w JOIN project_permissions p ON p.project_id = w.id WHERE p.user_id = ?
     ORDER BY couple_name`
  ).all(userId, userId);
  return rows.map(w => ({ id: w.id, userId: w.user_id, name: w.couple_name, coupleName: w.couple_name, projectName: w.project_name, eventDate: w.event_date, phrase: w.phrase }));
}

async function upsertWedding(wedding, userId) {
  if (isPostgres()) {
    await db.query(
      'INSERT INTO weddings (id, user_id, couple_name, project_name, event_date, phrase) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET couple_name=$3, project_name=$4, event_date=$5, phrase=$6',
      [wedding.id, userId, wedding.coupleName || '', wedding.projectName || '', wedding.eventDate || '', wedding.phrase || '']
    );
  } else {
    db.prepare(
      'INSERT OR REPLACE INTO weddings (id, user_id, couple_name, project_name, event_date, phrase) VALUES (?,?,?,?,?,?)'
    ).run(wedding.id, userId, wedding.coupleName || '', wedding.projectName || '', wedding.eventDate || '', wedding.phrase || '');
  }
}

async function deleteWedding(id) {
  if (isPostgres()) {
    await db.query('DELETE FROM weddings WHERE id = $1', [id]);
  } else {
    db.prepare('DELETE FROM weddings WHERE id = ?').run(id);
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
    await db.query('INSERT INTO wedding_data (id, data) VALUES ($1,$2::jsonb) ON CONFLICT (id) DO UPDATE SET data = $2::jsonb', [id, json]);
  } else {
    db.prepare('INSERT OR REPLACE INTO wedding_data (id, data) VALUES (?,?)').run(id, json);
  }
}

// ---- Permissions ----
async function addPermission(id, projectId, userId, permission, sharedBy) {
  if (isPostgres()) {
    await db.query('INSERT INTO project_permissions (id, project_id, user_id, permission, shared_by) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (project_id, user_id) DO UPDATE SET permission=$4', [id, projectId, userId, permission, sharedBy]);
  } else {
    db.prepare('INSERT OR REPLACE INTO project_permissions (id, project_id, user_id, permission, shared_by) VALUES (?,?,?,?,?)').run(id, projectId, userId, permission, sharedBy);
  }
}

async function removePermission(projectId, userId) {
  if (isPostgres()) {
    await db.query('DELETE FROM project_permissions WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
  } else {
    db.prepare('DELETE FROM project_permissions WHERE project_id = ? AND user_id = ?').run(projectId, userId);
  }
}

async function getPermission(projectId, userId) {
  if (isPostgres()) {
    const r = await db.query('SELECT * FROM project_permissions WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
    return r.rows[0] || null;
  }
  return db.prepare('SELECT * FROM project_permissions WHERE project_id = ? AND user_id = ?').get(projectId, userId) || null;
}

async function getProjectUsers(projectId) {
  if (isPostgres()) {
    const r = await db.query('SELECT p.*, u.name, u.email FROM project_permissions p JOIN users u ON u.id = p.user_id WHERE p.project_id = $1', [projectId]);
    return r.rows;
  }
  return db.prepare('SELECT p.*, u.name, u.email FROM project_permissions p JOIN users u ON u.id = p.user_id WHERE p.project_id = ?').all(projectId);
}

// ---- Share Links ----
async function createShareLink(id, projectId, token, permission, createdBy) {
  if (isPostgres()) {
    await db.query('INSERT INTO share_links (id, project_id, token, permission, created_by) VALUES ($1,$2,$3,$4,$5)', [id, projectId, token, permission, createdBy]);
  } else {
    db.prepare('INSERT INTO share_links (id, project_id, token, permission, created_by) VALUES (?,?,?,?,?)').run(id, projectId, token, permission, createdBy);
  }
}

async function findShareLink(token) {
  if (isPostgres()) {
    const r = await db.query('SELECT * FROM share_links WHERE token = $1', [token]);
    return r.rows[0] || null;
  }
  return db.prepare('SELECT * FROM share_links WHERE token = ?').get(token) || null;
}

async function getProjectShareLinks(projectId) {
  if (isPostgres()) {
    const r = await db.query('SELECT * FROM share_links WHERE project_id = $1', [projectId]);
    return r.rows;
  }
  return db.prepare('SELECT * FROM share_links WHERE project_id = ?').all(projectId);
}

async function deleteShareLink(id) {
  if (isPostgres()) {
    await db.query('DELETE FROM share_links WHERE id = $1', [id]);
  } else {
    db.prepare('DELETE FROM share_links WHERE id = ?').run(id);
  }
}

async function closeDB() {
  if (db) { if (isPostgres()) await db.end(); else db.close(); }
}

module.exports = {
  initDB, closeDB,
  createUser, findUserByEmail, findUserById, verifyPassword,
  getUserWeddings, upsertWedding, deleteWedding, getWeddingData, saveWeddingData,
  addPermission, removePermission, getPermission, getProjectUsers,
  createShareLink, findShareLink, getProjectShareLinks, deleteShareLink,
};
