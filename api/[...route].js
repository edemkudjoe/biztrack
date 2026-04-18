const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ─── BULLETPROOF ENV VARS ───
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const JWT_SECRET   = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !JWT_SECRET) {
  console.error('[BizTrack] FATAL: Missing env vars.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables employees can only see their own rows in
const EMPLOYEE_FILTERED = ['attendance', 'leaves', 'advances', 'promos', 'complaints'];
// All tables exposed through the generic /api/data/:table endpoint
const ALLOWED_TABLES = [
  'attendance', 'costs', 'revenue', 'inventory', 'tasks',
  'leaves', 'advances', 'promos', 'complaints', 'applicants'
];

// ─── HELPERS ───
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Cache-Control', 'no-store');
}

function safe(user) {
  if (!user) return null;
  const { password, ...u } = user;
  return u;
}

// ─── FIX #3: JWT verification helper used on all protected routes ───
function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, JWT_SECRET);
}

// ═══════════════════════════════════════════════════
// ─── AUTH  (POST /api/auth) ───
// ═══════════════════════════════════════════════════
async function handleAuth(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, password, role } = req.body || {};
  if (!id || !password || !role) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', role)
    .eq('active', true)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // ─── FIX #2: bcrypt password verification ───
  // Supports both hashed passwords (new) and plain-text (legacy).
  // On a successful plain-text login, the password is automatically
  // re-hashed so future logins use bcrypt.
  const isHashed = user.password && user.password.startsWith('$2');
  let passwordValid = false;

  if (isHashed) {
    passwordValid = await bcrypt.compare(password, user.password);
  } else {
    // Legacy plain-text comparison
    passwordValid = (user.password === password);
    if (passwordValid) {
      // Auto-migrate: hash and save for next login
      const hashed = await bcrypt.hash(password, 10);
      await supabase.from('users').update({ password: hashed }).eq('id', user.id);
    }
  }

  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '10h' }
  );

  return res.status(200).json({ token, user: safe(user) });
}

// ═══════════════════════════════════════════════════
// ─── USERS  (GET|POST|PUT|DELETE /api/users[/:id]) ───
// ═══════════════════════════════════════════════════
async function handleUsers(req, res, parts) {
  // ─── FIX #3: every user route requires a valid JWT ───
  let decoded;
  try { decoded = verifyToken(req); }
  catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }

  const userId = parts[1];

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users').select('*').eq('active', true);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ users: data.map(safe) });
  }

  // Only employers may create, edit, or remove users
  if (decoded.role !== 'employer') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'POST') {
    const body = { ...req.body };
    // ─── FIX #2: hash password on creation ───
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    body.active = true;
    const { data, error } = await supabase
      .from('users').insert([body]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ user: safe(data) });
  }

  if (req.method === 'PUT' && userId) {
    const body = { ...req.body };
    // ─── FIX #2: hash password if being changed ───
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const { data, error } = await supabase
      .from('users').update(body).eq('id', userId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user: safe(data) });
  }

  if (req.method === 'DELETE' && userId) {
    // Soft-delete: set active = false
    await supabase.from('users').update({ active: false }).eq('id', userId);
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}

// ═══════════════════════════════════════════════════════════════
// ─── GENERIC DATA  (GET|POST|PUT|DELETE /api/data/:table[/:id]) ───
// ═══════════════════════════════════════════════════════════════
async function handleData(req, res, parts) {
  let decoded;
  try { decoded = verifyToken(req); }
  catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }

  const table    = parts[1];
  const recordId = parts[2]; // undefined for list/create, 'bulk' for batch ops

  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(404).json({ error: `Table "${table}" not found` });
  }

  const isEmployee = decoded.role === 'employee';
  const isFiltered = EMPLOYEE_FILTERED.includes(table);

  // ── GET: list records ──
  if (req.method === 'GET') {
    let query = supabase.from(table).select('*').order('created_at', { ascending: false });
    // Employees only see their own rows for sensitive tables
    if (isEmployee && isFiltered) {
      query = query.eq('empId', decoded.id);
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ records: data });
  }

  // ── POST: insert one or bulk-replace ──
  if (req.method === 'POST') {
    // Bulk replace: delete all existing rows then insert new batch
    if (recordId === 'bulk') {
      if (isEmployee) return res.status(403).json({ error: 'Forbidden' });
      const records = req.body.records || [];
      // Delete using a condition that matches all rows (id is never null)
      await supabase.from(table).delete().not('id', 'is', null);
      if (records.length > 0) {
        const { error } = await supabase.from(table).insert(records);
        if (error) return res.status(400).json({ error: error.message });
      }
      return res.status(200).json({ success: true });
    }

    const body = { ...req.body };
    // Stamp the logged-in employee's identity for filtered tables
    if (isEmployee && isFiltered) {
      body.empId   = decoded.id;
      body.empName = decoded.name;
    }
    body.created_at = new Date().toISOString();
    const { data, error } = await supabase.from(table).insert([body]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ record: data });
  }

  // ── PUT: update one record by ID ──
  if (req.method === 'PUT' && recordId && recordId !== 'bulk') {
    // Employees cannot approve/reject their own requests
    if (isEmployee && ['leaves', 'advances', 'promos'].includes(table)) {
      const s = req.body.status;
      if (s && s !== 'pending') {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    const { data, error } = await supabase
      .from(table).update(req.body).eq('id', recordId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ record: data });
  }

  // ── DELETE: remove one record by ID ──
  if (req.method === 'DELETE' && recordId) {
    if (isEmployee) return res.status(403).json({ error: 'Forbidden' });
    const { error } = await supabase.from(table).delete().eq('id', recordId);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}

// ═══════════════════════════════════════════════════════
// ─── CHANGE PASSWORD  (POST /api/change-password) ───
// ─── FIX #1 & #10: Both admin and employee password ───
// ─── changes now actually work and persist to Supabase ───
// ═══════════════════════════════════════════════════════
async function handleChangePassword(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let decoded;
  try { decoded = verifyToken(req); }
  catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const { data: user } = await supabase
    .from('users').select('*').eq('id', decoded.id).single();
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Verify current password (supports both hashed and legacy plain-text)
  const isHashed = user.password && user.password.startsWith('$2');
  const valid = isHashed
    ? await bcrypt.compare(currentPassword, user.password)
    : user.password === currentPassword;

  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await supabase.from('users').update({ password: hashed }).eq('id', decoded.id);

  return res.status(200).json({ success: true });
}

// ═══════════════════════════════════════
// ─── MAIN ROUTER ───
// ═══════════════════════════════════════
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = Array.isArray(req.query.route)
    ? req.query.route
    : [req.query.route].filter(Boolean);
  const route = parts[0];

  try {
    switch (route) {
      case 'auth':            return await handleAuth(req, res);
      case 'users':           return await handleUsers(req, res, parts);
      case 'data':            return await handleData(req, res, parts);
      case 'change-password': return await handleChangePassword(req, res);
      default:                return res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    console.error('[BizTrack API Error]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
