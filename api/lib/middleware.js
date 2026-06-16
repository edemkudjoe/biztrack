const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// FIX: Prevent multiple client initializations in serverless environment
let supabaseInstance = null;

function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables missing');
  }
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return jwt.verify(token, secret);
}

const ALLOWED_TABLES = [
  'users',
  'attendance',
  'tasks',
  'costs',
  'revenue',
  'leaves',
  'advances',
  'promos',
  'complaints',
  'applicants',
  'job_postings',
  'apt_questions'
];

// Tables that employees can only read/write their own records
const EMPLOYEE_FILTERED = [
  'tasks',
  'attendance',
  'leaves',
  'advances',
  'promos',
  'complaints'
];

module.exports = {
  getSupabase,
  cors,
  verifyToken,
  ALLOWED_TABLES,
  EMPLOYEE_FILTERED
};
