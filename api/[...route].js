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
// ═══════════════════════════════════════════════════
// ─── PORTAL SIGNUP (POST /api/portal-signup) ───
// ═══════════════════════════════════════════════════
async function handlePortalSignup(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, password, securityQuestion, securityAnswer } = req.body || {};
  if (!name || !email || !password || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // Check if email already exists
  const { data: existing } = await getSupabase()
    .from('applicants').select('id').eq('email', email).eq('portalAccount', true).single();
  if (existing) return res.status(400).json({ error: 'An account with this email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
  const { data, error } = await getSupabase()
    .from('applicants')
    .insert([{ name, email, password: hashed, securityQuestion, securityAnswer: hashedAnswer, portalAccount: true, appliedDate: new Date().toISOString().split('T')[0] }])
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  const token = jwt.sign({ id: data.id, email: data.email, type: 'portal' }, JWT_SECRET, { expiresIn: '10h' });
  const { password: _, securityAnswer: __, ...safe } = data;
  return res.status(201).json({ token, applicant: safe });
}

// ═══════════════════════════════════════════════════
// ─── PORTAL LOGIN (POST /api/portal-login) ───
// ═══════════════════════════════════════════════════
async function handlePortalLogin(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const { data: applicant, error } = await getSupabase()
    .from('applicants').select('*').eq('email', email).eq('portalAccount', true).single();
  if (error || !applicant) return res.status(401).json({ error: 'Invalid email or password' });
  const valid = await bcrypt.compare(password, applicant.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: applicant.id, email: applicant.email, type: 'portal' }, JWT_SECRET, { expiresIn: '10h' });
  const { password: _, securityAnswer: __, ...safe } = applicant;
  return res.status(200).json({ token, applicant: safe });
}

// ═══════════════════════════════════════════════════
// ─── PORTAL RESET (POST /api/portal-reset) ───
// ═══════════════════════════════════════════════════
async function handlePortalReset(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, securityAnswer, newPassword, step } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });
  const { data: applicant } = await getSupabase()
    .from('applicants').select('*').eq('email', email).eq('portalAccount', true).single();
  if (!applicant) return res.status(404).json({ error: 'No account found with this email' });
  if (step === 'verify') {
    const valid = await bcrypt.compare(securityAnswer.toLowerCase().trim(), applicant.securityAnswer);
    if (!valid) return res.status(401).json({ error: 'Incorrect answer' });
    return res.status(200).json({ success: true, question: applicant.securityQuestion });
  }
  if (step === 'reset') {
    const answerValid = await bcrypt.compare(securityAnswer.toLowerCase().trim(), applicant.securityAnswer);
    if (!answerValid) return res.status(401).json({ error: 'Incorrect answer' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await getSupabase().from('applicants').update({ password: hashed }).eq('id', applicant.id);
    return res.status(200).json({ success: true });
  }
  if (step === 'question') {
    return res.status(200).json({ question: applicant.securityQuestion });
  }
  return res.status(400).json({ error: 'Invalid step' });
}

// ═══════════════════════════════════════════════════
// ─── USER RESET (POST /api/user-reset) ───
// ═══════════════════════════════════════════════════
async function handleUserReset(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, name, phone, newPassword, step } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Employee ID required' });
  const { data: user } = await getSupabase()
    .from('users').select('*').eq('id', id).single();
  if (!user) return res.status(404).json({ error: 'No account found with this ID' });
  if (step === 'verify') {
    const nameMatch = user.name.toLowerCase().trim() === name.toLowerCase().trim();
    const phoneMatch = !user.phone || !phone || user.phone.replace(/\s/g,'') === phone.replace(/\s/g,'');
    if (!nameMatch || !phoneMatch) return res.status(401).json({ error: 'Details do not match our records' });
    return res.status(200).json({ success: true });
  }
  if (step === 'reset') {
    const nameMatch = user.name.toLowerCase().trim() === name.toLowerCase().trim();
    if (!nameMatch) return res.status(401).json({ error: 'Details do not match' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await getSupabase().from('users').update({ password: hashed }).eq('id', id);
    return res.status(200).json({ success: true });
  }
  return res.status(400).json({ error: 'Invalid step' });
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
      case 'portal-signup':   return await handlePortalSignup(req, res);
      case 'portal-login':    return await handlePortalLogin(req, res);
      case 'portal-reset':    return await handlePortalReset(req, res);
      case 'user-reset':      return await handleUserReset(req, res);
      default:                return res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    console.error('[BizTrack API Error]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
