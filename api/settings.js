const bcrypt = require('bcryptjs');
const { getSupabase, cors, verifyToken } = require('./lib/middleware');
module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const parts = (req.query['...route'] || []).filter(Boolean);
  const urlParts = (req.url || '').split('?')[0].split('/').filter(Boolean);
  const route = parts[0] || urlParts[1];
  try {
    let decoded;
    try { decoded = verifyToken(req); } catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }
    // ── SETTINGS ──
    if (route === 'settings') {
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
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both fields required.' });
      const { data: user, error } = await getSupabase().from('users').select('*').eq('id', decoded.id).single();
      if (error || !user) return res.status(404).json({ error: 'User not found.' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await getSupabase().from('users').update({ password: hashed }).eq('id', decoded.id);
      return res.status(200).json({ success: true });
    }
    return res.status(404).end();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
