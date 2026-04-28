const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const JWT_SECRET  = process.env.JWT_SECRET;

let _supabase;
function getSupabase() {
  if (!_supabase) { _supabase = createClient(supabaseUrl, supabaseKey); }
  return _supabase;
}

const EMPLOYEE_FILTERED = ['attendance', 'leaves', 'advances', 'promos', 'complaints'];
const ALLOWED_TABLES = ['attendance', 'costs', 'revenue', 'inventory', 'tasks', 'leaves', 'advances', 'promos', 'complaints', 'applicants', 'job_postings'];

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) throw new Error('No token');
  return jwt.verify(token, JWT_SECRET);
}

async function handleData(req, res, parts) {
  const table = parts[1];
  const recordId = parts[2];
  if (!ALLOWED_TABLES.includes(table)) return res.status(404).end();

  let decoded = null;
  if (req.method === 'GET' && table === 'job_postings') { /* Public access */ }
  else {
    try { decoded = verifyToken(req); }
    catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }
  }

  if (req.method === 'GET') {
    let query = getSupabase().from(table).select('*').order('created_at', { ascending: false });
    if (decoded && decoded.role === 'employee' && EMPLOYEE_FILTERED.includes(table)) query = query.eq('empId', decoded.id);
    const { data, error } = await query;
    return error ? res.status(500).json({ error: error.message }) : res.status(200).json({ records: data });
  }

  if (req.method === 'POST') {
    const body = { ...req.body, created_at: new Date().toISOString() };
    const { data, error } = await getSupabase().from(table).insert([body]).select().single();
    return error ? res.status(400).json({ error: error.message }) : res.status(201).json({ record: data });
  }

  if (req.method === 'PUT' && recordId) {
    const { data, error } = await getSupabase().from(table).update(req.body).eq('id', recordId).select().single();
    return error ? res.status(400).json({ error: error.message }) : res.status(200).json({ record: data });
  }

  return res.status(405).end();
}

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const parts = (req.query['...route'] || []).filter(Boolean);
  const route = parts[0];

  try {

    // ── DATA CRUD ──
    if (route === 'data') return await handleData(req, res, parts);

    // ── AUTH (employer/employee login) ──
    if (route === 'auth') {
      const { id, password, role } = req.body;
      if (role === 'employer') {
        const adminId = process.env.ADMIN_ID || 'admin';
        const adminPw = process.env.ADMIN_PASSWORD || 'admin123';
        if (id !== adminId || password !== adminPw) return res.status(401).json({ error: 'Invalid credentials.' });
        const token = jwt.sign({ id: 'admin', email: 'admin@biztrack.com', role: 'employer', name: 'Admin' }, JWT_SECRET);
        return res.status(200).json({ token, user: { id: 'admin', name: 'Admin', email: 'admin@biztrack.com', role: 'employer', initials: 'AD' } });
      }
      if (role === 'employee') {
        const { data: user, error } = await getSupabase().from('users').select('*').eq('empId', id).single();
        if (error || !user) return res.status(401).json({ error: 'Invalid Employee ID or password.' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid Employee ID or password.' });
        const token = jwt.sign({ id: user.id, empId: user.empId, email: user.email, role: 'employee', name: user.name }, JWT_SECRET);
        return res.status(200).json({ token, user: { ...user, role: 'employee' } });
      }
      return res.status(400).json({ error: 'Invalid role.' });
    }

    // ── USERS (employer only) ──
    if (route === 'users') {
      const sub = parts[1];

      // GET /api/users/me — employee fetches own record
      if (req.method === 'GET' && sub === 'me') {
        const decoded = verifyToken(req);
        const { data, error } = await getSupabase().from('users').select('*').eq('id', decoded.id).single();
        if (error || !data) return res.status(404).json({ error: 'User not found.' });
        return res.status(200).json({ user: { ...data, role: 'employee' } });
      }

      // All other /users routes require employer role
      let decoded;
      try { decoded = verifyToken(req); } catch(e) { return res.status(401).json({ error: 'Unauthorized' }); }
      if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });

      // GET /api/users — list all employees
      if (req.method === 'GET') {
        const { data, error } = await getSupabase().from('users').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ users: data });
      }

      // POST /api/users — create new employee
      if (req.method === 'POST') {
        const { password, ...rest } = req.body;
        const hashed = await bcrypt.hash(password || 'emp123', 10);
        const { data, error } = await getSupabase().from('users').insert([{ ...rest, password: hashed, created_at: new Date().toISOString() }]).select().single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ user: data });
      }

      // PUT /api/users/:id — update employee
      if (req.method === 'PUT' && sub) {
        const { data, error } = await getSupabase().from('users').update(req.body).eq('id', sub).select().single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ user: data });
      }

      // DELETE /api/users/:id — remove employee
      if (req.method === 'DELETE' && sub) {
        const { error } = await getSupabase().from('users').delete().eq('id', sub);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true });
      }

      return res.status(405).end();
    }

    // ── SETTINGS ──
    if (route === 'settings') {
      let decoded;
      try { decoded = verifyToken(req); } catch(e) { return res.status(401).json({ error: 'Unauthorized' }); }

      if (req.method === 'GET') {
        const { data, error } = await getSupabase().from('settings').select('*').eq('key', 'attendance').single();
        if (error) return res.status(200).json({ settings: {} });
        return res.status(200).json({ settings: data.value || {} });
      }

      if (req.method === 'POST') {
        if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });
        const { error } = await getSupabase().from('settings').upsert({ key: 'attendance', value: req.body, updated_at: new Date().toISOString() });
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true });
      }

      return res.status(405).end();
    }

    // ── CHANGE PASSWORD ──
    if (route === 'change-password') {
      let decoded;
      try { decoded = verifyToken(req); } catch(e) { return res.status(401).json({ error: 'Unauthorized' }); }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both fields required.' });

      if (decoded.role === 'employer') {
        const adminPw = process.env.ADMIN_PASSWORD || 'admin123';
        if (currentPassword !== adminPw) return res.status(401).json({ error: 'Current password incorrect.' });
        // For employer, you'd update the env var — for now just acknowledge
        return res.status(200).json({ success: true });
      }

      const { data: user, error } = await getSupabase().from('users').select('*').eq('id', decoded.id).single();
      if (error || !user) return res.status(404).json({ error: 'User not found.' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await getSupabase().from('users').update({ password: hashed }).eq('id', decoded.id);
      return res.status(200).json({ success: true });
    }

    // ── PORTAL SIGNUP ──
    if (route === 'portal-signup') {
      const { name, email, password, securityQuestion, securityAnswer } = req.body;
      if (!name || !email || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      const { data: existing } = await getSupabase().from('applicants').select('id').eq('email', email).eq('portalAccount', true).single();
      if (existing) return res.status(400).json({ error: 'An account with this email already exists.' });
      const hashed = await bcrypt.hash(password, 10);
      const { data, error } = await getSupabase().from('applicants').insert([{
        name, email, password: hashed, securityQuestion, securityAnswer,
        portalAccount: true, appliedDate: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      }]).select().single();
      if (error) return res.status(400).json({ error: error.message });
      const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET);
      return res.status(201).json({ token, applicant: data });
    }

    // ── PORTAL LOGIN ──
    if (route === 'portal-login') {
      const { email, password } = req.body;
      const { data: user, error } = await getSupabase().from('applicants').select('*').eq('email', email).eq('portalAccount', true).single();
      if (error || !user) return res.status(401).json({ error: 'Invalid email or password.' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid email or password.' });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      return res.status(200).json({ token, applicant: user });
    }

    // ── PORTAL RESET ──
    if (route === 'portal-reset') {
      const { email, step, securityAnswer, newPassword } = req.body;
      if (step === 'question') {
        const { data: user, error } = await getSupabase().from('applicants').select('securityQuestion').eq('email', email).eq('portalAccount', true).single();
        if (error || !user) return res.status(404).json({ error: 'No account found with that email.' });
        return res.status(200).json({ question: user.securityQuestion });
      }
      if (step === 'reset') {
        const { data: user, error } = await getSupabase().from('applicants').select('*').eq('email', email).eq('portalAccount', true).single();
        if (error || !user) return res.status(404).json({ error: 'Account not found.' });
        const match = user.securityAnswer?.toLowerCase() === securityAnswer?.toLowerCase();
        if (!match) return res.status(401).json({ error: 'Incorrect security answer.' });
        const hashed = await bcrypt.hash(newPassword, 10);
        await getSupabase().from('applicants').update({ password: hashed }).eq('email', email);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Invalid step.' });
    }

    return res.status(404).end();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
