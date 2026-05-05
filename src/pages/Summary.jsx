import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateOverloadedResponse, generateBoredChallenge } from '../services/ClaudeAPI';
import { Loader2 } from 'lucide-react';

/**
 * Spec-exact cognitive state detection:
 * OVERLOADED: avgTimeToFirstKeypress > 5000ms OR totalBackspaceCount > 5 OR correctAnswers < 2
 * BORED:      avgTimeToFirstKeypress < 1500ms AND correctAnswers === 3 AND totalBackspaceCount === 0
 * FLOW:       everything else
 */
function detectCognitiveState(data, forceDemoState) {
  if (forceDemoState) return forceDemoState;
  if (!data || data.length === 0) return 'flow';

  const avgTime    = data.reduce((s, d) => s + (d.timeToFirstKeypress || 0), 0) / data.length;
  const backspaces = data.reduce((s, d) => s + (d.backspaceCount || 0), 0);
  const correct    = data.filter(d => d.correct).length;

  if (avgTime > 5000 || backspaces > 5 || correct < 2) return 'overloaded';
  if (avgTime < 1500 && correct === data.length && backspaces === 0) return 'bored';
  return 'flow';
}

const STATE_CONFIG = {
  overloaded: { badge: '🧠 Overloaded', badgeClass: 'badge-overloaded', heading: "Let's slow down.", color: '#ef4444' },
  bored:      { badge: '⚡ Too Easy',   badgeClass: 'badge-bored',      heading: "You've got this. Go deeper.", color: '#f59e0b' },
  flow:       { badge: '🔥 Flow State', badgeClass: 'badge-flow',       heading: "You're in the zone.", color: '#10b981' },
};

export default function Summary() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { unlockTopic, dynamicTopics, completeTopic, recordQuizScore } = useAppContext();

  const { behavioralData = [], topicId, topicTitle = '', demoMode, forceDemoState } = location.state || {};

  const [state, setState]       = useState(null);
  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(true);

  const cfg = state ? STATE_CONFIG[state] : null;

  // Stats
  const correct    = behavioralData.filter(d => d.correct).length;
  const backspaces = behavioralData.reduce((s, d) => s + (d.backspaceCount || 0), 0);
  const reExplains = behavioralData.reduce((s, d) => s + (d.reExplanations || 0), 0);
  const avgMs      = behavioralData.length
    ? Math.round(behavioralData.reduce((s, d) => s + (d.timeToFirstKeypress || 0), 0) / behavioralData.length)
    : 0;

  useEffect(() => {
    if (!location.state) { navigate('/dashboard'); return; }

    const detected = detectCognitiveState(behavioralData, forceDemoState);
    setState(detected);

    // Record quiz score
    const score = Math.round((correct / Math.max(behavioralData.length, 1)) * 100);
    if (topicId) recordQuizScore?.(topicId, score);

    // Fetch AI content
    (async () => {
      setLoading(true);
      try {
        if (detected === 'overloaded') {
          const text = await generateOverloadedResponse(topicTitle, demoMode);
          setContent(text);
        } else if (detected === 'bored') {
          const text = await generateBoredChallenge(topicTitle, demoMode);
          setContent(text);
        }
      } catch { setContent(''); }
      setLoading(false);
    })();
  }, []);

  const handleNextTopic = () => {
    // Unlock next topic
    if (topicId && dynamicTopics) {
      const idx = dynamicTopics.findIndex(t => t.id === topicId);
      if (idx >= 0) {
        completeTopic?.(topicId);
        if (idx < dynamicTopics.length - 1) unlockTopic?.(dynamicTopics[idx + 1].id);
      }
    }
    navigate('/dashboard');
  };

  const handleTryAgain = () => navigate(`/learning/${topicId}`);

  if (!state) return null;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div className="page-container" style={{ justifyContent: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="animate-fade-in-up">

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className={`badge ${cfg.badgeClass}`} style={{ fontSize: '14px', padding: '8px 20px' }}>
              {cfg.badge}
            </span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f0', textAlign: 'center', marginBottom: '8px' }}>
            {cfg.heading}
          </h1>
          <p style={{ color: '#666', textAlign: 'center', fontSize: '14px', marginBottom: '28px' }}>
            {topicTitle}
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Correct', value: `${correct}/${behavioralData.length}`, color: '#10b981' },
              { label: 'Backspaces', value: backspaces, color: '#f59e0b' },
              { label: 'Re-explanations', value: reExplains, color: '#a78bfa' },
              { label: 'Avg response', value: `${(avgMs / 1000).toFixed(1)}s`, color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* AI Content box */}
          {(state === 'overloaded' || state === 'bored') && (
            <div style={{ padding: '16px', borderRadius: '12px', marginBottom: '20px', background: `${cfg.color}0f`, border: `1px solid ${cfg.color}30` }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: cfg.color, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {state === 'overloaded' ? '💡 Real-World Analogy' : '🎯 Next Challenge'}
              </div>
              {loading
                ? <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" style={{ color: cfg.color }} /><span style={{ color: '#888', fontSize: '14px' }}>Loading...</span></div>
                : <p style={{ color: '#e0e0e0', fontSize: '14px', lineHeight: '1.65' }}>{content}</p>}
            </div>
          )}

          {/* Flow state message */}
          {state === 'flow' && (
            <div style={{ padding: '16px', borderRadius: '12px', marginBottom: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
              <p style={{ color: '#34d399', fontSize: '15px', fontWeight: 500 }}>
                Perfect rhythm. Your responses were consistent and accurate. Keep this momentum going!
              </p>
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {state === 'overloaded'
              ? <button onClick={handleTryAgain} className="btn-primary">Try Again →</button>
              : <button onClick={handleNextTopic} className="btn-primary">Next Topic →</button>}
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}
