import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ChevronRight, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#030305] flex flex-col relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center px-6 py-12 relative z-10">

        {/* Step dots */}
        <div className="flex gap-2 justify-center mb-12">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 
              i < step ? 'w-3 bg-indigo-500/50' : 'w-2 bg-slate-800'
            }`} />
          ))}
        </div>

        <div className="animate-fade-in-up w-full">

          {/* STEP 0 — Name */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Hey there! 👋</h1>
                <p className="text-slate-400 text-lg">Let's set up your LearnNest profile.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Full Name</label>
                <input
                  autoFocus 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && canNext() && next()}
                  placeholder="e.g. Sheshadri Nayaka"
                  className="w-full bg-[#0a0a0f]/80 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all text-lg backdrop-blur-xl"
                />
              </div>
            </div>
          )}

          {/* STEP 1 — Bro toggle */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Hey {form.name.split(' ')[0]}!</h1>
                <p className="text-slate-400 text-lg">Quick preference before we continue.</p>
              </div>
              
              <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-lg">Can I call you "bro"?</div>
                    <div className="text-indigo-300 text-sm mt-1">
                      {form.bro ? '✅ I\'ll call you bro!' : `I'll call you "${form.name.split(' ')[0]}"`}
                    </div>
                  </div>
                  {/* Toggle */}
                  <button
                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${form.bro ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    onClick={() => setForm({ ...form, bro: !form.bro })}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${form.bro ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Topic */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Your Track</h1>
                <p className="text-slate-400 text-lg">What do you want to master?</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TOPICS.map(t => (
                  <button 
                    key={t.value} 
                    onClick={() => setForm({ ...form, topic: t.value })}
                    className={`relative overflow-hidden text-left p-5 rounded-3xl border transition-all duration-300 ${
                      form.topic === t.value 
                      ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                      : 'bg-[#0a0a0f]/60 border-white/5 hover:bg-[#11111a] hover:border-white/20'
                    } backdrop-blur-xl group`}
                  >
                    <div className="text-3xl mb-3">{t.emoji}</div>
                    <div className="text-white font-bold text-lg mb-1">{t.value}</div>
                    <div className="text-slate-500 text-xs font-medium">{t.desc}</div>
                    
                    {form.topic === t.value && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.8)]">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Goal */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Your Goal</h1>
                <p className="text-slate-400 text-lg">Why are you learning?</p>
              </div>
              
              <div className="flex flex-col gap-4">
                {GOALS.map(g => (
                  <button 
                    key={g.value} 
                    onClick={() => setForm({ ...form, goal: g.value })}
                    className={`relative overflow-hidden text-left p-5 rounded-3xl border transition-all duration-300 flex items-center gap-4 ${
                      form.goal === g.value 
                      ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                      : 'bg-[#0a0a0f]/60 border-white/5 hover:bg-[#11111a] hover:border-white/20'
                    } backdrop-blur-xl group`}
                  >
                    <div className="text-4xl">{g.emoji}</div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-lg">{g.value}</div>
                      <div className="text-slate-500 text-sm font-medium">{g.desc}</div>
                    </div>
                    
                    {form.goal === g.value && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.8)]">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Favorite game */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Last one! 🎮</h1>
                <p className="text-slate-400 text-lg">What's your favorite game? We'll use this to bring you back when you slack off.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Favorite Game (Optional)</label>
                <input
                  autoFocus 
                  value={form.game}
                  onChange={e => setForm({ ...form, game: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleFinish()}
                  placeholder="e.g. Freefire, BGMI, Valorant..."
                  className="w-full bg-[#0a0a0f]/80 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all text-lg backdrop-blur-xl"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 space-y-4">
            <button 
              onClick={next} 
              disabled={!canNext()} 
              className="w-full gradient-primary text-white font-black text-lg py-4 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {step < 4 ? 'Continue' : 'Start My Journey'}
              {step < 4 && <ChevronRight className="w-5 h-5" />}
            </button>

            {step > 0 && (
              <button 
                onClick={() => setStep(s => s - 1)} 
                className="w-full py-4 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
