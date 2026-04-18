// api/[...route].js
// BizTrack – Catch-all API handler
// All /api/* requests route here, sharing a single module-level store.
// ⚠ For production: replace store with a real database (Supabase, PlanetScale, etc.)

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'biztrack_jwt_secret_2025_change_me';

// ───────────────────────────── SEEDED STORE ─────────────────────────────────
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function findUser(id, password, role) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('password', password)
    .eq('role', role)
    .single();
    
  return data;
}

// ───────────────────────────── HELPERS ──────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function verifyToken(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  try { return jwt.verify(h.slice(7), JWT_SECRET); }
  catch { return null; }
}

function safe(user) {
  const { password: _p, ...u } = user;
  return u;
}

// ───────────────────────────── ROUTE HANDLERS ────────────────────────────────

// POST /api/auth  →  { id, password, role }  →  { token, user }
function handleAuth(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id = '', password = '', role = '' } = req.body || {};
  const user = store.users.find(
    u => u.id === id.trim() && u.password === password && u.role === role && u.active !== false
  );

  if (!user) return res.status(401).json({ error: 'Invalid credentials. Please check your ID, password and role.' });

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '10h' });
  return res.status(200).json({ token, user: safe(user) });
}

// GET  /api/users          →  list employees  (employer only)
// POST /api/users          →  create employee (employer only)
// PUT  /api/users/:id      →  update employee (employer only)
// DELETE /api/users/:id    →  deactivate      (employer only)
function handleUsers(req, res, parts) {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
  if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });

  const userId = parts[1]; // may be undefined

  if (req.method === 'GET') {
    return res.status(200).json({
      users: store.users.filter(u => u.role === 'employee' && u.active !== false).map(safe)
    });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (!body.id || !body.password) return res.status(400).json({ error: 'Employee ID and password are required' });
    if (store.users.find(u => u.id === body.id)) return res.status(409).json({ error: 'Employee ID already exists' });
    const newUser = { ...body, role: 'employee', active: true };
    store.users.push(newUser);
    return res.status(201).json({ user: safe(newUser) });
  }

  if (req.method === 'PUT' && userId) {
    const idx = store.users.findIndex(u => u.id === userId);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    store.users[idx] = { ...store.users[idx], ...(req.body || {}) };
    return res.status(200).json({ user: safe(store.users[idx]) });
  }

  if (req.method === 'DELETE' && userId) {
    const idx = store.users.findIndex(u => u.id === userId);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    store.users[idx].active = false;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// GET /api/credentials — returns login credentials list (employer only, for display)
function handleCredentials(req, res) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });
  const list = store.users
    .filter(u => u.role === 'employee' && u.active !== false)
    .map(u => ({ id: u.id, name: u.name, password: u.password }));
  return res.status(200).json({ credentials: list });
}

// ───────────────────────────── MAIN HANDLER ──────────────────────────────────
module.exports = function handler(req, res) {
  seed();
  cors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = Array.isArray(req.query.route) ? req.query.route : [req.query.route].filter(Boolean);
  const route = parts[0];

  switch (route) {
    case 'auth':        return handleAuth(req, res);
    case 'users':       return handleUsers(req, res, parts);
    case 'credentials': return handleCredentials(req, res);
    default:            return res.status(404).json({ error: `Route '${route}' not found` });
  }
};
