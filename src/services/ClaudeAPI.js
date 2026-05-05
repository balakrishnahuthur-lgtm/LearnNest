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

// ── 2. Generate inline fill-in-blank question ───────────────────
export const generateInlineQuestion = async (topic, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(r => setTimeout(() => r(DEMO.question), 400));
  }
  try {
    return await call(
      'You are an educational AI. Generate ONE fill-in-the-blank question about the topic. Use exactly ONE blank represented as _____. Return only the question string, no quotes.',
      `Topic: ${topic}. Generate a fill-in-the-blank question that tests a core concept.`
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

export { DEMO };

// ── Legacy alias for Intervention.jsx ────────────────────────────
export const generateIntervention = (state, topic, demoMode) =>
  state === 'bored'
    ? generateBoredChallenge(topic, demoMode)
    : generateOverloadedResponse(topic, demoMode);

