const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Prevent multiple client initializations in serverless environment
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
  res.setHeader('Access-Control-Allow-Origin', 'https://biztrackv1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) throw new Error('No token');
  
  // Use process.env.JWT_SECRET dynamically to prevent undefined errors
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing from environment variables');
  
  return jwt.verify(token, secret);
}

const EMPLOYEE_FILTERED = ['attendance', 'leaves', 'advances', 'promos', 'complaints'];
const ALLOWED_TABLES = ['attendance','costs','revenue','tasks','leaves','advances','promos','complaints','applicants','job_postings','settings','apt_questions','benefits'];

// Notice: We NO LONGER export JWT_SECRET here.
module.exports = { getSupabase, cors, verifyToken, EMPLOYEE_FILTERED, ALLOWED_TABLES };
