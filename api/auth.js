const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getSupabase, cors, JWT_SECRET } = require('./lib/middleware');

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
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
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};