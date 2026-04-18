// NOTE: Attendance records are now handled by the generic data endpoint:
//   POST /api/data/attendance  — clock in
//   PUT  /api/data/attendance/:id — clock out
//   GET  /api/data/attendance  — list records
//
// This endpoint is kept as a utility for checking clock-in status
// without needing the full route handler.

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { timestamp } = req.body || {};
  const date = new Date(timestamp || Date.now());
  const hour = date.getHours();

  // FIX #5: Before 08:00 = Present (On Time), 08:00 or after = Late
  // (Previously the label was the confusing 'Absent / Late Entry')
  const status = hour < 8 ? 'present' : 'late';

  return res.status(200).json({ status });
};
