import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateMotivation, checkAnswer } from '../services/ClaudeAPI';
import { Loader2 } from 'lucide-react';

const TWO_DAYS_MS = 172_800_000;

export default function ReEntry() {
  const navigate = useNavigate();
  const { profile, microTaskData, clearMicroTask, demoMode } = useAppContext();

  const [phase, setPhase]         = useState('loading'); // loading | motivation | task
  const [motivation, setMotivation] = useState('');
  const [answer, setAnswer]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null);

  useEffect(() => {
    if (!microTaskData) { navigate('/dashboard'); return; }

    const { microTaskTimestamp } = microTaskData;
    const daysAway = Math.floor((Date.now() - microTaskTimestamp) / 86_400_000);
    const isLongAbsence = (Date.now() - microTaskTimestamp) > TWO_DAYS_MS;

    if (isLongAbsence) {
      const game = profile?.game || 'your favorite game';
      generateMotivation(game, daysAway, demoMode).then(text => {
        setMotivation(text);
        setPhase('motivation');
      });
    } else {
      setPhase('task');
    }
  }, []);

  const handleComplete = async () => {
    setSubmitting(true);
    const topic = microTaskData?.microTaskTopic || 'programming';
    const q     = microTaskData?.microTask || '';
    const res   = await checkAnswer(topic, q, answer, demoMode);
    setResult(res);
    setSubmitting(false);
  };

  const handleContinue = () => {
    clearMicroTask();
    navigate('/dashboard');
  };

  const nickname = profile?.nickname || profile?.name || 'there';

  // ── Loading ──────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7c3aed' }} />
      </div>
    );
  }

  // ── Motivation overlay ───────────────────────────────────────
  if (phase === 'motivation') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-6 animate-fade-in"
        style={{ background: '#0a0a0a' }}>
        <div className="text-center" style={{ maxWidth: '400px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎮</div>
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#f0f0f0', lineHeight: '1.6', marginBottom: '36px' }}>
            {motivation}
          </p>
          <button onClick={() => setPhase('task')} className="btn-primary" style={{ fontSize: '16px', padding: '16px 20px' }}>
            I'm Back. Let's Go →
          </button>
        </div>
      </div>
    );
  }

  // ── Micro task ───────────────────────────────────────────────
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div className="page-container" style={{ justifyContent: 'center', paddingTop: '60px', paddingBottom: '40px' }}>
        <div className="animate-slide-up">
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f0', marginBottom: '8px' }}>
            Welcome back, {nickname}.
          </h1>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '32px' }}>
            You were learning <span style={{ color: '#a78bfa' }}>{microTaskData?.microTaskTopic}</span>.
            Finish this one thing.
          </p>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              📝 Your Micro Task
            </div>
            <p style={{ fontSize: '16px', color: '#f0f0f0', lineHeight: '1.6', fontWeight: 500 }}>
              {microTaskData?.microTask}
            </p>
          </div>

          {!result ? (
            <>
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !submitting && answer.trim() && handleComplete()}
                placeholder="Type your answer..."
                className="input-field"
                style={{ marginBottom: '12px' }}
              />
              <button onClick={handleComplete} disabled={!answer.trim() || submitting} className="btn-primary">
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Checking...</span>
                  : 'Complete & Continue →'}
              </button>
            </>
          ) : (
            <div>
              <div style={{
                padding: '16px', borderRadius: '12px', marginBottom: '16px',
                background: result.correct ? 'rgba(16,185,129,0.08)' : 'rgba(124,58,237,0.08)',
                border: `1px solid ${result.correct ? 'rgba(16,185,129,0.25)' : 'rgba(124,58,237,0.25)'}`,
              }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{result.correct ? '✅' : '💜'}</div>
                <p style={{ color: '#e0e0e0', fontSize: '14px', lineHeight: '1.5' }}>
                  {result.correct ? result.feedback : "Great effort! Let's build on this momentum."}
                </p>
              </div>
              <button onClick={handleContinue} className="btn-primary">
                {result.correct ? 'Go to Roadmap →' : 'Continue Anyway →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
