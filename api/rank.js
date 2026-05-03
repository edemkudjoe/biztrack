const { GoogleGenerativeAI } = require('@google/generative-ai');
const { cors, verifyToken } = require('./lib/middleware');

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const results = await Promise.all(applicants.map(async (app) => {
      const prompt = `
You are an expert HR recruiter scoring a job applicant. Be fair, critical, and consistent.

Job Requirements:
${jobRequirements || 'No specific requirements listed.'}

Applicant Profile:
- Name: ${app.name || 'Unknown'}
- Education: ${app.education || 'Not specified'}
- Years of Experience: ${app.experience || 0}
- Skills: ${app.skills || 'Not specified'}
- Cover Letter: ${app.coverLetter || 'Not provided'}

Score this applicant out of 100 based on how well they match the job requirements.
Scoring breakdown:
- Education relevance: up to 40 points
- Experience: up to 30 points
- Skills match: up to 20 points
- Cover letter quality and relevance: up to 10 points

Respond in this exact JSON format with no extra text:
{
  "score": <number 0-100>,
  "justification": "<2-3 sentences explaining the score>"
}`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        return {
          id: app.id,
          email: app.email,
          score: Math.min(100, Math.max(0, Math.round(parsed.score))),
          justification: parsed.justification || 'No justification provided.'
        };
      } catch (e) {
        return {
          id: app.id,
          email: app.email,
          score: 0,
          justification: 'Could not score this applicant automatically.'
        };
      }
    }));

    return res.status(200).json({ results });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
