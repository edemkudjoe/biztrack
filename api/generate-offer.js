// This endpoint is intentionally unused.
// Offer letters are generated client-side in index.html via downloadOfferLetter().

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(404).json({ error: 'Not in use.' });
};
