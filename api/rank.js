const { GoogleGenerativeAI } = require('@google/generative-ai');
const { cors, verifyToken } = require('./lib/middleware');

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // SECURITY: Protect AI Quota from unauthorized bots
  try {
    verifyToken(req);
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized to use AI services.' });
  }

  const { applicants, jobRequirements } = req.body;
  if (!applicants || !Array.isArray(applicants)) {
    return res.status(400).json({ error: 'Applicants array required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // NATIVE JSON OUTPUT: Forces the model to return a raw JSON string without markdown
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // BIAS PREVENTION: Strip name and other PII out of the prompt context
    const sanitizedApplicants = applicants.map(a => ({
      id: a.id || a.email,
      education: a.education || 'Not provided',
      experience: a.experience || 0,
      skills: a.skills || 'Not provided',
      coverLetter: a.coverLetter || 'Not provided'
    }));

    const prompt = `
    You are an expert HR recruitment AI. Your task is to rank a list of applicants based on how well they match the job requirements.
    
    Job Requirements:
    "${jobRequirements || 'General suitability for a professional role.'}"
    
    Applicants Data:
    ${JSON.stringify(sanitizedApplicants, null, 2)}
    
    For each applicant, assign a "score" from 0 to 100 representing their fit for the role.
    Also provide a short "justification" (max 2 sentences) for the score.
    
    Return the result as a JSON array of objects following this exact schema:
    [
      { "id": "string", "score": number, "justification": "string" }
    ]
    `;

    const result = await model.generateContent(prompt);
    
    // Directly parse the result—no Regex needed anymore due to responseMimeType!
    let parsedScores;
    try {
      parsedScores = JSON.parse(result.response.text());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', result.response.text());
      return res.status(500).json({ error: 'AI returned invalid format', details: result.response.text() });
    }

    return res.status(200).json({ results: parsedScores });

  } catch (error) {
    console.error('AI Ranking Error:', error);
    return res.status(500).json({ error: 'Failed to generate ranking', details: error.message });
  }
};
