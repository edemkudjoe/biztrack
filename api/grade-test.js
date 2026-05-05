const { GoogleGenerativeAI } = require('@google/generative-ai');
const { cors, verifyToken } = require('./lib/middleware');

const CALL_TIMEOUT_MS = 25000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeField(value, maxLength = 1000) {
  if (!value) return 'No answer provided.';
  return String(value)
    .replace(/[<>]/g, '')
    .replace(/ignore\s+previous/gi, '[redacted]')
    .replace(/system\s*:/gi, '[redacted]')
    .slice(0, maxLength);
}

async function callGeminiWithRetry(model, prompt, maxRetries = 4) {
  let delay = 8000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), CALL_TIMEOUT_MS)
        )
      ]);
    } catch (e) {
      const is429 =
        e?.status === 429 ||
        String(e?.message).includes('429') ||
        String(e?.message).toLowerCase().includes('resource has been exhausted') ||
        String(e?.message).toLowerCase().includes('toomanyrequests');
      if (is429 && attempt < maxRetries) {
        await sleep(delay);
        delay *= 2;
        continue;
      }
      throw e;
    }
  }
}

async function gradeSubjective(model, question, answer, maxPoints) {
  const prompt = `You are an expert examiner grading a short-answer aptitude test response.

Question: ${sanitizeField(question, 300)}
Candidate's Answer: ${sanitizeField(answer, 800)}
Maximum Points: ${maxPoints}

Grade this answer fairly. Award 0 if the answer is blank, irrelevant, or completely wrong.
Award full points for a correct, complete, well-reasoned answer.
Award partial points for partially correct or incomplete answers.

Respond ONLY in this exact JSON format with no extra text or markdown:
{"points":<number 0-${maxPoints}>,"feedback":"<1-2 sentences explaining the grade>"}`;

  const result = await callGeminiWithRetry(model, prompt);
  const text = result.response.text().trim().replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(text);

  if (typeof parsed.points !== 'number' || parsed.points < 0 || parsed.points > maxPoints) {
    throw new Error('Invalid points value from AI');
  }

  return {
    points: Math.round(parsed.points * 10) / 10,
    feedback: typeof parsed.feedback === 'string' ? parsed.feedback.slice(0, 300) : ''
  };
}

module.exports = async function (req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Accept portal JWT (applicant) or employer JWT
  let decoded;
  try { decoded = verifyToken(req); } catch (e) { return res.status(401).json({ error: 'Unauthorized' }); }

  const { questions, answers } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'questions array is required.' });
  }
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return res.status(400).json({ error: 'answers array must match questions length.' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let objectiveTotal = 0;
  let objectiveMax = 0;
  let subjectiveTotal = 0;
  let subjectiveMax = 0;
  const breakdown = [];

  const INTER_CALL_DELAY_MS = 5000;
  let subjectiveCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const ans = answers[i];
    const pts = typeof q.points === 'number' ? q.points : 1;

    if (q.type === 'subjective') {
      subjectiveMax += pts;

      // Delay between subjective Gemini calls
      if (subjectiveCount > 0) await sleep(INTER_CALL_DELAY_MS);
      subjectiveCount++;

      try {
        const graded = await gradeSubjective(model, q.q, ans, pts);
        subjectiveTotal += graded.points;
        breakdown.push({ qIndex: i, type: 'subjective', earned: graded.points, max: pts, feedback: graded.feedback });
      } catch (e) {
        // On failure give 0 but record the error
        breakdown.push({ qIndex: i, type: 'subjective', earned: 0, max: pts, feedback: 'Could not grade: ' + e.message });
      }
    } else {
      // Objective: ans is the selected option index, q.ans is correct index
      objectiveMax += pts;
      const correct = (parseInt(ans) === parseInt(q.ans));
      const earned = correct ? pts : 0;
      objectiveTotal += earned;
      breakdown.push({ qIndex: i, type: 'objective', earned, max: pts, correct });
    }
  }

  const totalEarned = objectiveTotal + subjectiveTotal;
  const totalMax = objectiveMax + subjectiveMax;

  return res.status(200).json({
    testScore: Math.round(totalEarned * 10) / 10,
    totalMax,
    objectiveScore: Math.round(objectiveTotal * 10) / 10,
    objectiveMax,
    subjectiveScore: Math.round(subjectiveTotal * 10) / 10,
    subjectiveMax,
    breakdown
  });
};
