const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db.cjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'wedding-planner-secret-key-change-in-production';

app.use(express.json({ limit: '50mb' }));

// ---- JWT Middleware ----
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Token inválido' }); }
}

// ---- Auth Routes ----
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Preencha todos os campos' });
    if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    const existing = await db.findUserByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email já cadastrado' });
    const id = uuidv4();
    await db.createUser(id, name, email, password);
    const token = jwt.sign({ id, name, email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id, name, email } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro no servidor' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Preencha todos os campos' });
    const user = await db.verifyPassword(email, password);
    if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' });
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro no servidor' }); }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch { res.status(500).json({ error: 'Erro no servidor' }); }
});

// ---- Helper: check if user can access project ----
async function checkAccess(projectId, userId) {
  const perm = await db.getPermission(projectId, userId);
  if (perm) return perm;
  // Also check ownership via user_id column
  const wedding = await db.getUserWeddings(userId);
  const owned = wedding.find(w => w.id === projectId);
  if (owned) return { permission: 'edit' };
  return null;
}

// ---- Wedding Routes (require auth) ----
app.get('/api/weddings', authMiddleware, async (req, res) => {
  try {
    const weddings = await db.getUserWeddings(req.user.id);
    res.json(weddings);
  } catch (err) { console.error(err); res.json([]); }
});

app.post('/api/weddings', authMiddleware, async (req, res) => {
  try {
    const { weddings } = req.body; // Accept { weddings: [...] } or array directly
    const list = Array.isArray(req.body) ? req.body : (weddings || []);
    for (const w of list) {
      // Ensure each wedding has an id
      if (!w.id) w.id = uuidv4();
      await db.upsertWedding(w, req.user.id);
      // Auto-grant edit permission to creator
      const existing = await db.getPermission(w.id, req.user.id);
      if (!existing) {
        await db.addPermission(uuidv4(), w.id, req.user.id, 'edit', req.user.id);
      }
    }
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao salvar' }); }
});

app.delete('/api/weddings/:id', authMiddleware, async (req, res) => {
  try {
    const access = await checkAccess(req.params.id, req.user.id);
    if (!access || access.permission === 'view') return res.status(403).json({ error: 'Sem permissão' });
    await db.deleteWedding(req.params.id);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao deletar' }); }
});

app.get('/api/wedding-data/:id', authMiddleware, async (req, res) => {
  try {
    const access = await checkAccess(req.params.id, req.user.id);
    if (!access) return res.status(403).json({ error: 'Sem permissão' });
    const data = await db.getWeddingData(req.params.id);
    res.json(data);
  } catch (err) { console.error(err); res.json(null); }
});

app.post('/api/wedding-data/:id', authMiddleware, async (req, res) => {
  try {
    const access = await checkAccess(req.params.id, req.user.id);
    if (!access) return res.status(403).json({ error: 'Sem permissão' });
    if (access.permission === 'view') return res.status(403).json({ error: 'Apenas visualização' });
    await db.saveWeddingData(req.params.id, req.body);
    io.to(`project:${req.params.id}`).emit('data:updated', { data: req.body, updatedBy: req.user.id });
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao salvar' }); }
});

// ---- Share Routes ----
app.post('/api/share/create', authMiddleware, async (req, res) => {
  try {
    const { projectId, permission } = req.body;
    const access = await checkAccess(projectId, req.user.id);
    if (!access || access.permission === 'view') return res.status(403).json({ error: 'Sem permissão' });
    const token = uuidv4();
    await db.createShareLink(uuidv4(), projectId, token, permission || 'view', req.user.id);
    const host = req.get('host');
    res.json({ token, link: `${req.protocol}://${host}/shared/${token}` });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao criar link' }); }
});

app.get('/api/share/accept/:token', authMiddleware, async (req, res) => {
  try {
    const link = await db.findShareLink(req.params.token);
    if (!link) return res.status(404).json({ error: 'Link não encontrado ou expirado' });
    const existing = await db.getPermission(link.project_id, req.user.id);
    if (!existing) {
      await db.addPermission(uuidv4(), link.project_id, req.user.id, link.permission, link.created_by);
    }
    res.json({ projectId: link.project_id, permission: link.permission });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao acessar link' }); }
});

app.get('/api/share/links/:projectId', authMiddleware, async (req, res) => {
  try {
    const access = await checkAccess(req.params.projectId, req.user.id);
    if (!access) return res.status(403).json({ error: 'Sem permissão' });
    const links = await db.getProjectShareLinks(req.params.projectId);
    res.json(links);
  } catch { res.json([]); }
});

app.delete('/api/share/links/:id', authMiddleware, async (req, res) => {
  try {
    await db.deleteShareLink(req.params.id);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Erro ao deletar' }); }
});

app.get('/api/share/project-users/:projectId', authMiddleware, async (req, res) => {
  try {
    const access = await checkAccess(req.params.projectId, req.user.id);
    if (!access) return res.status(403).json({ error: 'Sem permissão' });
    const users = await db.getProjectUsers(req.params.projectId);
    res.json(users);
  } catch { res.json([]); }
});

// ---- Socket.IO ----
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Token não fornecido'));
  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { next(new Error('Token inválido')); }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket conectado: ${socket.user.name} (${socket.user.id})`);

  socket.on('join:project', async (projectId) => {
    const access = await checkAccess(projectId, socket.user.id);
    if (!access) return socket.emit('error', 'Sem permissão para este projeto');
    socket.join(`project:${projectId}`);
    socket.currentProject = projectId;
    io.to(`project:${projectId}`).emit('user:joined', { userId: socket.user.id, name: socket.user.name });
  });

  socket.on('leave:project', (projectId) => {
    socket.leave(`project:${projectId}`);
    io.to(`project:${projectId}`).emit('user:left', { userId: socket.user.id, name: socket.user.name });
    if (socket.currentProject === projectId) socket.currentProject = null;
  });

  socket.on('disconnect', () => {
    if (socket.currentProject) {
      io.to(`project:${socket.currentProject}`).emit('user:left', { userId: socket.user.id, name: socket.user.name });
    }
    console.log(`🔌 Socket desconectado: ${socket.user.name}`);
  });
});

// ---- Static files ----
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ---- Start ----
async function start() {
  try {
    await db.initDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
      if (process.env.DATABASE_URL) console.log('📦 Usando PostgreSQL');
      else console.log('📦 Usando SQLite');
    });
  } catch (err) { console.error('Erro ao iniciar:', err); process.exit(1); }
}
start();
