import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Map, BarChart2, Trophy, LogOut, Sparkles, Flame, ChevronDown, Settings } from 'lucide-react';
import RoadmapPanel from '../components/RoadmapPanel';
import AnalyticsPanel from '../components/AnalyticsPanel';
import ProgressPanel from '../components/ProgressPanel';

const TABS = [
  { id: 'roadmap',   label: 'Roadmap',   icon: Map },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'progress',  label: 'Progress',  icon: Trophy },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, logout, getStreak, getXP, getLevel } = useAppContext();
  const [activeTab, setActiveTab] = useState('roadmap');
  const [showMenu, setShowMenu] = useState(false);

  const streak = getStreak();
  const xp     = getXP();
  const level  = getLevel();

  if (!profile) {
    navigate('/onboarding');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen" style={{ background: '#050b18' }}>
      {/* ── Top Navbar ─────────────────────────────────────────── */}
      <header className="glass-navbar sticky top-0 z-40 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">LearnNest</span>
          </div>

          {/* Center: streak + XP */}
          <div className="hidden sm:flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}>
                <Flame className="w-3.5 h-3.5" /> {streak} day streak
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
              <span>{level.icon}</span> {level.name} · {xp} XP
            </div>
          </div>

          {/* Avatar + Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-lg">
                {profile.avatar || '🧑‍💻'}
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">{profile.nickname || profile.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 glass-card rounded-2xl py-2 shadow-2xl"
                style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="px-3 py-2 border-b border-slate-700/50">
                  <div className="text-xs font-semibold text-white">{profile.name}</div>
                  <div className="text-xs text-slate-400">{profile.topic}</div>
                </div>
                <button
                  onClick={() => { setShowMenu(false); navigate('/onboarding'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Settings className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-28">
        {/* Welcome line */}
        <div className="mb-6 animate-fade-in-down">
          <h1 className="text-2xl font-bold text-white">
            Hi, {profile.nickname || profile.name}! {profile.avatar || '👋'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Your <span className="text-indigo-400 font-medium">{profile.topic}</span> journey continues. Let's crush it today.
          </p>
        </div>

        {/* Tab Content */}
        <div key={activeTab} className="animate-fade-in-up">
          {activeTab === 'roadmap'   && <RoadmapPanel />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
          {activeTab === 'progress'  && <ProgressPanel />}
        </div>
      </main>

      {/* ── Bottom Tab Bar ───────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-navbar border-t-0"
        style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200 ${
                  active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-indigo-500/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{label}</span>
                {active && <div className="absolute top-0 left-[50%] translate-x-[-50%] w-8 h-0.5 gradient-primary rounded-full" style={{ position: 'absolute', top: 0 }} />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Click outside to close menu */}
      {showMenu && <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />}
    </div>
  );
}
