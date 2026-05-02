const { getSupabase, cors, verifyToken, ALLOWED_TABLES, EMPLOYEE_FILTERED } = require('./lib/middleware');

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = (req.query['...route'] || []).filter(Boolean);
const urlParts = (req.url || '').split('?')[0].split('/').filter(Boolean);
const table = parts[1] || urlParts[2];
const recordId = parts[2] || urlParts[3];

  if (!ALLOWED_TABLES.includes(table)) return res.status(404).end();

  try {
    let decoded = null;
    if (req.method === 'GET' && table === 'job_postings') { /* Public access */ }
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
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
