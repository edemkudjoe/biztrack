const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

let _supabase;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  }
  return _supabase;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://biztrackv1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) throw new Error('No token');
  return jwt.verify(token, JWT_SECRET);
}

const EMPLOYEE_FILTERED = ['attendance', 'leaves', 'advances', 'promos', 'complaints'];
const ALLOWED_TABLES = ['attendance','costs','revenue','tasks','leaves','advances','promos','complaints','applicants','job_postings','settings','apt_questions','benefits'];

module.exports = { getSupabase, cors, verifyToken, JWT_SECRET, EMPLOYEE_FILTERED, ALLOWED_TABLES };
