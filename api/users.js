const bcrypt = require('bcryptjs');
const { getSupabase, cors, verifyToken } = require('./lib/middleware');

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = (req.query['...route'] || []).filter(Boolean);
const urlParts = (req.url || '').split('?')[0].split('/').filter(Boolean);
const sub = parts[1] || urlParts[2];

  try {
    // GET /api/users/me — employee fetches own record
    if (req.method === 'GET' && sub === 'me') {
      const decoded = verifyToken(req);
      const { data, error } = await getSupabase().from('users').select('*').eq('id', decoded.id).single();
      if (error || !data) return res.status(404).json({ error: 'User not found.' });
      return res.status(200).json({ user: { ...data, role: 'employee' } });
    }

    // All other /users routes require employer role
    let decoded;
    try { decoded = verifyToken(req); } catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }
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
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
