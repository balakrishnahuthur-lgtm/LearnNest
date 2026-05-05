// Comprehensive roadmap database with real YouTube video IDs
// Each topic has 8 modules with rich metadata

export const ROADMAP_DATABASE = {
  'Web Dev': [
    { id: 'topic-0', title: 'How the Web Works', description: 'Understand HTTP, DNS, browsers, and how websites are served to users.', estimatedTime: '2h', difficulty: 'Beginner', videoId: 'hJHvdBlSxug' },
    { id: 'topic-1', title: 'HTML Fundamentals', description: 'Master semantic HTML5 elements, forms, tables, and accessibility.', estimatedTime: '3h', difficulty: 'Beginner', videoId: 'pQN-pnXPaVg' },
    { id: 'topic-2', title: 'CSS & Modern Layouts', description: 'Style websites using Flexbox, CSS Grid, animations, and custom properties.', estimatedTime: '4h', difficulty: 'Beginner', videoId: '1Rs2ND1ryYc' },
    { id: 'topic-3', title: 'JavaScript Essentials', description: 'Learn variables, functions, arrays, objects, and control flow.', estimatedTime: '5h', difficulty: 'Intermediate', videoId: 'W6NZfCO5SIk' },
    { id: 'topic-4', title: 'DOM Manipulation', description: 'Interact with webpage elements dynamically using JavaScript.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'y17RuWUpcgU' },
    { id: 'topic-5', title: 'Async JavaScript', description: 'Promises, Async/Await, Fetch API — handle async operations like a pro.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'V_Kr9OSfDeU' },
    { id: 'topic-6', title: 'Responsive Design', description: 'Build sites that adapt beautifully to all screen sizes with media queries.', estimatedTime: '2h', difficulty: 'Intermediate', videoId: 'srvUrASNj0s' },
    { id: 'topic-7', title: 'Deploy Your Website', description: 'Take your project live using GitHub Pages, Netlify, or Vercel.', estimatedTime: '2h', difficulty: 'Beginner', videoId: 'Bj4MwGXvNFY' },
  ],
  'Python': [
    { id: 'topic-0', title: 'Python Fundamentals', description: 'Syntax, variables, data types, operators, and your first Python programs.', estimatedTime: '3h', difficulty: 'Beginner', videoId: '_uQrJ0TkZlc' },
    { id: 'topic-1', title: 'Control Flow & Loops', description: 'Master if/else, for loops, while loops, and list comprehensions.', estimatedTime: '2h', difficulty: 'Beginner', videoId: 'rfscVS0vtbw' },
    { id: 'topic-2', title: 'Functions & Modules', description: 'Write reusable code with functions, default args, *args, **kwargs, and imports.', estimatedTime: '3h', difficulty: 'Beginner', videoId: '9Os0o3wzS_I' },
    { id: 'topic-3', title: 'Data Structures', description: 'Lists, dictionaries, sets, tuples — when to use which and how.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'W8KKm3b4oLc' },
    { id: 'topic-4', title: 'Object-Oriented Python', description: 'Classes, objects, inheritance, encapsulation, and polymorphism.', estimatedTime: '4h', difficulty: 'Intermediate', videoId: 'JeznW_7DlB0' },
    { id: 'topic-5', title: 'File I/O & Error Handling', description: 'Read/write files, handle exceptions, and work with JSON/CSV data.', estimatedTime: '2h', difficulty: 'Intermediate', videoId: 'Uh2ebFW8OO0' },
    { id: 'topic-6', title: 'APIs & External Libraries', description: 'Use pip, requests, and popular Python libraries to build real projects.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'tb8gHvYlCFs' },
    { id: 'topic-7', title: 'Python Projects', description: 'Build real-world projects: web scraper, automation script, data analyzer.', estimatedTime: '5h', difficulty: 'Advanced', videoId: 'QRn26s8j8Vs' },
  ],
  'MERN': [
    { id: 'topic-0', title: 'JavaScript ES6+ Mastery', description: 'Arrow functions, destructuring, spread/rest, modules — JS you need for MERN.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'NCwa_xi0Uuc' },
    { id: 'topic-1', title: 'React Foundations', description: 'Components, JSX, props, state, and the virtual DOM explained clearly.', estimatedTime: '4h', difficulty: 'Intermediate', videoId: 'bMknfKXIFA8' },
    { id: 'topic-2', title: 'React Hooks Deep Dive', description: 'useState, useEffect, useContext, useRef — modern React without class components.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'O6P86uwfdR0' },
    { id: 'topic-3', title: 'Node.js & Express', description: 'Build a REST API from scratch with routing, middleware, and error handling.', estimatedTime: '4h', difficulty: 'Intermediate', videoId: 'Oe421EPjeBE' },
    { id: 'topic-4', title: 'MongoDB & Mongoose', description: 'Schema design, CRUD operations, queries, and data modeling.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'ofme2o29ngU' },
    { id: 'topic-5', title: 'JWT Authentication', description: 'Implement secure user login with JSON Web Tokens and bcrypt hashing.', estimatedTime: '3h', difficulty: 'Advanced', videoId: 'mbsmsi7l3r4' },
    { id: 'topic-6', title: 'Connecting Frontend & Backend', description: 'Link React to Express with Axios, handle CORS, and manage API state.', estimatedTime: '3h', difficulty: 'Advanced', videoId: 'pKd0Rpw7O_k' },
    { id: 'topic-7', title: 'Deploy Your MERN App', description: 'Ship to production on Render/Railway (backend) + Vercel (frontend).', estimatedTime: '2h', difficulty: 'Intermediate', videoId: '7CqJlxBYj-M' },
  ],
  'DSA': [
    { id: 'topic-0', title: 'Big O & Complexity', description: 'Analyze time and space complexity — the foundation of all algorithm thinking.', estimatedTime: '2h', difficulty: 'Beginner', videoId: 'Mo4vesaut8g' },
    { id: 'topic-1', title: 'Arrays & Strings', description: 'Two-pointer, sliding window, and other key patterns for array problems.', estimatedTime: '4h', difficulty: 'Beginner', videoId: '4C_igB8MKNE' },
    { id: 'topic-2', title: 'Linked Lists', description: 'Singly/doubly linked lists, reversal, cycle detection, and merge sort.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'Hj_rA0dhr5s' },
    { id: 'topic-3', title: 'Stacks & Queues', description: 'Implement and apply stacks, queues, and monotonic stacks.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'wjI1WNcIntg' },
    { id: 'topic-4', title: 'Trees & Binary Search Trees', description: 'Tree traversals, BST operations, height/depth, and balanced trees.', estimatedTime: '4h', difficulty: 'Intermediate', videoId: 'fAAZixBEILs' },
    { id: 'topic-5', title: 'Graphs & BFS/DFS', description: 'Graph representation, BFS, DFS, shortest path, and cycle detection.', estimatedTime: '4h', difficulty: 'Advanced', videoId: 'tWVWeAqZ0WU' },
    { id: 'topic-6', title: 'Dynamic Programming', description: 'Memoization, tabulation, and classic DP patterns (knapsack, LCS, etc.).', estimatedTime: '5h', difficulty: 'Advanced', videoId: 'vYquumk4nXw' },
    { id: 'topic-7', title: 'Interview Practice', description: 'Solve LeetCode patterns, mock interviews, and submission strategies.', estimatedTime: '6h', difficulty: 'Advanced', videoId: 'ZmMVDVRHPb8' },
  ],
  'React': [
    { id: 'topic-0', title: 'React Core Concepts', description: 'JSX, components, props, and the component lifecycle explained.', estimatedTime: '3h', difficulty: 'Beginner', videoId: 'bMknfKXIFA8' },
    { id: 'topic-1', title: 'State & Event Handling', description: 'useState, event handlers, controlled inputs, and lifting state up.', estimatedTime: '3h', difficulty: 'Beginner', videoId: 'O6P86uwfdR0' },
    { id: 'topic-2', title: 'useEffect & Side Effects', description: 'Data fetching, subscriptions, cleanup, and dependency arrays.', estimatedTime: '2h', difficulty: 'Intermediate', videoId: 'UVhIMwHDS9k' },
    { id: 'topic-3', title: 'React Router', description: 'Multi-page SPAs with React Router, nested routes, and URL params.', estimatedTime: '2h', difficulty: 'Intermediate', videoId: 'Jppoj_4H8jU' },
    { id: 'topic-4', title: 'Context API & Global State', description: 'Share state without prop drilling using useContext and createContext.', estimatedTime: '2h', difficulty: 'Intermediate', videoId: 'lhMKvyLRWo0' },
    { id: 'topic-5', title: 'Performance Optimization', description: 'useMemo, useCallback, React.memo, and lazy loading.', estimatedTime: '3h', difficulty: 'Advanced', videoId: 'qySZIzZvZOY' },
    { id: 'topic-6', title: 'Forms & Validation', description: 'React Hook Form, Zod validation, and controlled vs uncontrolled inputs.', estimatedTime: '2h', difficulty: 'Intermediate', videoId: 'bU_eq8qyjic' },
    { id: 'topic-7', title: 'Build & Deploy', description: 'Vite, production builds, and deploying React apps to Vercel/Netlify.', estimatedTime: '2h', difficulty: 'Beginner', videoId: 'XVhPShjvfv0' },
  ],
  'Machine Learning': [
    { id: 'topic-0', title: 'ML Fundamentals', description: 'Supervised vs unsupervised learning, training/testing, and model evaluation.', estimatedTime: '3h', difficulty: 'Beginner', videoId: 'ukzFI9rgwfU' },
    { id: 'topic-1', title: 'Python for ML', description: 'NumPy, Pandas, and Matplotlib — the data science toolkit.', estimatedTime: '4h', difficulty: 'Beginner', videoId: 'LHBE0uhFjHk' },
    { id: 'topic-2', title: 'Regression Algorithms', description: 'Linear regression, polynomial regression, and regularization.', estimatedTime: '3h', difficulty: 'Intermediate', videoId: 'NUXdtN1W1FE' },
    { id: 'topic-3', title: 'Classification Algorithms', description: 'Logistic regression, decision trees, random forests, and SVMs.', estimatedTime: '4h', difficulty: 'Intermediate', videoId: 'l6sSCNsRFTI' },
    { id: 'topic-4', title: 'Neural Networks Basics', description: 'Perceptrons, activation functions, backpropagation, and training.', estimatedTime: '4h', difficulty: 'Advanced', videoId: 'aircAruvnKk' },
    { id: 'topic-5', title: 'Deep Learning with TensorFlow', description: 'Build and train neural networks using TensorFlow and Keras.', estimatedTime: '5h', difficulty: 'Advanced', videoId: 'tPYj3fFJGjk' },
    { id: 'topic-6', title: 'Model Evaluation & Tuning', description: 'Cross-validation, hyperparameter tuning, and avoiding overfitting.', estimatedTime: '3h', difficulty: 'Advanced', videoId: 'fwY9Qv96DJw' },
    { id: 'topic-7', title: 'ML Projects', description: 'Build end-to-end: image classifier, price predictor, or NLP model.', estimatedTime: '6h', difficulty: 'Advanced', videoId: 'i_LwzRVP7bg' },
  ],
};

export const getRoadmapForTopic = (topic) => {
  // Exact match
  if (ROADMAP_DATABASE[topic]) return ROADMAP_DATABASE[topic];

  // Case-insensitive match
  const key = Object.keys(ROADMAP_DATABASE).find(
    k => k.toLowerCase() === topic?.toLowerCase()
  );
  if (key) return ROADMAP_DATABASE[key];

  // Partial match
  const partial = Object.keys(ROADMAP_DATABASE).find(
    k => k.toLowerCase().includes(topic?.toLowerCase()) || topic?.toLowerCase().includes(k.toLowerCase())
  );
  if (partial) return ROADMAP_DATABASE[partial];

  // Default fallback — Web Dev
  return ROADMAP_DATABASE['Web Dev'];
};

export const DIFFICULTY_COLORS = {
  'Beginner': { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.3)' },
  'Intermediate': { bg: 'rgba(99,102,241,0.15)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  'Advanced': { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
};
