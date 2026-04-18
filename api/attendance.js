// This endpoint is intentionally unused.
// Attendance is handled entirely by the generic data endpoint in [...route].js:
//   POST /api/data/attendance  — clock in
//   PUT  /api/data/attendance/:id — clock out
//   GET  /api/data/attendance  — list records

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(404).json({ error: 'Use /api/data/attendance instead.' });
};
