import Anthropic from '@anthropic-ai/sdk';
import { TOPICS as PYTHON_TOPICS } from '../data/topics';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

let anthropic = null;
if (apiKey) {
  anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
}

const MODEL = 'claude-sonnet-4-20250514'; // User specified model

const ROADMAP_FALLBACKS = {
  Python: [
    { id: 'topic-0', title: 'Python Fundamentals', description: 'Learn syntax, variables, data types, and control flow.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-1', title: 'Functions & Modules', description: 'Build reusable code with functions and import libraries.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-2', title: 'Data Structures', description: 'Use lists, dictionaries, sets, and tuples effectively.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-3', title: 'Object-Oriented Python', description: 'Understand classes, objects, and encapsulation.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-4', title: 'Working with Files', description: 'Read, write, and manage data with file I/O.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-5', title: 'API & Web Requests', description: 'Send requests and work with JSON data from APIs.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-6', title: 'Testing & Debugging', description: 'Test code and fix bugs with real examples.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-7', title: 'Deploy & Automate', description: 'Deploy scripts and automate workflows with Python.', videoId: 'hJHvdBlSxug' }
  ],
  MERN: [
    { id: 'topic-0', title: 'MERN Overview', description: 'Understand MongoDB, Express, React, and Node.js.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-1', title: 'React Foundations', description: 'Build UI components, state, and props.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-2', title: 'Backend with Express', description: 'Create REST APIs using Node and Express.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-3', title: 'Database Basics', description: 'Model and query data with MongoDB.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-4', title: 'Authentication', description: 'Add login and user sessions securely.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-5', title: 'Connecting Frontend & Backend', description: 'Link React to your Express API with fetch/Axios.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-6', title: 'Deployment', description: 'Deploy your MERN app to production.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-7', title: 'Real Project', description: 'Build a full-stack project using the MERN stack.', videoId: 'hJHvdBlSxug' }
  ],
  'Web Dev': [
    { id: 'topic-0', title: 'HTML & CSS', description: 'Build page structure and style with modern HTML/CSS.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-1', title: 'JavaScript Basics', description: 'Learn variables, functions, and DOM manipulation.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-2', title: 'Responsive Design', description: 'Make layouts adapt to screens and devices.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-3', title: 'Asynchronous JS', description: 'Use promises, fetch, and async/await.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-4', title: 'Front-end Frameworks', description: 'Explore React, Vue, or similar tools.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-5', title: 'APIs & Data', description: 'Connect sites to APIs and handle JSON data.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-6', title: 'Performance', description: 'Optimize loading, images, and performance.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-7', title: 'Launch Your Site', description: 'Deploy a website with a live domain.', videoId: 'hJHvdBlSxug' }
  ],
  DSA: [
    { id: 'topic-0', title: 'Algorithm Basics', description: 'Understand complexity, sorting, and searching.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-1', title: 'Arrays & Strings', description: 'Solve problems using arrays and text data.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-2', title: 'Linked Lists', description: 'Work with single and doubly linked lists.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-3', title: 'Trees & Graphs', description: 'Learn hierarchical and network data structures.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-4', title: 'Dynamic Programming', description: 'Use DP patterns to solve harder problems.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-5', title: 'Recursion', description: 'Master recursive problem solving.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-6', title: 'Greedy & Backtracking', description: 'Choose the right strategy for each problem.', videoId: 'hJHvdBlSxug' },
    { id: 'topic-7', title: 'Practice Projects', description: 'Apply DSA skills to competitive and interview problems.', videoId: 'hJHvdBlSxug' }
  ]
};

const getFallbackRoadmap = (topic) => ROADMAP_FALLBACKS[topic] || PYTHON_TOPICS;

export const generateRoadmap = async (topic, goal, demoMode = false) => {
  const fallbackTopics = getFallbackRoadmap(topic);
  if (demoMode || !anthropic) {
    // Return mock topics for the selected topic when AI is unavailable.
    return new Promise(resolve => setTimeout(() => resolve(fallbackTopics), 800));
  }

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: "You are an educational AI. Generate 8 learning module titles for a roadmap. Reply ONLY with a valid JSON array of strings representing the titles. Example: [\"Intro\", \"Basics\", ...]",
      messages: [
        { role: "user", content: `Generate an 8-topic roadmap for learning ${topic} with the goal of ${goal}.` }
      ]
    });
    
    // Parse the JSON array. Might need cleanup if Claude adds markdown.
    let text = msg.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) text = jsonMatch[0];
    
    const titles = JSON.parse(text);
    return titles.map((title, index) => ({
      id: `topic-${index}`,
      title: title,
      description: `Module ${index + 1} of your personalized roadmap.`,
      videoId: 'hJHvdBlSxug' // Placeholder video ID
    }));
  } catch (error) {
    console.error("Claude API Error (Roadmap):", error);
    return fallbackTopics;
  }
};

export const generateQuiz = async (topicName, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(resolve => setTimeout(() => resolve([
      { question: `What is a key concept of ${topicName}?`, options: ["Option A", "Option B", "Option C", "Option D"], correct: 0 },
      { question: `How do you apply ${topicName}?`, options: ["Method X", "Method Y", "Method Z", "None"], correct: 1 },
      { question: `Which is NOT related to ${topicName}?`, options: ["Thing 1", "Thing 2", "Thing 3", "Thing 4"], correct: 3 },
    ]), 800));
  }

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: "You are an educational AI. Generate 3 multiple choice questions for the given topic. Reply ONLY with a valid JSON array. Format: [{\"question\": \"string\", \"options\": [\"string\",\"string\",\"string\",\"string\"], \"correct\": integer 0-3}]",
      messages: [
        { role: "user", content: `Generate a 3-question MCQ quiz for: ${topicName}` }
      ]
    });
    
    let text = msg.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) text = jsonMatch[0];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Claude API Error (Quiz):", error);
    return [
      { question: "API Error occurred.", options: ["A", "B", "C", "D"], correct: 0 }
    ];
  }
};

export const generateIntervention = async (state, topicName, demoMode = false) => {
  if (state === 'flow') return null;

  if (demoMode || !anthropic) {
    return new Promise(resolve => setTimeout(() => {
      if (state === 'overloaded') return `Think of ${topicName} like a building's foundation. You need to let the concrete dry before adding another floor. Take a moment to review the basics before moving on.`;
      if (state === 'bored') return `Challenge: Can you explain how ${topicName} integrates with a completely different technology stack?`;
      return null;
    }, 800));
  }

  try {
    let prompt = "";
    if (state === 'overloaded') {
      prompt = `The student is struggling with ${topicName}. Give a real-world analogy in exactly 3 sentences to help them understand.`;
    } else if (state === 'bored') {
      prompt = `The student finds ${topicName} too easy. Generate a harder challenge question to provoke thought.`;
    }

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: "You are a helpful tutor.",
      messages: [{ role: "user", content: prompt }]
    });
    
    return msg.content[0].text;
  } catch (error) {
    console.error("Claude API Error (Intervention):", error);
    return "API Error occurred while generating intervention.";
  }
};

export const generateMicroTask = async (topicName, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(resolve => setTimeout(() => resolve(`Write a 2-sentence summary of the main concept in ${topicName}.`), 800));
  }

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 150,
      system: "You are an educational AI. Generate exactly ONE micro task question about the topic that the user can complete in 2 minutes. Reply ONLY with the question string.",
      messages: [{ role: "user", content: `Topic: ${topicName}` }]
    });
    return msg.content[0].text;
  } catch (error) {
    console.error("Claude API Error (MicroTask):", error);
    return `Quick: summarize ${topicName} in your own words.`;
  }
};

export const generateMotivation = async (character, topicName, demoMode = false) => {
  if (demoMode || !anthropic) {
    return new Promise(resolve => setTimeout(() => resolve(`Hey there! I know ${topicName} can be tough, but just like in ${character || 'my game'}, you just have to keep trying. You've got this!`), 800));
  }

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: `You are an educational AI roleplaying as the video game character: ${character || 'Mario'}. Give a 2-3 sentence motivational message to help the user return to studying ${topicName}.`,
      messages: [{ role: "user", content: "I've been gone for a few days. Motivate me!" }]
    });
    return msg.content[0].text;
  } catch (error) {
    console.error("Claude API Error (Motivation):", error);
    return `Welcome back! Let's conquer ${topicName} together.`;
  }
};
