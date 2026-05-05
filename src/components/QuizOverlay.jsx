import React, { useState, useEffect, useRef } from 'react';
import { evaluateAnswer, generateAnalogy } from '../services/ClaudeAPI';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function QuizOverlay({ topic, onResume, onMetricsTracked }) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('typing'); // typing, evaluating, correct, wrong, analogy
  const [feedback, setFeedback] = useState('');
  const [analogy, setAnalogy] = useState('');
  
  // Metrics
  const startTime = useRef(Date.now());
  const firstKeypressTime = useRef(null);
  const backspaceCount = useRef(0);

  const handleKeyDown = (e) => {
    if (!firstKeypressTime.current && e.key !== 'Enter') {
      firstKeypressTime.current = Date.now();
    }
    if (e.key === 'Backspace') {
      backspaceCount.current += 1;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setStatus('evaluating');
    
    const timeTakenMs = Date.now() - startTime.current;
    const firstKeypressDelay = firstKeypressTime.current ? firstKeypressTime.current - startTime.current : timeTakenMs;
    
    // Evaluate answer
    const result = await evaluateAnswer(topic.title, answer);
    
    if (result.correct) {
      setStatus('correct');
      setFeedback(result.feedback || 'Correct! Resuming...');
      
      onMetricsTracked({
        timeTaken: timeTakenMs,
        firstKeypress: firstKeypressDelay,
        backspaces: backspaceCount.current,
        correct: true
      });

      setTimeout(() => {
        onResume();
      }, 2000);
    } else {
      setStatus('wrong');
      
      onMetricsTracked({
        timeTaken: timeTakenMs,
        firstKeypress: firstKeypressDelay,
        backspaces: backspaceCount.current,
        correct: false
      });

      const newAnalogy = await generateAnalogy(topic.title);
      setAnalogy(newAnalogy);
      setStatus('analogy');
    }
  };

  const handleExplainDifferently = async () => {
    setStatus('evaluating');
    const newAnalogy = await generateAnalogy(topic.title);
    setAnalogy(newAnalogy);
    setStatus('analogy');
  };

  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-lg">
        
        {status === 'typing' || status === 'evaluating' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Quick Check: {topic.title}</h2>
            <p className="text-slate-300">Explain the core concept in your own words.</p>
            
            <textarea
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-4 focus:ring-2 focus:ring-primary outline-none resize-none disabled:opacity-50"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === 'evaluating'}
              autoFocus
            />
            
            <button
              type="submit"
              disabled={status === 'evaluating' || !answer.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg flex justify-center items-center disabled:opacity-50"
            >
              {status === 'evaluating' ? (
                <><RefreshCw className="animate-spin w-5 h-5 mr-2" /> Evaluating...</>
              ) : 'Submit Answer'}
            </button>
          </form>
        ) : status === 'correct' ? (
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="mx-auto w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-accent">Correct!</h2>
            <p className="text-slate-300">{feedback}</p>
          </div>
        ) : status === 'analogy' ? (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="text-secondary w-6 h-6" />
              <h2 className="text-xl font-bold">Let's reframe this</h2>
            </div>
            
            <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700">
              <p className="text-lg leading-relaxed">{analogy}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={onResume}
                className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-lg"
              >
                Got it
              </button>
              <button
                onClick={handleExplainDifferently}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
              >
                Explain Differently
              </button>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
