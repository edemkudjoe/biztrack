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
  if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });
  const body = { ...req.body, created_at: new Date().toISOString() };
      }

    if (req.method === 'PUT' && recordId) {
  if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });
  const { data, error } = await getSupabase().from(table).update(req.body)
      }
      
if (req.method === 'DELETE' && recordId) {
  if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });
  const { error } = await getSupabase().from(table).delete().eq('id', recordId);
  return error ? res.status(400).json({ error: error.message }) : res.status(200).json({ success: true });
}
if (req.method === 'DELETE' && !recordId) {
  return res.status(400).json({ error: 'Record ID is required for deletion.' });
}
    return res.status(405).end();
};
