// Fill-in-the-blank question bank organized by topic and difficulty

const bank = {
  webdev: {
    beginner: [
      { prompt: "The HTML tag <___> defines the document title shown in the browser tab.", answer: "title", hint: "Lives inside <head>", explanation: "<title> sets the page title shown in browser tabs and search results." },
      { prompt: "To create a hyperlink in HTML, use the <_> tag with the href attribute.", answer: "a", hint: "Short for 'anchor'", explanation: "<a href='url'> creates clickable links to other pages." },
      { prompt: "The HTML attribute _______ specifies the URL a link goes to.", answer: "href", hint: "Hypertext REFerence", explanation: "href='https://example.com' sets the destination of a link." },
      { prompt: "The <img> tag requires the _____ attribute to specify the image file path.", answer: "src", hint: "Short for 'source'", explanation: "<img src='photo.jpg'> loads an image from the given path." },
      { prompt: "The HTML tag <___> creates an unordered bullet list.", answer: "ul", hint: "Think 'unordered list'", explanation: "<ul> wraps list items (<li>) and renders them as bullet points." },
      { prompt: "To embed JavaScript in an HTML page, use the <______> tag.", answer: "script", hint: "It's the same word as the file extension .js refers to", explanation: "<script src='app.js'></script> loads a JavaScript file." },
      { prompt: "The CSS property _______ controls the space inside an element, between its content and border.", answer: "padding", hint: "It's the inner space", explanation: "padding: 16px adds 16px of space inside the element on all sides." },
      { prompt: "To make text bold in CSS, set font-weight to _______.", answer: "bold", hint: "The opposite of 'thin'", explanation: "font-weight: bold makes text appear thicker/heavier." },
      { prompt: "In CSS, to display elements in a row side by side, set display: _______.", answer: "flex", hint: "Short for 'flexible box'", explanation: "display: flex activates Flexbox layout so children line up in a row." },
      { prompt: "The HTML <______> tag represents a section of navigation links.", answer: "nav", hint: "Short for 'navigation'", explanation: "<nav> is a semantic HTML5 element wrapping site navigation menus." },
      { prompt: "In JavaScript, _______ outputs a message to the browser console.", answer: "console.log", hint: "Two words separated by a dot", explanation: "console.log('hello') prints to DevTools console for debugging." },
      { prompt: "The JavaScript keyword _______ declares a variable that cannot be reassigned.", answer: "const", hint: "Short for 'constant'", explanation: "const x = 5 creates a read-only binding; you cannot do x = 10 later." },
    ],
    intermediate: [
      { prompt: "In CSS, position: _______ removes an element from normal flow and positions it relative to the nearest positioned ancestor.", answer: "absolute", hint: "The element floats free of the layout", explanation: "position: absolute takes the element out of flow; use top/left to position it." },
      { prompt: "The JavaScript method _______ converts a JSON string into a JavaScript object.", answer: "JSON.parse", hint: "You're parsing a string into data", explanation: "JSON.parse('{\"name\":\"Ali\"}') returns the JavaScript object {name: 'Ali'}." },
      { prompt: "In CSS Flexbox, _______ controls how flex items wrap onto multiple lines.", answer: "flex-wrap", hint: "wrap or nowrap are its values", explanation: "flex-wrap: wrap lets items move to the next row when they overflow." },
      { prompt: "The JavaScript array method _______ creates a new array with only elements that pass a test.", answer: "filter", hint: "It keeps some and removes others", explanation: "[1,2,3,4].filter(n => n > 2) returns [3, 4]." },
      { prompt: "In CSS, the _______ property makes an element stick to the top of the screen while scrolling.", answer: "position: sticky", hint: "It sticks in place", explanation: "position: sticky; top: 0 keeps a header fixed at the top as you scroll." },
      { prompt: "The JavaScript method that transforms every element of an array and returns a new array is _______.", answer: "map", hint: "It maps each item to a new value", explanation: "[1,2,3].map(n => n * 2) returns [2, 4, 6]." },
      { prompt: "In CSS Grid, the property _______ defines the number and size of columns.", answer: "grid-template-columns", hint: "Template for columns", explanation: "grid-template-columns: 1fr 1fr creates two equal-width columns." },
      { prompt: "The JavaScript _______ method fetches data from a URL and returns a Promise.", answer: "fetch", hint: "One word, built into browsers", explanation: "fetch('https://api.example.com/data').then(r => r.json()) loads data." },
    ],
    advanced: [
      { prompt: "JavaScript's _______ is a design pattern where a function retains access to its outer scope even after the outer function has returned.", answer: "closure", hint: "The inner function 'closes over' outer variables", explanation: "Closures enable patterns like private variables and factory functions." },
      { prompt: "In CSS, the _______ pseudo-class styles an element only when no child matches a given selector.", answer: ":not", hint: "It's the logical negation", explanation: "li:not(.active) styles all <li> elements that don't have class 'active'." },
      { prompt: "The browser API _______ stores data persistently across sessions with no expiry.", answer: "localStorage", hint: "Two words joined, data persists after tab close", explanation: "localStorage.setItem('key', value) saves data until explicitly cleared." },
      { prompt: "JavaScript Promises have three states: pending, fulfilled, and _______.", answer: "rejected", hint: "When something goes wrong", explanation: "A rejected promise means the async operation failed; catch() handles it." },
      { prompt: "The CSS property _______ defines how an element's size is calculated — whether padding/border are included.", answer: "box-sizing", hint: "Two words, controls the sizing model", explanation: "box-sizing: border-box includes padding and border in the element's total width." },
    ],
  },

  python: {
    beginner: [
      { prompt: "In Python, the keyword _______ is used to define a function.", answer: "def", hint: "Short for 'define'", explanation: "def greet(name): is how you start a function definition in Python." },
      { prompt: "Python uses _______ to display output to the console.", answer: "print", hint: "You 'print' to the terminal", explanation: "print('Hello') shows text in the terminal/console." },
      { prompt: "In Python, a comment starts with the _______ symbol.", answer: "#", hint: "It's the hash symbol", explanation: "# This is a comment — Python ignores everything after # on that line." },
      { prompt: "To create a list in Python, you use _______ brackets.", answer: "square", hint: "[ ] shaped", explanation: "my_list = [1, 2, 3] uses square brackets to create a list." },
      { prompt: "The Python keyword _______ is used inside loops to skip to the next iteration.", answer: "continue", hint: "It means 'move on'", explanation: "continue inside a loop skips the rest of that iteration and starts the next." },
      { prompt: "In Python, _______ is the keyword used to exit a loop immediately.", answer: "break", hint: "It 'breaks' out of the loop", explanation: "break stops the loop entirely and continues with code after it." },
      { prompt: "The Python function _______ returns the number of items in a list.", answer: "len", hint: "Short for 'length'", explanation: "len([1, 2, 3]) returns 3." },
      { prompt: "In Python, you use the _______ keyword to import a module.", answer: "import", hint: "You bring something in", explanation: "import math gives you access to math.sqrt(), math.pi, etc." },
      { prompt: "Python's _______ function returns a sequence of numbers for use in loops.", answer: "range", hint: "Used in 'for i in _____(10)'", explanation: "range(5) generates 0, 1, 2, 3, 4 — commonly used in for loops." },
      { prompt: "To check if a value is in a list in Python, use the _______ keyword.", answer: "in", hint: "A two-letter membership test", explanation: "'apple' in ['apple', 'banana'] returns True." },
    ],
    intermediate: [
      { prompt: "In Python, _______ are immutable sequences defined with parentheses.", answer: "tuples", hint: "Like lists but can't be changed", explanation: "t = (1, 2, 3) — tuples cannot be modified after creation." },
      { prompt: "A Python _______ comprehension creates a new list using a single line of code.", answer: "list", hint: "It's a compact way to build lists", explanation: "[x*2 for x in range(5)] returns [0, 2, 4, 6, 8]." },
      { prompt: "In Python OOP, the _______ method is called automatically when a new object is created.", answer: "__init__", hint: "Double underscores on each side, 'init'", explanation: "def __init__(self, name): sets up the object when you call MyClass()." },
      { prompt: "Python's _______ keyword is used inside a class method to refer to the current instance.", answer: "self", hint: "It refers to 'itself'", explanation: "self.name = name stores name as an attribute of the current object." },
      { prompt: "A Python _______ is a function that takes another function as an argument.", answer: "decorator", hint: "It wraps around another function using @", explanation: "@my_decorator before a function definition applies the decorator." },
      { prompt: "In Python, use _______ to handle errors gracefully.", answer: "try/except", hint: "Two keywords", explanation: "try: ... except Exception as e: catches and handles errors." },
      { prompt: "Python's _______ function applies a function to every item in an iterable.", answer: "map", hint: "It 'maps' a function over a sequence", explanation: "list(map(str, [1,2,3])) returns ['1', '2', '3']." },
    ],
    advanced: [
      { prompt: "A Python _______ is a function that yields values one at a time using the yield keyword.", answer: "generator", hint: "It generates values lazily", explanation: "Generators are memory-efficient for large sequences." },
      { prompt: "In Python, _______ is a built-in data structure for key-value pairs with O(1) lookup.", answer: "dictionary", hint: "Also called a 'dict'", explanation: "d = {'key': 'value'} — dictionaries use hashing for fast lookups." },
      { prompt: "Python's _______ module provides tools for working with async code using async/await.", answer: "asyncio", hint: "Async I/O module", explanation: "import asyncio allows writing non-blocking concurrent code in Python." },
      { prompt: "The _______ design pattern in Python restricts a class to having only one instance.", answer: "singleton", hint: "Single instance, single truth", explanation: "Singletons ensure one shared instance across the whole application." },
    ],
  },

  mern: {
    beginner: [
      { prompt: "In React, a _______ is a reusable piece of UI that can accept inputs called props.", answer: "component", hint: "The building block of React apps", explanation: "Components let you split the UI into independent, reusable pieces." },
      { prompt: "React's _______ hook is used to store and update state inside a functional component.", answer: "useState", hint: "It 'uses' the state feature", explanation: "const [count, setCount] = useState(0) creates a state variable." },
      { prompt: "In Express.js, _______ is used to define a route that handles GET requests.", answer: "app.get", hint: "app dot get", explanation: "app.get('/users', handler) responds to GET /users requests." },
      { prompt: "MongoDB stores data in _______ format, similar to JavaScript objects.", answer: "BSON", hint: "Binary JSON", explanation: "BSON (Binary JSON) is MongoDB's document format, similar to JSON." },
      { prompt: "In React, _______ is used to pass data from a parent component to a child.", answer: "props", hint: "Short for 'properties'", explanation: "<Child name='Ali' /> passes 'Ali' as the name prop to Child." },
      { prompt: "The Node.js _______ module provides an HTTP server without needing Express.", answer: "http", hint: "The protocol name", explanation: "const http = require('http') — the built-in Node HTTP module." },
      { prompt: "In React, JSX stands for JavaScript _______.", answer: "XML", hint: "A markup language", explanation: "JSX = JavaScript XML — it lets you write HTML-like syntax in JS." },
      { prompt: "The Express middleware _______ parses incoming JSON request bodies.", answer: "express.json()", hint: "app.use(express.____())", explanation: "app.use(express.json()) allows reading req.body as a JS object." },
    ],
    intermediate: [
      { prompt: "React's _______ hook runs a side effect after a component renders.", answer: "useEffect", hint: "Effect after render", explanation: "useEffect(() => { fetchData(); }, []) runs once after first render." },
      { prompt: "In MongoDB, _______ is a method that finds documents matching a filter.", answer: "find", hint: "Model._____(filter)", explanation: "User.find({ active: true }) returns all active users." },
      { prompt: "JWT stands for JSON Web _______.", answer: "Token", hint: "It's a credential", explanation: "JWTs are used to securely transmit user identity between client and server." },
      { prompt: "In React Router, the _______ hook returns the current URL parameters.", answer: "useParams", hint: "useP______", explanation: "const { id } = useParams() reads :id from the URL /users/:id." },
      { prompt: "In Mongoose, a _______ defines the shape of documents in a MongoDB collection.", answer: "Schema", hint: "Defines the structure", explanation: "const userSchema = new mongoose.Schema({name: String}) defines a model." },
      { prompt: "The React _______ hook allows you to access context values without prop drilling.", answer: "useContext", hint: "useC________", explanation: "const value = useContext(MyContext) reads from the nearest Provider." },
    ],
    advanced: [
      { prompt: "In React, the _______ hook memoizes a computed value to avoid recalculation on every render.", answer: "useMemo", hint: "useM____", explanation: "const sorted = useMemo(() => items.sort(), [items]) only recalculates when items changes." },
      { prompt: "Express middleware functions receive three arguments: req, res, and _______.", answer: "next", hint: "Call it to pass control to the next middleware", explanation: "Calling next() passes the request to the next middleware in the stack." },
      { prompt: "MongoDB's _______ pipeline is used for complex data aggregation and transformation.", answer: "aggregation", hint: "It's a multi-stage process", explanation: "Model.aggregate([{$match:{}},{$group:{}}]) chains transformation stages." },
    ],
  },

  dsa: {
    beginner: [
      { prompt: "Big O notation O(1) means the algorithm runs in _______ time regardless of input size.", answer: "constant", hint: "Always the same", explanation: "O(1) = constant time — accessing array[0] is always one operation." },
      { prompt: "An array stores elements in _______ memory locations.", answer: "contiguous", hint: "All next to each other", explanation: "Arrays use contiguous memory so any index can be accessed in O(1)." },
      { prompt: "A stack follows the _______ principle — the last item in is the first item out.", answer: "LIFO", hint: "Last In, First Out", explanation: "LIFO: like a stack of plates, you add and remove from the top." },
      { prompt: "A queue follows the _______ principle — the first item in is the first item out.", answer: "FIFO", hint: "First In, First Out", explanation: "FIFO: like a line at a shop, the first person to arrive is served first." },
      { prompt: "Binary search requires the array to be _______ before searching.", answer: "sorted", hint: "Elements must be in order", explanation: "Binary search splits a sorted array in half each time — O(log n)." },
      { prompt: "A _______ is a data structure where each node points to the next node in sequence.", answer: "linked list", hint: "Nodes linked together", explanation: "Linked lists use pointers to chain nodes; no contiguous memory needed." },
      { prompt: "The time complexity of accessing an element by index in an array is O(___).", answer: "1", hint: "Constant time", explanation: "Array indexing is O(1) because memory address = base + index * size." },
    ],
    intermediate: [
      { prompt: "A binary search tree stores values so that all left children are _______ than the parent.", answer: "less", hint: "Smaller on the left", explanation: "BST property: left < parent < right enables O(log n) search." },
      { prompt: "The _______ traversal of a BST visits nodes in sorted ascending order.", answer: "inorder", hint: "Left → Root → Right", explanation: "Inorder (L→N→R) of a BST gives values in ascending sorted order." },
      { prompt: "Dynamic programming solves problems by breaking them into _______ subproblems.", answer: "overlapping", hint: "The subproblems repeat", explanation: "DP stores solutions to subproblems (memoization) to avoid recomputation." },
      { prompt: "Dijkstra's algorithm finds the _______ path between nodes in a weighted graph.", answer: "shortest", hint: "Minimum weight path", explanation: "Dijkstra uses a priority queue to greedily expand the shortest known path." },
      { prompt: "The _______ traversal explores a graph level by level using a queue.", answer: "BFS", hint: "Breadth-First Search", explanation: "BFS visits all neighbors at depth d before going to depth d+1." },
      { prompt: "Merge sort has a time complexity of O(n ___ n).", answer: "log", hint: "n times log n", explanation: "Merge sort divides the array in half recursively — O(n log n) guaranteed." },
    ],
    advanced: [
      { prompt: "A _______ heap always keeps the minimum element at the root.", answer: "min", hint: "The smallest is at the top", explanation: "Min-heaps let you extract the minimum in O(log n) — used in Dijkstra's." },
      { prompt: "The _______ problem asks for the length of the longest subsequence common to two strings.", answer: "LCS", hint: "Longest Common Subsequence", explanation: "LCS is solved with DP in O(m*n) where m and n are string lengths." },
      { prompt: "A _______ is a graph with no cycles and exactly n-1 edges connecting n nodes.", answer: "tree", hint: "Connected, acyclic graph", explanation: "Trees are acyclic connected graphs — the basis of BSTs, heaps, tries." },
    ],
  },

  react: {
    beginner: [
      { prompt: "React components must return a single _______ element (or a Fragment).", answer: "root", hint: "One top-level wrapper", explanation: "JSX must have one root element, e.g., <div>...</div> or <></>" },
      { prompt: "In React, the _______ hook stores mutable values that don't trigger re-renders.", answer: "useRef", hint: "useR___", explanation: "useRef().current holds a value that persists across renders without re-rendering." },
      { prompt: "React re-renders a component when its _______ or props change.", answer: "state", hint: "The component's internal data", explanation: "Calling setState triggers React to re-render the component with new values." },
      { prompt: "In React, key props on list items should be _______ among siblings.", answer: "unique", hint: "Each key must be different", explanation: "Unique keys help React efficiently update the DOM when lists change." },
      { prompt: "React's _______ allows components to share state without prop drilling.", answer: "Context", hint: "Like a global store", explanation: "createContext() + Provider + useContext() share values across components." },
    ],
    intermediate: [
      { prompt: "React's _______ hook memoizes a callback function to prevent unnecessary re-creation.", answer: "useCallback", hint: "useC________", explanation: "useCallback(() => doSomething(), [dep]) only recreates the function when dep changes." },
      { prompt: "In React, lazy loading a component is done with React._______()", answer: "lazy", hint: "The opposite of eager", explanation: "React.lazy(() => import('./Component')) enables code-splitting." },
      { prompt: "A React _______ component wraps children and catches JavaScript errors in the component tree.", answer: "Error Boundary", hint: "Two words — catches errors", explanation: "Class components with componentDidCatch can be used as error boundaries." },
    ],
  },
};

// Get questions for a topic title + difficulty
export const getQuestions = (topicTitle = '', difficulty = 'beginner', count = 5) => {
  const title = topicTitle.toLowerCase();

  let pool;
  if (title.includes('python') || title.includes('file i/o') || title.includes('oop'))
    pool = bank.python;
  else if (title.includes('mern') || title.includes('express') || title.includes('mongodb') || title.includes('jwt'))
    pool = bank.mern;
  else if (title.includes('react') || title.includes('hooks') || title.includes('context'))
    pool = bank.react;
  else if (title.includes('dsa') || title.includes('algorithm') || title.includes('tree') || title.includes('graph') || title.includes('sort'))
    pool = bank.dsa;
  else
    pool = bank.webdev;

  const diffPool = pool[difficulty] || pool.beginner;

  // Shuffle and return `count` questions
  const shuffled = [...diffPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const REAL_WORLD_EXAMPLES = {
  webdev: [
    { title: "Building a Nav Bar", example: "A real navigation bar uses <nav>, <ul>, <li>, and <a> tags — the exact tags you just learned — to create the menus you see on every website." },
    { title: "Styling a Card", example: "Product cards on Amazon use padding (inner space), border-radius (rounded corners), and box-shadow — the CSS properties you're learning right now." },
  ],
  python: [
    { title: "Automating File Renaming", example: "A Python script using loops and the os module can rename thousands of files in seconds — a task that would take hours manually." },
    { title: "Reading CSV Data", example: "Data analysts use Python's csv module and lists/dicts (what you're learning) to process spreadsheets with millions of rows." },
  ],
  mern: [
    { title: "User Authentication", example: "Every 'Login with Google' button you see uses JWT tokens and Express middleware — exactly the concepts in your current module." },
    { title: "Real-time Chat", example: "WhatsApp Web uses React state + WebSockets to update messages instantly — state management is what makes it reactive." },
  ],
  dsa: [
    { title: "Google Search Suggestions", example: "Google's autocomplete uses a Trie data structure (a type of tree) to instantly suggest completions for billions of searches." },
    { title: "GPS Navigation", example: "Google Maps uses Dijkstra's algorithm to find the shortest route — the exact shortest-path algorithm you're studying." },
  ],
  react: [
    { title: "Instagram's Feed", example: "Instagram's feed is a list of React components. Each post is a component receiving photo, likes, and comments as props." },
    { title: "GitHub's Dark Mode Toggle", example: "GitHub's dark mode uses React context to share the theme across hundreds of components without prop drilling." },
  ],
};

export const getExhaustedExample = (topicTitle = '') => {
  const title = topicTitle.toLowerCase();
  if (title.includes('python')) return REAL_WORLD_EXAMPLES.python[Math.floor(Math.random() * 2)];
  if (title.includes('mern') || title.includes('react') || title.includes('express')) return REAL_WORLD_EXAMPLES.mern[Math.floor(Math.random() * 2)];
  if (title.includes('react')) return REAL_WORLD_EXAMPLES.react[Math.floor(Math.random() * 2)];
  if (title.includes('dsa') || title.includes('algorithm')) return REAL_WORLD_EXAMPLES.dsa[Math.floor(Math.random() * 2)];
  return REAL_WORLD_EXAMPLES.webdev[Math.floor(Math.random() * 2)];
};
