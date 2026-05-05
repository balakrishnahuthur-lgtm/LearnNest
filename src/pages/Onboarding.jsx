import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ChevronRight } from 'lucide-react';

const TOPICS = [
  { value: 'Python',     emoji: '🐍', desc: 'Scripts, automation, data' },
  { value: 'MERN Stack', emoji: '⚡', desc: 'MongoDB, Express, React, Node' },
  { value: 'DSA',        emoji: '🧩', desc: 'Algorithms & problem solving' },
  { value: 'Web Dev',    emoji: '🌐', desc: 'HTML, CSS, JavaScript' },
];

const GOALS = [
  { value: 'Career',           emoji: '💼', desc: 'Land a dev job' },
  { value: 'Personal Interest',emoji: '🚀', desc: 'Build things I love' },
  { value: 'Exam Prep',        emoji: '📚', desc: 'Ace an upcoming exam' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useAppContext();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', bro: false, topic: '', goal: '', game: '' });

  const nickname = form.bro ? 'bro' : form.name.split(' ')[0];

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return true; // bro toggle always valid
    if (step === 2) return form.topic !== '';
    if (step === 3) return form.goal !== '';
    return true; // game is optional
  };

  const handleFinish = () => {
    updateProfile({ ...form, nickname });
    navigate('/dashboard');
  };

  const next = () => step < 4 ? setStep(s => s + 1) : handleFinish();

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div className="page-container" style={{ justifyContent: 'center', paddingTop: '60px', paddingBottom: '40px' }}>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '40px' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              width: i === step ? '24px' : '8px', height: '8px', borderRadius: '999px',
              background: i <= step ? '#7c3aed' : '#2a2a2a', transition: 'all 0.3s',
            }} />
          ))}
        </div>

        <div className="animate-fade-in-up">

          {/* STEP 0 — Name */}
          {step === 0 && (
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f0', marginBottom: '8px' }}>
                Hey there! 👋
              </h1>
              <p style={{ color: '#666', fontSize: '15px', marginBottom: '28px' }}>Let's set up your learning profile.</p>
              <label style={{ display: 'block', fontSize: '13px', color: '#888', fontWeight: 500, marginBottom: '8px' }}>
                Full Name
              </label>
              <input
                autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && canNext() && next()}
                placeholder="e.g. Sheshadri Nayaka"
                className="input-field" style={{ marginBottom: '24px' }}
              />
            </div>
          )}

          {/* STEP 1 — Bro toggle */}
          {step === 1 && (
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f0', marginBottom: '8px' }}>
                Hey {form.name.split(' ')[0]}! 😄
              </h1>
              <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px' }}>
                Quick question:
              </p>
              <div className="card" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '16px' }}>Can I call you "bro"?</div>
                    <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>
                      {form.bro ? '✅ I\'ll call you bro!' : `I'll call you "${form.name.split(' ')[0]}"`}
                    </div>
                  </div>
                  {/* Toggle */}
                  <div
                    className={`toggle-track ${form.bro ? 'on' : ''}`}
                    onClick={() => setForm({ ...form, bro: !form.bro })}
                    style={{ flexShrink: 0 }}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Topic */}
          {step === 2 && (
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f0', marginBottom: '8px' }}>
                What do you want to learn?
              </h1>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Pick your learning track.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {TOPICS.map(t => (
                  <button key={t.value} onClick={() => setForm({ ...form, topic: t.value })}
                    style={{
                      background: form.topic === t.value ? 'rgba(124,58,237,0.15)' : '#1a1a1a',
                      border: `1.5px solid ${form.topic === t.value ? '#7c3aed' : '#2a2a2a'}`,
                      borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}>
                    <span style={{ fontSize: '24px' }}>{t.emoji}</span>
                    <div>
                      <div style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '15px' }}>{t.value}</div>
                      <div style={{ color: '#555', fontSize: '12px' }}>{t.desc}</div>
                    </div>
                    {form.topic === t.value && <span style={{ marginLeft: 'auto', color: '#7c3aed', fontWeight: 700 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Goal */}
          {step === 3 && (
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f0', marginBottom: '8px' }}>
                Why are you learning?
              </h1>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>This helps us tailor your roadmap.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {GOALS.map(g => (
                  <button key={g.value} onClick={() => setForm({ ...form, goal: g.value })}
                    style={{
                      background: form.goal === g.value ? 'rgba(124,58,237,0.15)' : '#1a1a1a',
                      border: `1.5px solid ${form.goal === g.value ? '#7c3aed' : '#2a2a2a'}`,
                      borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}>
                    <span style={{ fontSize: '24px' }}>{g.emoji}</span>
                    <div>
                      <div style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '15px' }}>{g.value}</div>
                      <div style={{ color: '#555', fontSize: '12px' }}>{g.desc}</div>
                    </div>
                    {form.goal === g.value && <span style={{ marginLeft: 'auto', color: '#7c3aed', fontWeight: 700 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Favorite game */}
          {step === 4 && (
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f0', marginBottom: '8px' }}>
                Last one! 🎮
              </h1>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '28px' }}>
                What's your favorite game? We'll use this to bring you back when you've been away.
              </p>
              <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                Favorite Game <span style={{ color: '#444' }}>(optional)</span>
              </label>
              <input
                autoFocus value={form.game}
                onChange={e => setForm({ ...form, game: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleFinish()}
                placeholder="e.g. Freefire, BGMI, Valorant, Chess..."
                className="input-field" style={{ marginBottom: '24px' }}
              />
            </div>
          )}

          {/* Nav button */}
          <button onClick={next} disabled={!canNext()} className="btn-primary">
            {step < 4
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  Continue <ChevronRight style={{ width: '16px', height: '16px' }} />
                </span>
              : '🚀 Start My Journey'}
          </button>

          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary" style={{ marginTop: '10px' }}>
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
