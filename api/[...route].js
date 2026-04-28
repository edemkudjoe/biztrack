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
  if (req.method === 'GET' && table === 'job_postings') { /* Public */ } 
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
    if (route === 'data') return await handleData(req, res, parts);
    
    if (route === 'portal-signup') {
      const { name, email, password, securityQuestion, securityAnswer } = req.body;
      const hashed = await bcrypt.hash(password, 10);
      const { data, error } = await getSupabase().from('applicants').insert([{ name, email, password: hashed, securityQuestion, securityAnswer, portalAccount: true, appliedDate: new Date().toISOString().split('T')[0] }]).select().single();
      if (error) return res.status(400).json({ error: error.message });
      const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET);
      return res.status(201).json({ token, applicant: data });
    }

    if (route === 'portal-login') {
      const { email, password } = req.body;
      const { data: user, error } = await getSupabase().from('applicants').select('*').eq('email', email).eq('portalAccount', true).single();
      if (error || !user) return res.status(401).json({ error: 'Invalid email or password' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid email or password' });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      return res.status(200).json({ token, applicant: user });
    }

    return res.status(404).end();
  } catch (err) { return res.status(500).json({ error: err.message }); }
};
