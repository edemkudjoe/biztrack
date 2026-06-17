const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getSupabase, cors, verifyToken } = require('./lib/middleware');

const CALL_TIMEOUT_MS = 45000;
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function sanitizeField(value, maxLength = 1000) {
  if (!value) return 'No answer provided.';
  return String(value).replace(/[<>]/g, '').slice(0, maxLength);
}

async function callGeminiWithRetry(model, prompt, maxRetries = 2) {
  let delay = 4000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), CALL_TIMEOUT_MS))
      ]);
    } catch (e) {
      if (attempt < maxRetries) { await sleep(delay); delay *= 2; continue; }
      throw e;
    }
  }
}

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, applicantId } = req.body;
  if (!answers || !applicantId) return res.status(400).json({ error: 'Missing grading data' });

  let decoded;
  try {
    decoded = verifyToken(req);
    if (decoded.role === 'applicant' && decoded.id !== applicantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }

  // Security: Fetch MASTER questions from DB so applicant cannot tamper with correct answers
  const { data: realQuestions, error: qErr } = await getSupabase()
    .from('apt_questions')
    .select('*')
    .order('created_at', { ascending: true }); // Must match applicant receiving order
    
  if (qErr || !realQuestions) return res.status(500).json({ error: 'Failed to retrieve grading rubric.' });

  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

  let objectiveTotal = 0, objectiveMax = 0;
  let subjectiveTotal = 0, subjectiveMax = 0;
  const breakdown = [];

  for (let i = 0; i < realQuestions.length; i++) {
    const q = realQuestions[i];
    const ans = answers[i];
    const pts = typeof q.points === 'number' ? q.points : 1;

    if (q.type === 'objective') {
      objectiveMax += pts;
      const correct = (parseInt(ans) === parseInt(q.ans));
      const earned = correct ? pts : 0;
      objectiveTotal += earned;
      breakdown.push({ qIndex: i, type: 'objective', earned, max: pts, correct });
    } else if (q.type === 'subjective') {
      subjectiveMax += pts;
      if (!ans || String(ans).trim() === '') {
        breakdown.push({ qIndex: i, type: 'subjective', earned: 0, max: pts, feedback: 'No answer provided.' });
        continue;
      }
      if (!model) {
        breakdown.push({ qIndex: i, type: 'subjective', earned: 0, max: pts, feedback: 'AI grading offline.' });
        continue;
      }
      
      const prompt = `Grade this answer out of ${pts} points. Question: "${q.q}" Answer: "${sanitizeField(ans)}". Return strictly JSON: {"points": <number>, "feedback": "<string>"}`;
      try {
        const result = await callGeminiWithRetry(model, prompt);
        const text = result.response.text().trim().replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(text);
        const earned = Math.min(Math.max(0, Number(parsed.points) || 0), pts);
        subjectiveTotal += earned;
        breakdown.push({ qIndex: i, type: 'subjective', earned, max: pts, feedback: parsed.feedback || 'Graded by AI' });
      } catch (e) {
        console.error('AI Grading failed for a question:', e);
        breakdown.push({ qIndex: i, type: 'subjective', earned: 0, max: pts, feedback: 'Manual review required.' });
      }
    }
  }

  const totalEarned = Math.round((objectiveTotal + subjectiveTotal) * 10) / 10;
  const totalMax = objectiveMax + subjectiveMax;

  const { error } = await getSupabase().from('applicants').update({ 
    testScore: totalEarned, testMax: totalMax, testBreakdown: JSON.stringify(breakdown) 
  }).eq('id', applicantId);

  if (error) throw error;
  return res.status(200).json({ testScore: totalEarned, totalMax, breakdown });
};
