const { GoogleGenerativeAI } = require('@google/generative-ai');
const { cors, verifyToken } = require('./lib/middleware');

const CALL_TIMEOUT_MS = 15000;

function sanitizeField(value, maxLength = 500) {
  if (!value) return 'Not provided';
  return String(value)
    .replace(/[<>]/g, '')
    .replace(/ignore\s+previous/gi, '[redacted]')
    .replace(/system\s*:/gi, '[redacted]')
    .slice(0, maxLength);
}

async function scoreWithTimeout(model, prompt) {
  return Promise.race([
    model.generateContent(prompt),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout')), CALL_TIMEOUT_MS)
    )
  ]);
}

async function scoreApplicant(model, app, jobRequirements) {
  const prompt = `You are an expert HR recruiter scoring a job applicant. Be fair, critical, and consistent.

Job Requirements:
${jobRequirements}

Applicant Profile:
- Name: ${sanitizeField(app.name, 100)}
- Education: ${sanitizeField(app.education, 200)} (pre-score: ${Math.min(parseInt(app.eduScore) || 0, 40)}/40)
- Experience pre-score: ${Math.min(parseInt(app.expScore || app.experience) || 0, 30)}/30
- Skills: ${sanitizeField(app.skills, 300)}
- Cover Letter: ${sanitizeField(app.coverLetter, 800)}

Score this applicant out of 100 based on how well they match the job requirements.
Scoring breakdown:
- Education relevance: up to 40 points
- Experience: up to 30 points
- Skills match: up to 20 points
- Cover letter quality and relevance: up to 10 points

Respond in this exact JSON format with no extra text, markdown, or code fences:
{"score":<integer 0-100>,"justification":"<2-3 sentences explaining the score>"}`;

  const result = await scoreWithTimeout(model, prompt);
  const text = result.response.text().trim().replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(text);

  if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
    throw new Error('Invalid score value from AI');
  }

  return {
    id: app.id,
    score: Math.round(parsed.score),
    justification: typeof parsed.justification === 'string'
      ? parsed.justification.slice(0, 500)
      : 'No justification provided.'
  };
}

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    let decoded;
    try { decoded = verifyToken(req); } catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }
    if (decoded.role !== 'employer') return res.status(403).json({ error: 'Forbidden' });

    const { applicants, jobRequirements } = req.body;
    if (!applicants || !Array.isArray(applicants) || applicants.length === 0) {
      return res.status(400).json({ error: 'No applicants provided.' });
    }
    if (!jobRequirements || typeof jobRequirements !== 'string' || !jobRequirements.trim()) {
      return res.status(400).json({ error: 'jobRequirements must be provided for accurate scoring.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const results = await Promise.all(applicants.map(async (app) => {
      try {
        return await scoreApplicant(model, app, jobRequirements.slice(0, 1000));
      } catch (e) {
        return {
          id: app.id,
          score: null,
          justification: null,
          error: e.message || 'Scoring failed'
        };
      }
    }));

    const succeeded = results.filter(r => r.score !== null).length;
    const failed = results.length - succeeded;

    return res.status(200).json({ results, succeeded, failed });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
