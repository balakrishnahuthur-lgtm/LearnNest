import React, { useState, useEffect, useRef } from 'react';
import { checkAnswer, generateAnalogy } from '../services/ClaudeAPI';
import { Loader2 } from 'lucide-react';

/**
 * Spec-exact inline quiz overlay.
 * Tracks: timeToFirstKeypress, backspaceCount, totalTimeTaken
 * On submit → Claude checks answer
 * If correct  → green feedback + auto-resume after 2s
 * If wrong    → Claude analogy + "Got it" / "Explain Differently"
 * onDone({ timeToFirstKeypress, backspaceCount, totalTimeTaken, correct, reExplanations })
 */
export default function VideoQuizOverlay({ visible, question, topicTitle, demoMode, onDone }) {
  const [input, setInput]             = useState('');
  const [phase, setPhase]             = useState('question'); // question | checking | correct | wrong | analogy
  const [feedback, setFeedback]       = useState('');
  const [analogy, setAnalogy]         = useState('');
  const [loadingAnalogy, setLoadingAnalogy] = useState(false);
  const [resumeCountdown, setResumeCountdown] = useState(2);

  // Behavioral signals
  const timeStartRef      = useRef(null);
  const firstKeyPressRef  = useRef(null);
  const backspaceRef      = useRef(0);
  const reExplanationRef  = useRef(0);

  const inputRef = useRef(null);
  const countdownRef = useRef(null);

  // Reset when overlay opens
  useEffect(() => {
    if (visible) {
      setInput('');
      setPhase('question');
      setFeedback('');
      setAnalogy('');
      backspaceRef.current = 0;
      firstKeyPressRef.current = null;
      reExplanationRef.current = 0;
      timeStartRef.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
    return () => clearInterval(countdownRef.current);
  }, [visible]);

  // Countdown when correct
  useEffect(() => {
    if (phase === 'correct') {
      setResumeCountdown(2);
      let n = 2;
      countdownRef.current = setInterval(() => {
        n -= 1;
        setResumeCountdown(n);
        if (n <= 0) {
          clearInterval(countdownRef.current);
          fireDone(true);
        }
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, [phase]);

  if (!visible || !question) return null;

  const fireDone = (correct) => {
    onDone({
      timeToFirstKeypress: firstKeyPressRef.current != null
        ? firstKeyPressRef.current - timeStartRef.current
        : 9999,
      backspaceCount: backspaceRef.current,
      totalTimeTaken: Date.now() - timeStartRef.current,
      correct,
      reExplanations: reExplanationRef.current,
    });
  };

  const handleKeyDown = (e) => {
    if (firstKeyPressRef.current === null) firstKeyPressRef.current = Date.now();
    if (e.key === 'Backspace') backspaceRef.current += 1;
    if (e.key === 'Enter' && phase === 'question') handleSubmit();
  };

  const handleSubmit = async () => {
    if (!input.trim() || phase !== 'question') return;
    setPhase('checking');
    try {
      const result = await checkAnswer(topicTitle, question, input.trim(), demoMode);
      if (result.correct) {
        setFeedback(result.feedback);
        setPhase('correct');
      } else {
        setFeedback(result.feedback);
        setPhase('wrong');
      }
    } catch {
      setPhase('wrong');
      setFeedback("Let me show you a helpful way to think about this.");
    }
  };

  const handleGetAnalogy = async () => {
    setLoadingAnalogy(true);
    reExplanationRef.current += 1;
    const text = await generateAnalogy(topicTitle, demoMode);
    setAnalogy(text);
    setLoadingAnalogy(false);
    setPhase('analogy');
  };

  const handleExplainDifferently = async () => {
    setLoadingAnalogy(true);
    reExplanationRef.current += 1;
    const text = await generateAnalogy(topicTitle, demoMode);
    setAnalogy(text);
    setLoadingAnalogy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)' }}>

      <div className="w-full max-w-[480px] animate-slide-up overflow-hidden"
        style={{ background: '#111', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px 20px 0 0', padding: '24px' }}>

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#7c3aed' }}>
            <span className="text-white text-sm">🧠</span>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a78bfa' }}>Knowledge Check</div>
            <div className="text-xs" style={{ color: '#666' }}>{topicTitle}</div>
          </div>
        </div>

        {/* ── QUESTION phase ── */}
        {(phase === 'question' || phase === 'checking') && (
          <>
            <p className="text-base font-medium mb-5 leading-relaxed" style={{ color: '#f0f0f0' }}>
              {question.split('_____').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block px-3 py-0.5 mx-1 rounded-lg font-mono text-sm"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px dashed rgba(124,58,237,0.5)', color: '#a78bfa', minWidth: '70px' }}>
                      _____
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>

            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              disabled={phase === 'checking'}
              className="input-field mb-4"
              style={{ fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}
            />

            <button onClick={handleSubmit} disabled={!input.trim() || phase === 'checking'} className="btn-primary">
              {phase === 'checking'
                ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Checking...</span>
                : 'Submit Answer'}
            </button>
          </>
        )}

        {/* ── CORRECT phase ── */}
        {phase === 'correct' && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#10b981' }}>Correct!</h3>
            <p className="text-sm mb-4" style={{ color: '#a0a0a0' }}>{feedback}</p>
            <div className="text-sm font-medium animate-pulse-slow" style={{ color: '#666' }}>
              Resuming in {resumeCountdown}s...
            </div>
          </div>
        )}

        {/* ── WRONG phase ── */}
        {phase === 'wrong' && (
          <div>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🤔</div>
              <p className="text-sm" style={{ color: '#a0a0a0' }}>{feedback}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleGetAnalogy} disabled={loadingAnalogy} className="btn-primary">
                {loadingAnalogy
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Getting analogy...</span>
                  : 'Show me a real-world analogy'}
              </button>
              <button onClick={() => fireDone(false)} className="btn-secondary">Got it — Resume Video</button>
            </div>
          </div>
        )}

        {/* ── ANALOGY phase ── */}
        {phase === 'analogy' && (
          <div>
            <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: '#a78bfa' }}>💡 Real-World Analogy</div>
              <p className="text-sm leading-relaxed" style={{ color: '#e0e0e0' }}>
                {loadingAnalogy ? 'Getting a different explanation...' : analogy}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => fireDone(false)} className="btn-primary">Got it — Resume Video</button>
              <button onClick={handleExplainDifferently} disabled={loadingAnalogy} className="btn-outline">
                {loadingAnalogy ? 'Loading...' : 'Explain Differently'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
