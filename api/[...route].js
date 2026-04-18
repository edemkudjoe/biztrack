// api/[...route].js
// BizTrack – Catch-all API handler
// All /api/* requests route here, sharing a single module-level store.
// ⚠ For production: replace store with a real database (Supabase, PlanetScale, etc.)

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'biztrack_jwt_secret_2025_change_me';

// ───────────────────────────── SEEDED STORE ─────────────────────────────────
let _seeded = false;
const store = { users: [] };

function seed() {
  if (_seeded) return;
  _seeded = true;

  store.users = [
    // ── EMPLOYER ──
    {
      id: process.env.ADMIN_USER || 'admin',
      role: 'employer',
      name: 'Admin User',
      email: 'admin@biztrack.com',
      password: process.env.ADMIN_PASS || 'admin123',
      initials: 'AD',
      active: true,
    },

    // ── EMPLOYEES ──
    {
      id: 'EMP001', role: 'employee', name: 'James Mensah',
      email: 'james@biztrack.com', password: 'emp123', initials: 'JM',
      roleTitle: 'Sales Manager', dept: 'Sales', hourlyRate: 25,
      joinDate: '2022-01-15', active: true,
    },
    {
      id: 'EMP002', role: 'employee', name: 'Abena Owusu',
      email: 'abena@biztrack.com', password: 'emp123', initials: 'AO',
      roleTitle: 'Accountant', dept: 'Finance', hourlyRate: 22,
      joinDate: '2021-06-10', active: true,
    },
    {
      id: 'EMP003', role: 'employee', name: 'Kofi Asante',
      email: 'kofi@biztrack.com', password: 'emp456', initials: 'KA',
      roleTitle: 'Warehouse Staff', dept: 'Logistics', hourlyRate: 18,
      joinDate: '2023-03-01', active: true,
    },
    {
      id: 'EMP004', role: 'employee', name: 'Esi Boateng',
      email: 'esi@biztrack.com', password: 'emp456', initials: 'EB',
      roleTitle: 'HR Officer', dept: 'Human Resources', hourlyRate: 20,
      joinDate: '2020-11-20', active: true,
    },
    {
      id: 'EMP005', role: 'employee', name: 'Kwame Osei',
      email: 'kwame@biztrack.com', password: 'emp789', initials: 'KO',
      roleTitle: 'Marketing Officer', dept: 'Marketing', hourlyRate: 21,
      joinDate: '2023-07-15', active: true,
    },
    {
      id: 'EMP006', role: 'employee', name: 'Akosua Darko',
      email: 'akosua@biztrack.com', password: 'emp789', initials: 'AD',
      roleTitle: 'Customer Service Rep', dept: 'Operations', hourlyRate: 17,
      joinDate: '2024-01-08', active: true,
    },
    {
      id: 'EMP007', role: 'employee', name: 'Yaw Amponsah',
      email: 'yaw@biztrack.com', password: 'emp321', initials: 'YA',
      roleTitle: 'IT Support', dept: 'Technology', hourlyRate: 23,
      joinDate: '2023-11-01', active: true,
    },
    {
      id: 'EMP008', role: 'employee', name: 'Adwoa Frimpong',
      email: 'adwoa@biztrack.com', password: 'emp321', initials: 'AF',
      roleTitle: 'Operations Analyst', dept: 'Operations', hourlyRate: 19,
      joinDate: '2024-03-20', active: true,
    },
    {
      id: 'EMP009', role: 'employee', name: 'Deladem Avudzega',
      email: 'dela@biztrack.com', password: '7474', initials: 'DA',
      roleTitle: 'Branch Supervisor', dept: 'Sales', hourlyRate: 25,
      joinDate: '2022-01-15', active: true,
    },
  ];
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
