const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ─── ENV VARS ───
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const JWT_SECRET  = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !JWT_SECRET) {
  console.error('[BizTrack] FATAL: Missing env vars.');
}

let _supabase;
function getSupabase() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase env vars (SUPABASE_URL, SUPABASE_ANON_KEY) are not set in Vercel.');
    }
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

const EMPLOYEE_FILTERED = ['attendance', 'leaves', 'advances', 'promos', 'complaints'];
const ALLOWED_TABLES = [
  'attendance', 'costs', 'revenue', 'inventory', 'tasks',
  'leaves', 'advances', 'promos', 'complaints', 'applicants'
];

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

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, JWT_SECRET);
}

async function handleAuth(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, password, role } = req.body || {};
  if (!id || !password || !role) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  const { data: user, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', role)
    .eq('active', true)
    .single();
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const isHashed = user.password && user.password.startsWith('$2');
  let passwordValid = false;
  if (isHashed) {
    passwordValid = await bcrypt.compare(password, user.password);
  } else {
    passwordValid = (user.password === password);
    if (passwordValid) {
      const hashed = await bcrypt.hash(password, 10);
      await getSupabase().from('users').update({ password: hashed }).eq('id', user.id);
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

async function handleUsers(req, res, parts) {
  let decoded;
  try { decoded = verifyToken(req); }
  catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }
  const userId = parts[1];
  if (decoded.role !== 'employer') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method === 'GET') {
    const { data, error } = await getSupabase()
      .from('users').select('*').eq('active', true);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ users: data.map(safe) });
  }
  if (req.method === 'POST') {
    const body = { ...req.body };
    if (body.password) body.password = await bcrypt.hash(body.password, 10);
    body.active = true;
    const { data, error } = await getSupabase()
      .from('users').insert([body]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ user: safe(data) });
  }
  if (req.method === 'PUT' && userId) {
    const body = { ...req.body };
    if (body.password) body.password = await bcrypt.hash(body.password, 10);
    const { data, error } = await getSupabase()
      .from('users').update(body).eq('id', userId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user: safe(data) });
  }
  if (req.method === 'DELETE' && userId) {
    await getSupabase().from('users').update({ active: false }).eq('id', userId);
    return res.status(200).json({ success: true });
  }
  return res.status(405).end();
}

async function handleData(req, res, parts) {
  let decoded;
  try { decoded = verifyToken(req); }
  catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }
  const table    = parts[1];
  const recordId = parts[2];
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(404).json({ error: `Table "${table}" not found` });
  }
  const isEmployee = decoded.role === 'employee';
  const isFiltered = EMPLOYEE_FILTERED.includes(table);
  if (req.method === 'GET') {
    let query = getSupabase().from(table).select('*').order('created_at', { ascending: false });
    if (isEmployee && isFiltered) query = query.eq('empId', decoded.id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ records: data });
  }
  if (req.method === 'POST') {
    if (recordId === 'bulk') {
      if (isEmployee) return res.status(403).json({ error: 'Forbidden' });
      const records = req.body.records || [];
      await getSupabase().from(table).delete().not('id', 'is', null);
      if (records.length > 0) {
        const { error } = await getSupabase().from(table).insert(records);
        if (error) return res.status(400).json({ error: error.message });
      }
      return res.status(200).json({ success: true });
    }
    const body = { ...req.body };
    if (isEmployee && isFiltered) {
      body.empId   = decoded.id;
      body.empName = decoded.name;
    }
    body.created_at = new Date().toISOString();
    const { data, error } = await getSupabase().from(table).insert([body]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ record: data });
  }
  if (req.method === 'PUT' && recordId && recordId !== 'bulk') {
    if (isEmployee && ['leaves', 'advances', 'promos'].includes(table)) {
      const s = req.body.status;
      if (s && s !== 'pending') return res.status(403).json({ error: 'Forbidden' });
    }
    const { data, error } = await getSupabase()
      .from(table).update(req.body).eq('id', recordId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ record: data });
  }
  if (req.method === 'DELETE' && recordId) {
    if (isEmployee) return res.status(403).json({ error: 'Forbidden' });
    const { error } = await getSupabase().from(table).delete().eq('id', recordId);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }
  return res.status(405).end();
}

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
  const { data: user } = await getSupabase()
    .from('users').select('*').eq('id', decoded.id).single();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const isHashed = user.password && user.password.startsWith('$2');
  const valid = isHashed
    ? await bcrypt.compare(currentPassword, user.password)
    : user.password === currentPassword;
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await getSupabase().from('users').update({ password: hashed }).eq('id', decoded.id);
  return res.status(200).json({ success: true });
}

// ═══════════════════════════════════════════════════
// ─── SETTINGS  (GET|POST /api/settings) ───
// ═══════════════════════════════════════════════════
async function handleSettings(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await getSupabase()
      .from('settings').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const obj = {};
    data.forEach(row => { obj[row.key] = row.value; });
    return res.status(200).json({ settings: obj });
  }

  if (req.method === 'POST') {
    let decoded;
    try { decoded = verifyToken(req); }
    catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }
    if (decoded.role !== 'employer') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updates = req.body || {};
    for (const [key, value] of Object.entries(updates)) {
      await getSupabase()
        .from('settings')
        .upsert({ key, value: String(value), updated_at: new Date().toISOString() });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}

// ═══════════════════════════════════════
// ─── MAIN ROUTER ───
// ═══════════════════════════════════════
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

// Vercel names the catch-all param '...route' (with dots), not 'route'
  const catchAll = req.query['...route'] || req.query.route;
  let parts;
  if (!catchAll) {
    parts = [];
  } else if (Array.isArray(catchAll)) {
    parts = catchAll;
  } else {
    parts = catchAll.split('/').filter(Boolean);
  }
  const route = parts[0];

  try {
    switch (route) {
      case 'auth':            return await handleAuth(req, res);
      case 'users':           return await handleUsers(req, res, parts);
      case 'data':            return await handleData(req, res, parts);
      case 'settings':        return await handleSettings(req, res);
      case 'change-password': return await handleChangePassword(req, res);
      default:                return res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    console.error('[BizTrack API Error]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
