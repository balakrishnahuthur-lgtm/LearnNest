import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Lightbulb, Trophy, RefreshCw, ChevronRight, Loader2, Lock, Flame } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateDoubtIntervention, generateSpeedIntervention } from '../services/ClaudeAPI';

const PASS_THRESHOLD = 0.6; // 60% to pass

export default function EndOfModuleQuiz({ visible, questions, topicTitle, loading, onPass, onFail }) {
  const { demoMode } = useAppContext();
  
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [idx, setIdx]             = useState(0);
  const [input, setInput]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults]     = useState([]);   // {correct, answer, expected}
  const [phase, setPhase]         = useState('quiz'); // quiz | result
  const inputRef = useRef(null);

  // Telemetry & Triggers
  const questionStartTime = useRef(Date.now());
  const backspaceCount    = useRef(0);
  const [intervention, setIntervention] = useState(null); // { type: 'doubt'|'speed', status: 'loading'|'ready', data: any }
  const [queueSpeedIntervention, setQueueSpeedIntervention] = useState(false);
  const [hardModeTimeLeft, setHardModeTimeLeft] = useState(null);

  // Initialize questions
  useEffect(() => {
    if (questions && questions.length > 0) {
      setActiveQuestions(questions.map(q => ({ ...q })));
    }
  }, [questions]);

  // Reset when opened
  useEffect(() => {
    if (visible && activeQuestions.length > 0) {
      setIdx(0); setInput(''); setSubmitted(false);
      setResults([]); setPhase('quiz'); setIntervention(null);
      setQueueSpeedIntervention(false); setHardModeTimeLeft(null);
      questionStartTime.current = Date.now();
      backspaceCount.current = 0;
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible, activeQuestions.length]);

  // Reset on index change
  useEffect(() => {
    if (phase === 'quiz' && !submitted && !intervention) {
      setInput(''); setSubmitted(false);
      setQueueSpeedIntervention(false);
      questionStartTime.current = Date.now();
      backspaceCount.current = 0;
      
      const q = activeQuestions[idx];
      if (q?.isHardMode) {
        setHardModeTimeLeft(10);
      } else {
        setHardModeTimeLeft(null);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [idx, phase, submitted, intervention, activeQuestions]);

  // Telemetry monitoring loop & Hard Mode Countdown
  useEffect(() => {
    if (!visible || phase !== 'quiz' || submitted || intervention || activeQuestions.length === 0) return;

    const interval = setInterval(() => {
      const q = activeQuestions[idx];
      
      // Hard Mode Countdown Logic
      if (q?.isHardMode && hardModeTimeLeft !== null) {
        setHardModeTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
        return;
      }

      // Doubt Trigger Logic (only for normal questions)
      if (!q?.isHardMode) {
        const promptText = q?.prompt || q?.question || '';
        const wordCount = promptText.trim().split(/\s+/).length;
        // 500ms reading time per word + 5000ms cognitive buffer. Min 10s, Max 30s.
        const dynamicThreshold = Math.max(10000, Math.min(30000, (wordCount * 500) + 5000));
        
        const timeSpent = Date.now() - questionStartTime.current;
        // console.log(`[Quiz Timer] words: ${wordCount} | threshold: ${dynamicThreshold}ms | timeSpent: ${timeSpent}ms`);
        if (timeSpent > dynamicThreshold && !intervention) {
          // console.log('[Quiz Timer] Threshold reached! Firing doubt intervention...');
          triggerDoubtIntervention();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, phase, submitted, intervention, idx, activeQuestions, hardModeTimeLeft]);

  if (!visible) return null;

  // ── Loading state ─────────────────────────────────────────────
  if (loading || activeQuestions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-white font-bold text-lg">Building your module quiz…</p>
        <p className="text-slate-400 text-sm mt-1">Analyzing video captions...</p>
      </div>
    );
  }

  const q     = activeQuestions[idx];
  const total = activeQuestions.length;

  // ── Actions ───────────────────────────────────────────────────
  const triggerDoubtIntervention = async () => {
    setIntervention({ type: 'doubt', status: 'loading' });
    const promptText = q.prompt || q.question || '';
    const res = await generateDoubtIntervention(topicTitle, promptText, demoMode);
    setIntervention({ type: 'doubt', status: 'ready', data: res });
  };

  const checkAnswer = (userInput) => {
    const norm = (s) => s.trim().toLowerCase().replace(/[<>()]/g, '').replace(/\s+/g, ' ');
    const accepted = [q.answer, ...(q.acceptedAnswers || [])];
    return accepted.some(a => norm(userInput) === norm(a));
  };

  const handleTimeOut = () => {
    if (submitted) return;
    setIsCorrect(false);
    setSubmitted(true);
    setResults(prev => [...prev, { correct: false, answer: 'TIME OUT', expected: q.answer }]);
  };

  const handleSubmit = () => {
    if (!input.trim() || submitted || intervention) return;
    
    const correct = checkAnswer(input);
    const timeSpent = Date.now() - questionStartTime.current;

    setIsCorrect(correct);
    setSubmitted(true);
    setResults(prev => [...prev, { correct, answer: input, expected: q.answer }]);

    // Speed Trigger Logic
    if (correct && timeSpent < 5000 && !q.isHardMode && idx < total - 1) {
      setQueueSpeedIntervention(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) handleSubmit();
    if (e.key === 'Backspace' || e.key === 'Delete') {
      backspaceCount.current += 1;
      if (backspaceCount.current >= 5 && !submitted && !intervention && !q.isHardMode) {
        triggerDoubtIntervention();
      }
    }
  };

  const handleNext = async () => {
    if (queueSpeedIntervention) {
      setIntervention({ type: 'speed', status: 'loading' });
      const res = await generateSpeedIntervention(topicTitle, demoMode);
      setIntervention({ type: 'speed', status: 'ready', data: res });
      return;
    }

    if (idx < total - 1) {
      setIdx(i => i + 1);
      setSubmitted(false);
    } else {
      setPhase('result');
    }
  };

  const applyDoubtIntervention = () => {
    // Swap current question with the easier new question
    const updated = [...activeQuestions];
    updated[idx] = { 
      ...intervention.data.newQuestion, 
      prompt: intervention.data.newQuestion.prompt || intervention.data.newQuestion.question 
    };
    setActiveQuestions(updated);
    setIntervention(null);
    setInput('');
    questionStartTime.current = Date.now();
    backspaceCount.current = 0;
  };

  const applySpeedIntervention = () => {
    // Inject the hard question into the next slot
    const updated = [...activeQuestions];
    updated[idx + 1] = { 
      ...intervention.data.hardQuestion, 
      prompt: intervention.data.hardQuestion.prompt || intervention.data.hardQuestion.question,
      isHardMode: true 
    };
    setActiveQuestions(updated);
    setIntervention(null);
    setQueueSpeedIntervention(false);
    setIdx(i => i + 1);
    setSubmitted(false);
  };

  const handleRetry = () => {
    // Reset back to original questions for a fair retry
    setActiveQuestions(questions.map(orig => ({ ...orig })));
    setIdx(0); setInput(''); setSubmitted(false);
    setResults([]); setPhase('quiz'); setIntervention(null);
    setQueueSpeedIntervention(false); setHardModeTimeLeft(null);
  };

  // ── Results screen ────────────────────────────────────────────
  if (phase === 'result') {
    const correctCount = results.filter(r => r.correct).length;
    const score        = Math.round((correctCount / total) * 100);
    const passed       = correctCount / total >= PASS_THRESHOLD;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0a]">
        <div className="max-w-lg mx-auto py-10 px-5">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{passed ? '🏆' : '📖'}</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {passed ? 'Module Complete!' : 'Not Quite Yet'}
            </h1>
            <p className="text-slate-400">{topicTitle}</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className={`flex flex-col items-center py-6 px-10 rounded-3xl border backdrop-blur-md ${
              passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className={`text-5xl font-black ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {score}%
              </div>
              <div className="text-slate-400 text-sm mt-2 font-medium">
                {correctCount} of {total} correct
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Answer Breakdown</h3>
            {activeQuestions.map((q, i) => {
              const r = results[i];
              return (
                <div key={i} className={`p-4 rounded-xl border flex gap-3 ${
                  r?.correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <span className="text-lg flex-shrink-0">{r?.correct ? '✅' : '❌'}</span>
                  <div className="min-w-0">
                    <div className="text-slate-300 text-sm leading-relaxed">
                      {(q.prompt || q.question || '').replace('_____', `[${q.answer}]`)}
                    </div>
                    {!r?.correct && r?.answer && (
                      <div className="text-red-400 text-xs mt-2 font-medium">
                        Your answer: "{r.answer}" · Correct: "{q.answer}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            {passed ? (
              <button onClick={onPass} className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                🔓 Unlock Next Module
              </button>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center mb-2">
                  <p className="text-amber-400 text-sm">
                    You need <strong>{Math.ceil(PASS_THRESHOLD * total)}/{total}</strong> to pass.
                  </p>
                </div>
                <button onClick={handleRetry} className="w-full py-4 rounded-2xl gradient-primary text-white font-bold transition-all flex justify-center items-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Try Again
                </button>
                <button onClick={onFail} className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">
                  Go Back to Video
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#030305] overflow-hidden">

      {/* Top progress */}
      <div className="bg-[#0a0a0f] border-b border-white/5 py-4 px-5 shrink-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest">🎓 Module Quiz</div>
              <div className="text-slate-400 text-sm mt-1">{topicTitle}</div>
            </div>
            <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              {idx + 1} / {total}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.8)]" 
                 style={{ width: `${((idx + (submitted ? 1 : 0)) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Question body */}
      <div className="flex-1 overflow-y-auto p-5 relative">
        <div className="max-w-lg mx-auto pt-6">

          {q?.isHardMode && (
            <div className="flex items-center gap-2 text-amber-500 mb-4 animate-pulse">
              <Flame className="w-5 h-5" />
              <span className="font-bold uppercase tracking-widest text-sm">Challenge Mode</span>
              {hardModeTimeLeft !== null && (
                <span className={`ml-auto font-black text-lg ${hardModeTimeLeft <= 3 ? 'text-red-500' : 'text-amber-500'}`}>
                  00:{hardModeTimeLeft.toString().padStart(2, '0')}
                </span>
              )}
            </div>
          )}

          <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
            {(q?.prompt || q?.question || '').split('_____').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="inline-block mx-2 px-4 py-1 bg-indigo-500/10 border border-dashed border-indigo-500/50 rounded-xl text-indigo-300 font-mono min-w-[80px]">
                    _____
                  </span>
                )}
              </React.Fragment>
            ))}
          </p>

          {/* Input */}
          {!submitted ? (
            <div className="space-y-4">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-indigo-500/5 transition-all text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                disabled={intervention !== null}
              />

              {q?.hint && (
                <div className="flex gap-3 items-start p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-amber-400/90 text-sm">{q.hint}</p>
                </div>
              )}

              <button 
                onClick={handleSubmit} 
                disabled={!input.trim() || intervention !== null} 
                className="w-full py-4 rounded-2xl gradient-primary text-white font-bold text-lg disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                  <span className={`font-bold text-lg ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isCorrect ? 'Correct! 🎉' : `Answer: "${q.answer}"`}
                  </span>
                </div>
                {q.explanation && (
                  <p className="text-slate-300 text-sm leading-relaxed mt-2">{q.explanation}</p>
                )}
              </div>

              <button onClick={handleNext} className="w-full py-4 rounded-2xl gradient-primary text-white font-bold text-lg flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                {idx < total - 1 ? (queueSpeedIntervention ? 'Continue...' : 'Next Question') : 'See Results'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Interventions Overlays ────────────────────────────────── */}
      {intervention && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-md animate-fade-in">
          {intervention.status === 'loading' ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className="text-white font-bold text-lg">AI is analyzing your behavior...</p>
            </div>
          ) : (
            <div className="glass-card max-w-sm w-full p-6 border-indigo-500/40 shadow-[0_0_50px_rgba(124,58,237,0.3)] animate-fade-in-up text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-primary"></div>
              
              <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              
              {intervention.type === 'doubt' ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Doubt in this topic?</h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    {intervention.data.analogy}
                  </p>
                  <button onClick={applyDoubtIntervention} className="w-full py-3 rounded-xl gradient-primary text-white font-bold shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                    Got it, give me a new question
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Too Easy?</h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    {intervention.data.message}
                  </p>
                  <button onClick={applySpeedIntervention} className="w-full py-3 rounded-xl bg-amber-500 text-black font-black uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                    Bring it on (10s limit)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Just importing Sparkles here to fix the missing import error
function Sparkles(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4M3 5h4M19 3v4M17 5h4M5 19v4M3 21h4M19 19v4M17 21h4"/>
    </svg>
  );
}
