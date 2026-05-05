import Anthropic from '@anthropic-ai/sdk';
import { TOPICS as PYTHON_TOPICS } from '../data/topics';

// ── SDK init ────────────────────────────────────────────────────
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
let anthropic = null;
if (apiKey) {
  anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}
const MODEL = 'claude-sonnet-4-20250514';

// ── Demo Mode hardcoded data (spec-exact) ───────────────────────
const DEMO = {
  roadmap: [
    'Variables & Data Types', 'Control Flow & Loops', 'Functions & Scope',
    'Lists & Dictionaries', 'File Handling', 'OOP Basics',
    'Modules & Libraries', 'Mini Project',
  ],
  question: 'A variable stores a _____ that can change.',
  correctAnswers: ['value', 'data', 'information'],
  analogy: 'Think of a variable like a labeled box in your room. When you write x = 5, you put the number 5 in a box called x. Your program can open that box anytime to read or replace it.',
  challenge: 'You have a list nums = [3,1,4,1,5,9]. Without using sort() or max(), find the largest number using only a loop.',
  microTask: 'Fill in the blank: A for loop repeats code a _____ number of times.',
  motivation: "Even Chrono from Freefire never skips his ability grind before a match. You've been gone 2 days. One task. Get back in the game.",
};

// ── Helper ──────────────────────────────────────────────────────
const call = async (system, user, maxTokens = 300) => {
  if (!anthropic) throw new Error('No API key');
  const msg = await anthropic.messages.create({
    model: MODEL, max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  return msg.content[0].text;
};

const extractJSON = (text) => {
  const m = text.match(/\{[\s\S]*\}/);
  if (m) return JSON.parse(m[0]);
  throw new Error('No JSON found');
};

// ── 1. Generate Roadmap ─────────────────────────────────────────
export const generateRoadmap = async (topic, goal, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() =>
      r(DEMO.roadmap.map((title, i) => ({
        id: `topic-${i}`, title,
        description: `Module ${i + 1} of your personalized ${topic} roadmap.`,
        videoId: 'hJHvdBlSxug',
      }))), 600));
  }
  try {
    const text = await call(
      'You are an educational AI. Return ONLY a valid JSON array of 8 strings — topic titles in learning order.',
      `Generate an 8-topic learning roadmap for ${topic} with goal: ${goal}.`
    );
    const m = text.match(/\[[\s\S]*\]/);
    const titles = JSON.parse(m ? m[0] : text);
    return titles.map((title, i) => ({
      id: `topic-${i}`, title,
      description: `Module ${i + 1} of your ${topic} roadmap.`,
      videoId: 'hJHvdBlSxug',
    }));
  } catch (e) {
    console.error('generateRoadmap:', e);
    return DEMO.roadmap.map((title, i) => ({ id: `topic-${i}`, title, description: `Module ${i+1}`, videoId: 'hJHvdBlSxug' }));
  }
};

// ── 2. Generate inline fill-in-blank question from VIDEO CONTENT ─
/**
 * @param {string}   topicTitle     - module title e.g. "HTML Fundamentals"
 * @param {string[]} seenTopics     - topics the student has seen so far (from playback position)
 * @param {number}   currentTimeSec - current playback position in seconds
 * @param {boolean}  demoMode
 */
export const generateInlineQuestion = async (topicTitle, seenTopics = [], currentTimeSec = 0, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r(DEMO.question), 400));
  }

  // Pick 3 recent topics the student just watched (last 3 are most fresh)
  const recentTopics = seenTopics.slice(-3);
  const timeLabel    = currentTimeSec < 60
    ? `${Math.round(currentTimeSec)} seconds`
    : `${Math.floor(currentTimeSec / 60)} minute${Math.floor(currentTimeSec / 60) !== 1 ? 's' : ''}`;

  const topicContext = recentTopics.length
    ? `The student just watched a video about "${topicTitle}". At the ${timeLabel} mark, the video has covered these specific concepts:\n${recentTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nGenerate ONE fill-in-the-blank question that tests one of these EXACT concepts the student just saw. The blank must be represented as _____. Return only the question string.`
    : `Generate ONE fill-in-the-blank question about "${topicTitle}". Use exactly ONE blank as _____. Return only the question string.`;

  try {
    return await call(
      'You are an educational AI analyzing YouTube video captions. Generate inline quiz questions based on the simulated transcript of the video lecture. The question MUST be highly specific to what a YouTuber would actually say about this concept. Make it concrete and specific — not generic.',
      topicContext
    );
  } catch (e) {
    return DEMO.question;
  }
};


// ── 3. Check student answer (spec-exact) ───────────────────────
export const checkAnswer = async (topic, question, answer, demoMode = false) => {
  if (demoMode || !anthropic) {
    const isCorrect = DEMO.correctAnswers.some(a =>
      answer.trim().toLowerCase() === a.toLowerCase()
    );
    return new Promise(r => setTimeout(() => r({
      correct: isCorrect,
      feedback: isCorrect
        ? "Great job! You're getting the hang of it."
        : "Not quite, but you're thinking in the right direction!",
    }), 500));
  }
  try {
    const text = await call(
      'You are a helpful tutor. Reply ONLY with valid JSON: {"correct": true/false, "feedback": "one encouraging sentence"}',
      `Topic being taught: ${topic}.\nFill in the blank question: ${question}\nStudent's answer: ${answer}\nIs this answer correct or shows understanding?`
    );
    return extractJSON(text);
  } catch {
    return { correct: false, feedback: "Keep trying — you're on the right track!" };
  }
};

// ── 4. Generate analogy for wrong answer ────────────────────────
export const generateAnalogy = async (topic, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r(DEMO.analogy), 600));
  }
  try {
    return await call(
      'You are a helpful tutor. Give a real-world analogy in exactly 2 sentences. No code. Plain English only.',
      `Student doesn't understand ${topic}. Give a real-world analogy.`,
      200
    );
  } catch { return DEMO.analogy; }
};

// ── 5. Cognitive-state-specific responses ───────────────────────
export const generateOverloadedResponse = async (topic, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r(DEMO.analogy), 600));
  }
  try {
    return await call(
      'You are a helpful tutor.',
      `Student is overloaded learning ${topic}. Give one simple real-world analogy in 3 sentences. No code.`,
      250
    );
  } catch { return DEMO.analogy; }
};

export const generateBoredChallenge = async (topic, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r(DEMO.challenge), 600));
  }
  try {
    return await call(
      'You are a helpful tutor.',
      `Student mastered ${topic} easily. Give one harder real-world application challenge in 2 sentences.`,
      200
    );
  } catch { return DEMO.challenge; }
};

// ── 6. Game character motivation (re-entry) ─────────────────────
export const generateMotivation = async (game, daysAway, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r(DEMO.motivation), 500));
  }
  try {
    return await call(
      'You are a motivational coach. Write exactly 2 sentences. Make it intense and direct.',
      `User's favorite game is ${game}. They have been away from learning for ${daysAway} days. Write a motivational message referencing a specific character or mechanic from that game.`,
      150
    );
  } catch { return DEMO.motivation; }
};

// ── 7. Generate micro task on exit ──────────────────────────────
export const generateMicroTask = async (topic, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r(DEMO.microTask), 500));
  }
  try {
    return await call(
      'You are an educational AI. Generate ONE fill-in-the-blank question completable in under 2 minutes. Return ONLY the question string with blank as _____.',
      `Student was learning ${topic} and just stopped mid-session. Generate one fill-in-the-blank question that tests a core concept from this topic.`
    );
  } catch { return DEMO.microTask; }
};

// ── 8. Legacy quiz (kept for compatibility) ──────────────────────
export const generateQuiz = async (topicName, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r([
      { question: `What is a key concept of ${topicName}?`, options: ['Option A','Option B','Option C','Option D'], correct: 0 },
      { question: `How do you apply ${topicName}?`, options: ['Method X','Method Y','Method Z','None'], correct: 1 },
      { question: `Which is NOT related to ${topicName}?`, options: ['Thing 1','Thing 2','Thing 3','Thing 4'], correct: 3 },
    ]), 400));
  }
  try {
    const text = await call(
      'You are an educational AI. Generate 3 MCQ questions. Reply ONLY with JSON: [{"question":"...","options":["...","...","...","..."],"correct":0}]',
      `Topic: ${topicName}`
    );
    const m = text.match(/\[[\s\S]*\]/);
    return JSON.parse(m ? m[0] : text);
  } catch { return [{ question: 'API Error', options: ['A','B','C','D'], correct: 0 }]; }
};

// ── 9. End-of-module quiz (mandatory, 5–10 fill-in-blank questions) ──
/**
 * Generates a comprehensive quiz from ALL keyTopics in the module.
 * @param {string}   topicTitle  - e.g. "HTML Fundamentals"
 * @param {string[]} keyTopics   - all topics covered in the video
 * @param {number}   count       - how many questions to generate (5-10)
 * @param {boolean}  demoMode
 * @returns {Promise<Array<{prompt:string, answer:string, hint:string}>>}
 */
export const generateModuleQuiz = async (topicTitle, keyTopics = [], count = 5, demoMode = false) => {
  // Demo fallback — use quizBank
  if (demoMode || !anthropic) {
    const { getQuestions } = await import('../data/quizBank.js');
    const qs = getQuestions(topicTitle, 'beginner', count);
    return new Promise(r => setTimeout(() => r(qs), 700));
  }

  const topicList = keyTopics.length
    ? keyTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')
    : topicTitle;

  try {
    const text = await call(
      `You are an educational AI reading YouTube video captions to generate a mandatory end-of-module quiz.
Rules:
- Generate exactly ${count} questions.
- Gradually increase the difficulty from moderate to difficult as the array progresses.
- Mix standard conceptual fill-in-the-blanks with "fill the missing code" snippets (e.g., ____("Hello world")).
- Each blank is represented strictly as _____.
- Keep answers SHORT (1-4 words max, or a brief code snippet).
- Return ONLY valid JSON array, no extra text.
Format: [{"prompt":"sentence or code snippet with _____","answer":"short answer","hint":"one-line hint"}]`,
      `Module: "${topicTitle}"\nConcepts covered:\n${topicList}\n\nGenerate ${count} questions of increasing difficulty, mixing code snippets and theory.`,
      1500
    );
    const m = text.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(m ? m[0] : text);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    throw new Error('Bad format');
  } catch (e) {
    // Fallback to quizBank
    const { getQuestions } = await import('../data/quizBank.js');
    return getQuestions(topicTitle, 'beginner', count);
  }
};

// ── 10. Dynamic Quiz Interventions ──────────────────────────────
export const generateDoubtIntervention = async (topicTitle, currentQuestion, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r({
      analogy: "Think of this concept like building a house. You need a solid foundation before putting up the walls.",
      newQuestion: { prompt: "A strong _____ is required before building walls.", answer: "foundation", hint: "base structure" }
    }), 1000));
  }
  try {
    const text = await call(
      `You are an AI tutor. The student is struggling with a question.
Rules:
- Provide a simple 1-2 sentence real-world analogy to explain the concept.
- Provide a slightly easier, alternative fill-in-the-blank question to test the concept.
- CRITICAL: The 'newQuestion' MUST be about the programming topic itself, NOT about the analogy! If your analogy is about a building, do NOT ask a question about a building. Ask about the code/concept.
- Return ONLY valid JSON: {"analogy":"...","newQuestion":{"prompt":"..._____...","answer":"...","hint":"..."}}`,
      `Module: ${topicTitle}\nStruggling Question: ${currentQuestion}\nHelp them understand and give a new question.`
    );
    return extractJSON(text);
  } catch (e) {
    return {
      analogy: "Take a deep breath! Let's try looking at it from a simpler perspective.",
      newQuestion: { prompt: currentQuestion, answer: "try again", hint: "Think carefully" }
    };
  }
};

export const generateSpeedIntervention = async (topicTitle, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r({
      message: "Boring questions? Let me challenge you to do the next one in 10 seconds. Show me what you've got.",
      hardQuestion: { prompt: "In an advanced architecture, scaling horizontally means adding more _____ to the pool.", answer: "machines", hint: "hardware/servers" }
    }), 1000));
  }
  try {
    const text = await call(
      `You are a strict, challenging AI tutor. The student is answering too quickly.
Rules:
- Give a 1-2 sentence ego-challenging message.
- Provide a HARD, advanced fill-in-the-blank question for the topic.
- Return ONLY valid JSON: {"message":"...","hardQuestion":{"prompt":"..._____...","answer":"...","hint":"..."}}`,
      `Module: ${topicTitle}\nStudent is answering fast. Give them a hard challenge.`
    );
    return extractJSON(text);
  } catch (e) {
    return {
      message: "You're fast! Let's see if you can handle this.",
      hardQuestion: { prompt: "An advanced _____ is needed for highly complex tasks.", answer: "system", hint: "infrastructure" }
    };
  }
};

export { DEMO };


// ── Legacy alias for Intervention.jsx ────────────────────────────
export const generateIntervention = (state, topic, demoMode) =>
  state === 'bored'
    ? generateBoredChallenge(topic, demoMode)
    : generateOverloadedResponse(topic, demoMode);

