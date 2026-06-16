const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getSupabase, cors, verifyToken } = require('./lib/middleware');

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers, questions, applicantId } = req.body;
  if (!answers || !questions || !applicantId) {
    return res.status(400).json({ error: 'Missing required grading data' });
  }

  // Secure the endpoint: Ensure the applicant grading this test is the applicant logged in
  let decoded;
  try {
    decoded = verifyToken(req);
    if (decoded.role === 'applicant' && decoded.id !== applicantId) {
      return res.status(403).json({ error: 'Unauthorized to grade this test.' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let totalScore = 0;
    let maxScore = 0;
    const breakdown = [];

    // Grade each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = answers[i];
      const pts = typeof q.points === 'number' ? q.points : 1;
      maxScore += pts;

      if (q.type === 'objective') {
        const isCorrect = parseInt(ans) === q.ans;
        if (isCorrect) totalScore += pts;
        breakdown.push({
          q: q.q,
          type: 'objective',
          awarded: isCorrect ? pts : 0,
          max: pts,
          correct: isCorrect
        });
      } else if (q.type === 'subjective') {
        if (!ans || String(ans).trim() === '') {
          breakdown.push({
            q: q.q, type: 'subjective', awarded: 0, max: pts, feedback: 'No answer provided.'
          });
          continue;
        }

        const prompt = `
        You are an expert HR examiner. Grade the following answer to the given question.
        Question: "${q.q}"
        Applicant's Answer: "${ans}"
        Max Points Available: ${pts}

        Evaluate the answer for accuracy, completeness, and clarity.
        Return a JSON object STRICTLY in this format (no markdown, no backticks, no extra text):
        { "awarded": <number_between_0_and_${pts}>, "feedback": "<1_sentence_explanation>" }
        `;

        try {
          const result = await model.generateContent(prompt);
          let responseText = result.response.text().trim();
          
          // Fixed ReferenceError: using responseText instead of text
          console.log(`Grading Q${i+1} Raw Response:`, responseText);

          if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/^```json\n/, '').replace(/\n```$/, '');
          } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```\n/, '').replace(/\n```$/, '');
          }

          const gradeData = JSON.parse(responseText);
          const awarded = Math.min(Math.max(0, Number(gradeData.awarded) || 0), pts);
          
          totalScore += awarded;
          breakdown.push({
            q: q.q,
            type: 'subjective',
            awarded: awarded,
            max: pts,
            feedback: gradeData.feedback || 'Graded by AI'
          });
        } catch (aiErr) {
          console.error('AI Grading failed for a question:', aiErr);
          // Graceful fallback if AI fails parsing or times out
          breakdown.push({
            q: q.q, type: 'subjective', awarded: 0, max: pts, feedback: 'Pending manual review (AI grading error).'
          });
        }
      }
    }

    // Save final scores to the database
    const { error } = await getSupabase()
      .from('applicants')
      .update({ 
        testScore: totalScore, 
        testMax: maxScore, 
        testBreakdown: JSON.stringify(breakdown) 
      })
      .eq('id', applicantId);

    if (error) throw error;

    return res.status(200).json({ 
      success: true, 
      score: totalScore, 
      max: maxScore, 
      breakdown 
    });

  } catch (error) {
    console.error('Grading API Error:', error);
    return res.status(500).json({ error: 'Failed to complete test grading', details: error.message });
  }
};
