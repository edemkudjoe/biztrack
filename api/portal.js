const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getSupabase, cors, JWT_SECRET } = require('./lib/middleware');

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = (req.query['...route'] || []).filter(Boolean);
  // Fallback: derive route from the request URL path (e.g. /api/portal-login → 'portal-login')
  const urlRoute = (req.url || '').split('?')[0].split('/').filter(Boolean).pop();
  const route = parts[0] || urlRoute;

  try {
    // ── PORTAL SIGNUP ──
    if (route === 'portal-signup') {
      const { name, email, password, securityQuestion, securityAnswer } = req.body;
      if (!name || !email || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      const { data: existing } = await getSupabase().from('applicants').select('id').eq('email', email).eq('portalAccount', true).single();
      if (existing) return res.status(400).json({ error: 'An account with this email already exists.' });
      const hashed = await bcrypt.hash(password, 10);
const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), 10);
const { data, error } = await getSupabase().from('applicants').insert([{
  name, email, password: hashed, securityQuestion, securityAnswer: hashedAnswer,
        portalAccount: true, appliedDate: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      }]).select().single();
      if (error) return res.status(400).json({ error: error.message });
      const token = jwt.sign({ id: data.id, email: data.email, role: 'applicant' }, JWT_SECRET, { expiresIn: '8h' });
      return res.status(201).json({ token, applicant: data });
    }

    // ── PORTAL LOGIN ──
    if (route === 'portal-login') {
      const { email, password } = req.body;
      const { data: user, error } = await getSupabase().from('applicants').select('*').eq('email', email).eq('portalAccount', true).single();
      if (error || !user) return res.status(401).json({ error: 'Invalid email or password.' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid email or password.' });
      const token = jwt.sign({ id: user.id, email: user.email, role: 'applicant' }, JWT_SECRET, { expiresIn: '8h' });
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
        const match = await bcrypt.compare(securityAnswer.toLowerCase(), user.securityAnswer);
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
