const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Strictly use the Vercel-generated keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: Standardize response headers
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
}

// Helper: Hide passwords from frontend responses
function safe(user) {
  if (!user) return null;
  const { password, ...u } = user;
  return u;
}

// ─── ROUTE HANDLERS ───

async function handleAuth(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, password, role } = req.body;

  // Query Supabase for the user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('password', password)
    .eq('role', role)
    .eq('active', true)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found in database.' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '10h' });
  return res.status(200).json({ token, user: safe(user) });
}

async function handleUsers(req, res, parts) {
  const userId = parts[1];

  if (req.method === 'GET') {
    const { data: users } = await supabase.from('users').select('*').eq('active', true);
    return res.status(200).json({ users: users.map(safe) });
  }

  if (req.method === 'POST') {
    const body = req.body;
    const { data, error } = await supabase.from('users').insert([{ ...body, active: true }]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ user: safe(data) });
  }

  if (req.method === 'PUT' && userId) {
    const { data, error } = await supabase.from('users').update(req.body).eq('id', userId).select().single();
    return res.status(200).json({ user: safe(data) });
  }

  return res.status(405).end();
}

// ─── MAIN HANDLER ───
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = Array.isArray(req.query.route) ? req.query.route : [req.query.route].filter(Boolean);
  const route = parts[0];

  switch (route) {
    case 'auth':   return await handleAuth(req, res);
    case 'users':  return await handleUsers(req, res, parts);
    default:       return res.status(404).json({ error: 'Not found' });
  }
};
