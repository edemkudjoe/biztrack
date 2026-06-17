const { getSupabase, cors, verifyToken, ALLOWED_TABLES, EMPLOYEE_FILTERED } = require('./lib/middleware');
const APPLICANT_WRITABLE_FIELDS = ['testScore', 'testMax', 'testBreakdown', 'offerStatus', 'negotiation'];

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
      
      if (decoded && decoded.role === 'employee') {
        if (EMPLOYEE_FILTERED.includes(table)) {
          query = query.eq('empId', decoded.id);
        }
      } else if (decoded && decoded.role === 'applicant') {
        // STRICT SECURITY: Restrict applicant read access entirely except for safe tables
        if (table === 'applicants') {
          query = query.eq('email', decoded.email); // Can only read their own application
        } else if (table !== 'job_postings' && table !== 'apt_questions') {
          return res.status(403).json({ error: 'Forbidden. Applicant access restricted.' });
        }
      }

      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });

      // SECURITY: Strip correct answers from aptitude questions before sending to applicants
      let safeData = data;
      if (table === 'apt_questions' && decoded && decoded.role === 'applicant') {
        safeData = data.map(q => {
          const { ans, ...rest } = q;
          return rest;
        });
        // Sort questions oldest first for applicants to match grade-test logic
        safeData.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)); 
      }

      return res.status(200).json({ records: safeData });
    }

    if (req.method === 'POST') {
      if (decoded.role === 'applicant' && table === 'applicants') {
        const body = { ...req.body, created_at: new Date().toISOString() };
        const { data, error } = await getSupabase().from(table).insert([body]).select().single();
        return error ? res.status(400).json({ error: error.message }) : res.status(201).json({ record: data });
      }
      if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });
      const body = { ...req.body, created_at: new Date().toISOString() };
      const { data, error } = await getSupabase().from(table).insert([body]).select().single();
      return error ? res.status(400).json({ error: error.message }) : res.status(201).json({ record: data });
    }

    if (req.method === 'PUT' && recordId) {
      if (decoded.role === 'applicant' && table === 'applicants') {
        const { data: existing, error: fetchErr } = await getSupabase().from('applicants').select('id, email').eq('id', recordId).single();
        if (fetchErr || !existing) return res.status(404).json({ error: 'Record not found.' });
        if (existing.email !== decoded.email) return res.status(403).json({ error: 'Forbidden.' });

        const safeBody = {};
        for (const key of APPLICANT_WRITABLE_FIELDS) {
          if (req.body[key] !== undefined) safeBody[key] = req.body[key];
        }
        if (Object.keys(safeBody).length === 0) return res.status(400).json({ error: 'No writable fields provided.' });
        const { data, error } = await getSupabase().from(table).update(safeBody).eq('id', recordId).select().single();
        return error ? res.status(400).json({ error: error.message }) : res.status(200).json({ record: data });
      }
      if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });
      const { data, error } = await getSupabase().from(table).update(req.body).eq('id', recordId).select().single();
      return error ? res.status(400).json({ error: error.message }) : res.status(200).json({ record: data });
    }

    if (req.method === 'DELETE' && recordId) {
      if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });
      const { error } = await getSupabase().from(table).delete().eq('id', recordId);
      return error ? res.status(400).json({ error: error.message }) : res.status(200).json({ success: true });
    }

    return res.status(405).end();
  }
  catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
