const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getSupabase, cors } = require('./lib/middleware'); // JWT_SECRET removed from import

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { id, password, role } = req.body;
    
    // Ensure the secret exists before trying to sign a token
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Server configuration error: Missing JWT Secret' });

    if (role === 'employer') {
      const { data: user, error } = await getSupabase().from('users').select('*').eq('id', id).eq('role', 'employer').single();
      if (error || !user) return res.status(401).json({ error: 'Invalid credentials.' });
      
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials.' });
      
      const token = jwt.sign({ id: user.id, email: user.email || 'admin@biztrack.com', role: 'employer', name: user.name }, secret, { expiresIn: '8h' });
      return res.status(200).json({ token, user: { ...user, role: 'employer' } });
    }

    if (role === 'employee') {
      const { data: user, error } = await getSupabase().from('users').select('*').eq('id', id).eq('role', 'employee').single();
      if (error || !user) return res.status(401).json({ error: 'Invalid Employee ID or password.' });
      
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid Employee ID or password.' });
      
      const token = jwt.sign({ id: user.id, empId: user.empId, email: user.email, role: 'employee', name: user.name }, secret, { expiresIn: '8h' });
      return res.status(200).json({ token, user: { ...user, role: 'employee' } });
    }

    return res.status(400).json({ error: 'Invalid role.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
