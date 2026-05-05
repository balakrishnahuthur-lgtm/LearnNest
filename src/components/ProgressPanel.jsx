import React from 'react';
import { useAppContext } from '../context/AppContext';
import { getRoadmapForTopic } from '../data/roadmaps';
import { CheckCircle2, Lock, Circle, Zap, Star, Trophy, Flame, BookOpen, Award } from 'lucide-react';

const BADGES = [
  { id: 'first_module',   icon: '🌱', label: 'First Step',    desc: 'Complete your first module',     condition: (c, _q, s) => c >= 1 },
  { id: 'quiz_ace',       icon: '🎯', label: 'Quiz Ace',      desc: 'Score 100% on a quiz',            condition: (_c, q) => Object.values(q).flat().some(s => s === 100) },
  { id: 'halfway',        icon: '🚀', label: 'Halfway There', desc: 'Complete 50% of your roadmap',    condition: (c, _q, _s, total) => c >= Math.ceil(total / 2) },
  { id: 'streak_3',       icon: '🔥', label: 'On Fire',       desc: '3-day learning streak',           condition: (_c, _q, streak) => streak >= 3 },
  { id: 'all_done',       icon: '🏆', label: 'Roadmap Master', desc: 'Complete all modules',          condition: (c, _q, _s, total) => c >= total },
  { id: 'quiz_5',         icon: '📚', label: 'Quiz Veteran',  desc: 'Take 5 quizzes',                  condition: (_c, q) => Object.values(q).flat().length >= 5 },
  { id: 'streak_7',       icon: '⚡', label: 'Week Warrior',  desc: '7-day streak',                   condition: (_c, _q, streak) => streak >= 7 },
  { id: 'high_scorer',    icon: '🌟', label: 'High Scorer',   desc: 'Average quiz score above 80%',   condition: (_c, q) => {
    const all = Object.values(q).flat();
    return all.length > 0 && Math.round(all.reduce((a, b) => a + b, 0) / all.length) >= 80;
  }},
];

const LEVELS = [
  { name: 'Beginner',  icon: '🌱', min: 0,    max: 150,  color: '#10b981' },
  { name: 'Learner',   icon: '📚', min: 150,  max: 400,  color: '#06b6d4' },
  { name: 'Explorer',  icon: '🚀', min: 400,  max: 800,  color: '#6366f1' },
  { name: 'Pro',       icon: '🔥', min: 800,  max: 1200, color: '#8b5cf6' },
  { name: 'Master',    icon: '👑', min: 1200, max: 9999, color: '#f59e0b' },
];

export default function ProgressPanel() {
  const {
    profile, completedTopics, unlockedTopics, dynamicTopics,
    analytics, getStreak, getXP, getLevel, getAvgQuizScore,
    getTotalTopics, getCompletedCount, getCompletionPct,
  } = useAppContext();

  const topics = dynamicTopics || getRoadmapForTopic(profile?.topic || 'Web Dev');
  const xp = getXP();
  const level = getLevel();
  const streak = getStreak();
  const pct = getCompletionPct();
  const avgScore = getAvgQuizScore();
  const quizCount = Object.values(analytics.quizScores).flat().length;

  // XP bar within current level
  const currentLevel = LEVELS.find(l => l.name === level.name) || LEVELS[0];
  const nextLevel    = LEVELS.find(l => l.min === currentLevel.max);
  const levelXP      = xp - currentLevel.min;
  const levelRange   = currentLevel.max - currentLevel.min;
  const levelPct     = nextLevel ? Math.min(100, Math.round((levelXP / levelRange) * 100)) : 100;

  // Earned badges
  const earnedBadges = BADGES.filter(b =>
    b.condition(getCompletedCount(), analytics.quizScores, streak, getTotalTopics())
  );

  return (
    <div className="space-y-6">
      {/* XP & Level Card */}
      <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: `${currentLevel.color}18`, border: `2px solid ${currentLevel.color}40` }}>
            {currentLevel.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold text-white">{level.name}</h3>
              <span className="text-sm font-bold" style={{ color: currentLevel.color }}>{xp} XP</span>
            </div>
            <p className="text-slate-400 text-xs mb-2">
              {nextLevel ? `${level.next - xp} XP to ${nextLevel.name} ${nextLevel.icon}` : '🎉 Max level reached!'}
            </p>
            {/* XP Bar */}
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${levelPct}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel?.color || '#f59e0b'})` }} />
            </div>
          </div>
        </div>

        {/* Level Path */}
        <div className="flex items-center gap-1 mt-4">
          {LEVELS.map((l, i) => {
            const isReached = xp >= l.min;
            const isCurrent = l.name === currentLevel.name;
            return (
              <React.Fragment key={l.name}>
                <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                      isCurrent ? 'scale-110' : ''
                    }`}
                    style={{
                      background: isReached ? `${l.color}20` : 'rgba(30,40,70,0.8)',
                      border: isCurrent ? `2px solid ${l.color}` : `1px solid ${isReached ? l.color + '40' : 'rgba(51,65,85,0.8)'}`,
                    }}
                  >
                    {isReached ? l.icon : <span className="text-slate-600 text-xs">{i + 1}</span>}
                  </div>
                  <span className="text-xs text-slate-500 hidden sm:block">{l.name}</span>
                </div>
                {i < LEVELS.length - 1 && (
                  <div className="h-px flex-1 mb-5" style={{
                    background: xp >= LEVELS[i + 1].min ? `linear-gradient(90deg, ${l.color}, ${LEVELS[i+1].color})` : 'rgba(51,65,85,0.5)'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="text-xl font-bold text-emerald-400">{pct}%</div>
          <div className="text-xs text-slate-400 mt-0.5">Complete</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="text-xl font-bold text-amber-400">{streak}🔥</div>
          <div className="text-xs text-slate-400 mt-0.5">Day Streak</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="text-xl font-bold text-purple-400">{avgScore}%</div>
          <div className="text-xs text-slate-400 mt-0.5">Avg Score</div>
        </div>
      </div>

      {/* Module Checklist */}
      <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-indigo-400" /> Module Progress
        </h3>
        <div className="space-y-2">
          {topics.map((topic, i) => {
            const done = completedTopics.includes(topic.id);
            const unlocked = unlockedTopics.includes(topic.id);
            return (
              <div key={topic.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                style={{ background: done ? 'rgba(16,185,129,0.06)' : 'rgba(15,24,48,0.4)' }}>
                <div className="flex-shrink-0">
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    : unlocked
                    ? <Circle className="w-5 h-5 text-indigo-400" />
                    : <Lock className="w-4 h-4 text-slate-600" />}
                </div>
                <span className={`text-sm flex-1 ${done ? 'text-slate-300 line-through' : unlocked ? 'text-white' : 'text-slate-600'}`}>
                  {topic.title}
                </span>
                {done && <span className="text-xs text-emerald-500 font-medium">+100 XP</span>}
                {!done && unlocked && <span className="badge text-xs" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>In Progress</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-yellow-400" /> Achievements
          <span className="badge ml-auto" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
            {earnedBadges.length}/{BADGES.length}
          </span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadges.some(b => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  background: earned ? 'rgba(99,102,241,0.1)' : 'rgba(15,24,48,0.4)',
                  border: earned ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(51,65,85,0.5)',
                  opacity: earned ? 1 : 0.45,
                }}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div className="min-w-0">
                  <div className={`text-xs font-bold ${earned ? 'text-white' : 'text-slate-500'}`}>{badge.label}</div>
                  <div className="text-xs text-slate-500 truncate">{badge.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
