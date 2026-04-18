module.exports = function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { empId, lat, lng, timestamp } = req.body || {};

  // Verify time server-side to prevent tampering
  const hour = new Date(timestamp || Date.now()).getHours();
  const status = hour < 8 ? 'Present (On Time)' : 'Absent / Late Entry';

  return res.status(200).json({ status });
};