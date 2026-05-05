import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Lightbulb, Trophy, RefreshCw, ChevronRight, Loader2, Lock } from 'lucide-react';

const PASS_THRESHOLD = 0.6; // 60% to pass

export default function EndOfModuleQuiz({ visible, questions, topicTitle, loading, onPass, onFail }) {
  const [idx, setIdx]           = useState(0);
  const [input, setInput]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults]   = useState([]);   // {correct, answer, expected}
  const [phase, setPhase]       = useState('quiz'); // quiz | result
  const inputRef = useRef(null);

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setIdx(0); setInput(''); setSubmitted(false);
      setResults([]); setPhase('quiz');
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  useEffect(() => {
    if (phase === 'quiz' && !submitted) {
      setInput(''); setSubmitted(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [idx]);

  if (!visible) return null;

  // ── Loading state ─────────────────────────────────────────────
  if (loading || !questions || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: '#0a0a0a' }}>
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#7c3aed' }} />
        <p style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '16px' }}>Building your module quiz…</p>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '6px' }}>Analysing everything covered in this video</p>
      </div>
    );
  }

  const q         = questions[idx];
  const total     = questions.length;
  const pct       = Math.round((idx / total) * 100);

  const checkAnswer = (userInput) => {
    const norm = (s) => s.trim().toLowerCase().replace(/[<>()]/g, '').replace(/\s+/g, ' ');
    const accepted = [q.answer, ...(q.acceptedAnswers || [])];
    return accepted.some(a => norm(userInput) === norm(a));
  };

  const handleSubmit = () => {
    if (!input.trim() || submitted) return;
    const correct = checkAnswer(input);
    setIsCorrect(correct);
    setSubmitted(true);
    setResults(prev => [...prev, { correct, answer: input, expected: q.answer }]);
  };

  const handleNext = () => {
    if (idx < total - 1) {
      setIdx(i => i + 1);
      setSubmitted(false);
    } else {
      setPhase('result');
    }
  };

  const handleRetry = () => {
    setIdx(0); setInput(''); setSubmitted(false);
    setResults([]); setPhase('quiz');
  };

  // ── Results screen ────────────────────────────────────────────
  if (phase === 'result') {
    const correctCount = results.filter(r => r.correct).length;
    const score        = Math.round((correctCount / total) * 100);
    const passed       = correctCount / total >= PASS_THRESHOLD;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#0a0a0a' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>{passed ? '🏆' : '📖'}</div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f0f0', marginBottom: '6px' }}>
              {passed ? 'Module Complete!' : 'Not Quite Yet'}
            </h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {topicTitle}
            </p>
          </div>

          {/* Score ring */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              padding: '24px 40px', borderRadius: '20px',
              background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${passed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: passed ? '#10b981' : '#f87171' }}>
                {score}%
              </div>
              <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                {correctCount} of {total} correct
              </div>
            </div>
          </div>

          {/* Question-by-question breakdown */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Answer Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {questions.map((q, i) => {
                const r = results[i];
                return (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: '10px',
                    background: r?.correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${r?.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                  }}>
                    <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>
                      {r?.correct ? '✅' : '❌'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#ccc', fontSize: '12px', lineHeight: '1.4' }}>
                        {q.prompt?.replace('_____', `[${q.answer}]`) || q.question}
                      </div>
                      {!r?.correct && r?.answer && (
                        <div style={{ color: '#f87171', fontSize: '11px', marginTop: '3px' }}>
                          Your answer: "{r.answer}" · Correct: "{q.answer}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTAs */}
          {passed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={onPass} className="btn-primary" style={{ fontSize: '16px', padding: '16px' }}>
                🔓 Unlock Next Module
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '4px' }}>
                <p style={{ color: '#fbbf24', fontSize: '13px', lineHeight: '1.5' }}>
                  You need <strong>{Math.ceil(PASS_THRESHOLD * total)}/{total}</strong> to pass. Watch the video again and try once more!
                </p>
              </div>
              <button onClick={handleRetry} className="btn-primary">
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <RefreshCw style={{ width: '15px', height: '15px' }} /> Try Again
                </span>
              </button>
              <button onClick={onFail} className="btn-secondary">Go Back to Video</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0a0a' }}>

      {/* Top progress */}
      <div style={{ background: '#111', borderBottom: '1px solid #1f1f1f', padding: '12px 20px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <div style={{ color: '#7c3aed', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🎓 Module Quiz
              </div>
              <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>{topicTitle}</div>
            </div>
            <span style={{
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: '999px', padding: '4px 12px', color: '#a78bfa', fontSize: '12px', fontWeight: 600,
            }}>
              {idx + 1} / {total}
            </span>
          </div>
          {/* Progress bar */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((idx + (submitted ? 1 : 0)) / total) * 100}%` }} />
          </div>
          {/* Correct tally */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            {results.map((r, i) => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: r.correct ? '#10b981' : '#ef4444',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Question body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          <p style={{ fontSize: '17px', fontWeight: 600, color: '#f0f0f0', lineHeight: '1.65', marginBottom: '24px' }}>
            {(q.prompt || q.question || '').split('_____').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span style={{
                    display: 'inline-block', margin: '0 4px', padding: '1px 12px',
                    background: 'rgba(124,58,237,0.12)', border: '1px dashed rgba(124,58,237,0.5)',
                    borderRadius: '8px', color: '#a78bfa', fontFamily: 'monospace', minWidth: '80px',
                  }}>
                    _____
                  </span>
                )}
              </React.Fragment>
            ))}
          </p>

          {/* Input */}
          {!submitted ? (
            <>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && input.trim() && handleSubmit()}
                placeholder="Type your answer..."
                className="input-field"
                style={{ marginBottom: '12px', fontSize: '16px' }}
              />

              {/* Hint */}
              {q.hint && (
                <div style={{
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
                  background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)',
                }}>
                  <Lightbulb style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ color: '#d97706', fontSize: '13px' }}>{q.hint}</p>
                </div>
              )}

              <button onClick={handleSubmit} disabled={!input.trim()} className="btn-primary">
                Submit Answer
              </button>
            </>
          ) : (
            /* Result for this question */
            <>
              <div style={{
                padding: '16px', borderRadius: '12px', marginBottom: '16px',
                background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {isCorrect
                    ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#10b981' }} />
                    : <XCircle     style={{ width: '18px', height: '18px', color: '#f87171' }} />}
                  <span style={{ fontWeight: 700, color: isCorrect ? '#10b981' : '#f87171', fontSize: '14px' }}>
                    {isCorrect ? 'Correct! 🎉' : `Answer: "${q.answer}"`}
                  </span>
                </div>
                {q.explanation && (
                  <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.55' }}>{q.explanation}</p>
                )}
              </div>

              <button onClick={handleNext} className="btn-primary">
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {idx < total - 1 ? 'Next Question' : 'See Results'}
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom note */}
      <div style={{ padding: '12px 20px', textAlign: 'center', borderTop: '1px solid #1a1a1a' }}>
        <p style={{ color: '#444', fontSize: '12px' }}>
          <Lock style={{ width: '11px', height: '11px', display: 'inline', marginRight: '4px' }} />
          Pass {Math.ceil(PASS_THRESHOLD * total)}/{total} to unlock the next module
        </p>
      </div>
    </div>
  );
}
