import React, { useState, useEffect, useRef } from 'react';
import { Brain, Zap, Coffee, ChevronRight, CheckCircle2, XCircle, Lightbulb, Trophy, RefreshCw } from 'lucide-react';

const SLOW_THRESHOLD_MS  = 40_000; // avg > 40s → exhausted
const FAST_THRESHOLD_MS  = 12_000; // avg < 12s and score ≥ 80% → advanced next

export default function VideoQuizOverlay({ visible, questions = [], topicTitle = '', difficulty, onComplete, onResume }) {
  const [idx, setIdx]             = useState(0);
  const [input, setInput]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect]     = useState(false);
  const [results, setResults]     = useState([]);   // { correct, timeTaken }
  const [phase, setPhase]         = useState('quiz'); // quiz | exhausted | excellent | done
  const [exhaustedEx, setExhaustedEx] = useState(null);
  const inputRef = useRef(null);
  const qStart   = useRef(Date.now());

  // Reset every time overlay opens
  useEffect(() => {
    if (visible) {
      setIdx(0); setInput(''); setSubmitted(false);
      setResults([]); setPhase('quiz');
      qStart.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  // Focus input on new question
  useEffect(() => {
    if (phase === 'quiz' && !submitted) {
      qStart.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [idx, phase, submitted]);

  if (!visible || questions.length === 0) return null;

  const q = questions[idx];

  const checkAnswer = (userInput) => {
    const norm = (s) => s.trim().toLowerCase().replace(/[<>]/g, '').replace(/\s+/g, ' ');
    const accepted = [q.answer, ...(q.acceptedAnswers || [])];
    return accepted.some(a => norm(userInput) === norm(a));
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    const timeTaken = Date.now() - qStart.current;
    const isCorrect = checkAnswer(input);
    setCorrect(isCorrect);
    setSubmitted(true);
    setResults(prev => [...prev, { correct: isCorrect, timeTaken }]);
  };

  const handleNext = () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1);
      setInput('');
      setSubmitted(false);
    } else {
      // All questions answered — evaluate
      const allResults = [...results];
      const avgTime    = allResults.reduce((a, b) => a + b.timeTaken, 0) / allResults.length;
      const correctCnt = allResults.filter(r => r.correct).length;
      const score      = Math.round((correctCnt / allResults.length) * 100);

      if (avgTime > SLOW_THRESHOLD_MS) {
        // Lazy import to avoid circular deps
        import('../data/quizBank.js').then(({ getExhaustedExample }) => {
          setExhaustedEx(getExhaustedExample(topicTitle));
        });
        setPhase('exhausted');
      } else if (avgTime < FAST_THRESHOLD_MS && score >= 80) {
        setPhase('excellent');
        onComplete?.({ avgTime, score, correctCnt, nextDifficulty: 'intermediate' });
      } else {
        setPhase('done');
        onComplete?.({ avgTime, score, correctCnt, nextDifficulty: difficulty });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitted ? handleNext() : handleSubmit();
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>

      <div className="w-full max-w-lg animate-fade-in-up" style={{
        background: 'rgba(8,16,34,0.95)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '24px',
        boxShadow: '0 0 60px rgba(99,102,241,0.2)',
        overflow: 'hidden',
      }}>

        {/* ── QUIZ PHASE ── */}
        {phase === 'quiz' && (
          <>
            {/* Header */}
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Knowledge Check</div>
                    <div className="text-xs text-slate-500">{topicTitle}</div>
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                  {idx + 1} / {questions.length}
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{
                    background: i < idx ? '#10b981' : i === idx ? '#6366f1' : 'rgba(51,65,85,0.8)',
                  }} />
                ))}
              </div>
            </div>

            {/* Question body */}
            <div className="p-6">
              <p className="text-white font-medium text-lg leading-relaxed mb-5" style={{ minHeight: '56px' }}>
                {q.prompt.split('_______').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="inline-block mx-1 px-3 py-0.5 rounded-lg text-indigo-300 font-mono text-base"
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px dashed rgba(99,102,241,0.4)', minWidth: '80px' }}>
                        {submitted ? (correct ? input : <span style={{ color: '#f87171' }}>{input || '?'}</span>) : '_______'}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>

              {/* Input */}
              {!submitted ? (
                <>
                  <div className="relative mb-4">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer..."
                      className="w-full text-white placeholder-slate-500 px-4 py-3 rounded-xl outline-none transition-all font-mono text-lg"
                      style={{
                        background: 'rgba(15,25,50,0.8)',
                        border: '1.5px solid rgba(99,102,241,0.3)',
                        caretColor: '#6366f1',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.8)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                    />
                  </div>

                  {/* Hint */}
                  <div className="flex items-start gap-2 mb-5 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-300/80 text-sm">{q.hint}</p>
                  </div>

                  <button onClick={handleSubmit} disabled={!input.trim()}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all"
                    style={{
                      background: input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(51,65,85,0.5)',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                    }}>
                    Submit Answer ↵
                  </button>
                </>
              ) : (
                /* Result state */
                <>
                  <div className="p-4 rounded-xl mb-4" style={{
                    background: correct ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${correct ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      {correct
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        : <XCircle className="w-5 h-5 text-red-400" />}
                      <span className="font-bold" style={{ color: correct ? '#10b981' : '#f87171' }}>
                        {correct ? 'Correct! 🎉' : `Not quite — the answer is "${q.answer}"`}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
                  </div>

                  <button onClick={handleNext}
                    className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {idx < questions.length - 1 ? 'Next Question' : 'See Results'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* ── EXHAUSTED PHASE ── */}
        {phase === 'exhausted' && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">😴</div>
            <h2 className="text-xl font-bold text-white mb-2">You might be exhausted</h2>
            <p className="text-slate-400 text-sm mb-5">That's okay — learning takes energy. Let me show you a real-world example to make this click.</p>

            {exhaustedEx && (
              <div className="text-left p-4 rounded-2xl mb-5" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-cyan-300 text-sm">{exhaustedEx.title}</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{exhaustedEx.example}</p>
              </div>
            )}

            <p className="text-slate-400 text-xs mb-5">Take a short break, then come back — your progress is saved.</p>

            <div className="flex gap-3">
              <button onClick={onResume} className="flex-1 py-3 rounded-xl font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                I'm Ready — Resume Video
              </button>
            </div>
          </div>
        )}

        {/* ── EXCELLENT PHASE ── */}
        {phase === 'excellent' && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-xl font-bold text-white mb-2">You're crushing it!</h2>
            <p className="text-slate-300 text-sm mb-5">
              Amazing speed and accuracy. The next quiz will be <span className="text-indigo-400 font-bold">more challenging</span> to match your level.
            </p>
            <div className="p-4 rounded-2xl mb-5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="text-2xl font-bold gradient-text">{Math.round(results.filter(r => r.correct).length / results.length * 100)}% Score</div>
              <div className="text-slate-400 text-sm mt-1">Difficulty bumped up for next quiz 🔥</div>
            </div>
            <button onClick={onResume} className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Resume Video
            </button>
          </div>
        )}

        {/* ── DONE PHASE ── */}
        {phase === 'done' && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="text-xl font-bold text-white mb-2">Quiz Complete!</h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="text-2xl font-bold text-emerald-400">{results.filter(r => r.correct).length}/{results.length}</div>
                <div className="text-xs text-slate-400">Correct</div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="text-2xl font-bold text-indigo-400">{Math.round(results.filter(r => r.correct).length / results.length * 100)}%</div>
                <div className="text-xs text-slate-400">Score</div>
              </div>
            </div>
            <button onClick={onResume} className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Resume Video 🎬
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
