const { GoogleGenerativeAI } = require('@google/generative-ai');
const { cors, verifyToken } = require('./lib/middleware'); // Added verifyToken

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const sanitizedApplicants = applicants.map(a => ({
      id: a.id || a.email,
      name: a.name,
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
    
    Return the result STRICTLY as a JSON array of objects. Do not include any markdown formatting, backticks, or extra text.
    Format MUST be exactly like this:
    [
      { "id": "applicant-id", "score": 85, "justification": "Strong experience and relevant skills." }
    ]
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (responseText.startsWith('```')) {
       responseText = responseText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    let parsedScores;
    try {
      parsedScores = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', responseText);
      return res.status(500).json({ error: 'AI returned invalid format', details: responseText });
    }

    return res.status(200).json({ results: parsedScores });

  } catch (error) {
    console.error('AI Ranking Error:', error);
    return res.status(500).json({ error: 'Failed to generate ranking', details: error.message });
  }
};
