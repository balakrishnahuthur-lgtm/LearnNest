import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { User, BookOpen, Target, Gamepad2, ChevronRight, ChevronLeft, Sparkles, Code2, Database, Globe, Cpu, Layers } from 'lucide-react';

const TOPICS = [
  { value: 'Web Dev',          label: 'Web Development', icon: Globe,   color: '#06b6d4', desc: 'HTML, CSS, JavaScript' },
  { value: 'Python',           label: 'Python',          icon: Code2,   color: '#10b981', desc: 'Scripts, APIs, Automation' },
  { value: 'MERN',             label: 'MERN Stack',      icon: Layers,  color: '#6366f1', desc: 'MongoDB, Express, React, Node' },
  { value: 'DSA',              label: 'Data Structures',  icon: Cpu,    color: '#f59e0b', desc: 'Algorithms & Problem Solving' },
  { value: 'React',            label: 'React',            icon: Code2,  color: '#38bdf8', desc: 'Modern UI Development' },
  { value: 'Machine Learning', label: 'Machine Learning', icon: Database,color: '#a78bfa', desc: 'AI, Neural Networks, Data Science' },
];

const GOALS = [
  { value: 'Career',   label: 'Career Switch',  emoji: '💼', desc: 'Land a new dev job' },
  { value: 'Interest', label: 'Personal Growth', emoji: '🚀', desc: 'Build projects I love' },
  { value: 'Exam',     label: 'Exam Prep',       emoji: '📚', desc: 'Crush an upcoming exam' },
];

const AVATARS = ['🧑‍💻', '👩‍💻', '🦊', '🐼', '🦁', '🐉', '🤖', '👾', '🦄', '🐸'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useAppContext();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', nickname: '', avatar: '🧑‍💻',
    topic: '', goal: '', game: '',
  });
  const [direction, setDirection] = useState('right');

  const go = (next) => {
    setDirection(next > step ? 'right' : 'left');
    setStep(next);
  };

  const handleSubmit = () => {
    updateProfile(form);
    navigate('/dashboard');
  };

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0 && form.nickname.trim().length > 0;
    if (step === 1) return form.topic !== '';
    if (step === 2) return form.goal !== '';
    return true;
  };

  const animClass = direction === 'right' ? 'animate-slide-right' : 'animate-slide-left';

  return (
    <div className="min-h-screen animated-gradient-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      <div className="absolute top-[40%] right-[10%] w-48 h-48 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">LearnNest</span>
          </div>
          <p className="text-slate-400 text-sm">Your AI-powered learning journey starts here</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {['Profile', 'Topic', 'Goal'].map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    i < step ? 'gradient-primary text-white glow-primary' :
                    i === step ? 'border-2 border-indigo-500 text-indigo-400 bg-indigo-500/10' :
                    'border border-slate-700 text-slate-600 bg-slate-800/50'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium ${i === step ? 'text-indigo-400' : 'text-slate-600'}`}>{label}</span>
              </div>
              {i < 2 && (
                <div className="flex-1 h-px mb-4 transition-all duration-500"
                  style={{ background: i < step ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(51,65,85,0.8)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          {/* Shimmer accent */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />

          {/* STEP 0 — Profile */}
          {step === 0 && (
            <div key="step0" className={animClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create your profile</h2>
                  <p className="text-slate-400 text-sm">Tell us a bit about yourself</p>
                </div>
              </div>

              {/* Avatar picker */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Choose your avatar</label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setForm({ ...form, avatar: a })}
                      className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all duration-200 ${
                        form.avatar === a
                          ? 'bg-indigo-500/20 border-2 border-indigo-500 scale-110'
                          : 'bg-slate-800/60 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text" placeholder="e.g. Sheshadri Nayaka" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500
                    focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nickname <span className="text-slate-500">(displayed on dashboard)</span></label>
                <input
                  type="text" placeholder="e.g. Sheddy, Dev_Pro" required
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500
                    focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 1 — Topic */}
          {step === 1 && (
            <div key="step1" className={animClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">What do you want to learn?</h2>
                  <p className="text-slate-400 text-sm">Pick your learning track</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TOPICS.map(({ value, label, icon: Icon, color, desc }) => (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, topic: value })}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                      form.topic === value
                        ? 'border-indigo-500 bg-indigo-500/15 scale-[1.02]'
                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" style={{ color }} />
                    <div className="font-semibold text-white text-sm">{label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>

              {/* Custom topic */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Or enter a custom topic</label>
                <input
                  type="text" placeholder="e.g. DevOps, Rust, Flutter..."
                  value={!TOPICS.find(t => t.value === form.topic) ? form.topic : ''}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500
                    focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Goal */}
          {step === 2 && (
            <div key="step2" className={animClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">What's your goal?</h2>
                  <p className="text-slate-400 text-sm">This helps us tailor your roadmap</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {GOALS.map(({ value, label, emoji, desc }) => (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, goal: value })}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 ${
                      form.goal === value
                        ? 'border-purple-500 bg-purple-500/12'
                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-3xl">{emoji}</span>
                    <div>
                      <div className="font-semibold text-white">{label}</div>
                      <div className="text-sm text-slate-400">{desc}</div>
                    </div>
                    {form.goal === value && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Favorite game (optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Gamepad2 className="inline w-4 h-4 mr-1 text-slate-400" />
                  Favorite Game <span className="text-slate-500 font-normal">(optional — for motivation)</span>
                </label>
                <input
                  type="text" placeholder="e.g. Minecraft, Chess, Among Us"
                  value={form.game}
                  onChange={(e) => setForm({ ...form, game: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500
                    focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => go(step - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-300
                  hover:border-slate-500 hover:text-white transition-all font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={() => step < 2 ? go(step + 1) : handleSubmit()}
              disabled={!canNext()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all duration-200
                ${canNext()
                  ? 'gradient-primary hover:opacity-90 glow-primary active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              {step < 2 ? (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              ) : (
                <><Sparkles className="w-4 h-4" /> Start My Journey</>
              )}
            </button>
          </div>
        </div>

        {/* Already have account */}
        <p className="text-center text-sm text-slate-500 mt-4">
          Returning learner?{' '}
          <button onClick={() => navigate('/dashboard')} className="text-indigo-400 hover:text-indigo-300 font-medium">
            Go to Dashboard
          </button>
        </p>
      </div>
    </div>
  );
}
