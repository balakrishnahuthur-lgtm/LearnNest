import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Clock, Flame, Target, TrendingUp, Star, BarChart2, Award } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color = '#6366f1', delay = 0 }) {
  return (
    <div className="stat-card animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <div className="text-sm font-semibold text-slate-300">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function WeeklyChart({ data }) {
  const maxMin = Math.max(...data.map(d => d.minutes), 1);
  return (
    <div>
      <div className="flex items-end gap-2 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative rounded-t-md overflow-hidden"
              style={{ height: '56px', background: 'rgba(30,40,70,0.6)' }}>
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-700"
                style={{
                  height: `${(d.minutes / maxMin) * 100}%`,
                  background: d.active
                    ? 'linear-gradient(180deg, #6366f1, #8b5cf6)'
                    : 'rgba(99,102,241,0.2)',
                  animationDelay: `${i * 100}ms`,
                }}
              />
            </div>
            <span className="text-xs text-slate-500">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPanel() {
  const {
    analytics, profile,
    getStreak, getAvgQuizScore, getWeeklyActivity,
    getTotalTopics, getCompletedCount, getCompletionPct,
  } = useAppContext();

  const streak = getStreak();
  const avgScore = getAvgQuizScore();
  const weeklyData = getWeeklyActivity();
  const completedCount = getCompletedCount();
  const totalTopics = getTotalTopics();
  const pct = getCompletionPct();

  const studyHours = Math.floor(analytics.totalStudyMinutes / 60);
  const studyMins  = analytics.totalStudyMinutes % 60;
  const studyDisplay = studyHours > 0 ? `${studyHours}h ${studyMins}m` : `${studyMins}m`;

  // Best/worst topic from quiz scores
  const { best, worst } = useMemo(() => {
    const entries = Object.entries(analytics.quizScores);
    if (!entries.length) return { best: null, worst: null };
    const avgs = entries.map(([id, scores]) => ({
      id,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
    avgs.sort((a, b) => b.avg - a.avg);
    return { best: avgs[0], worst: avgs[avgs.length - 1] };
  }, [analytics.quizScores]);

  const quizCount = Object.values(analytics.quizScores).flat().length;

  return (
    <div className="space-y-6">
      {/* Overall Progress Ring */}
      <div className="glass-card rounded-2xl p-5 animate-fade-in-up">
        <div className="flex items-center gap-5">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" className="rotate-[-90deg]">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(30,40,70,0.8)" strokeWidth="8" />
              <circle cx="40" cy="40" r="34" fill="none"
                stroke="url(#progressGrad)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white rotate-0" style={{ transform: 'rotate(90deg)' }}>
              {pct}%
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Overall Progress</h3>
            <p className="text-slate-400 text-sm mt-1">
              {completedCount} of {totalTopics} modules complete
            </p>
            <div className="mt-2 progress-bar" style={{ width: '160px' }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame}    label="Day Streak"     value={`${streak}🔥`}  sub={streak > 0 ? 'Keep it up!' : 'Start today'} color="#f59e0b" delay={0} />
        <StatCard icon={Clock}    label="Study Time"     value={studyDisplay}   sub="Total logged"      color="#06b6d4" delay={80} />
        <StatCard icon={Target}   label="Avg Quiz Score" value={`${avgScore}%`} sub={`${quizCount} quiz${quizCount !== 1 ? 'zes' : ''} taken`} color="#8b5cf6" delay={160} />
        <StatCard icon={TrendingUp} label="Topics Done" value={completedCount}  sub={`of ${totalTopics} total`}  color="#10b981" delay={240} />
      </div>

      {/* Weekly Activity Chart */}
      <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" /> Weekly Activity
          </h3>
          <span className="text-xs text-slate-400">Last 7 days</span>
        </div>
        <WeeklyChart data={weeklyData} />
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(#6366f1, #8b5cf6)' }} />
            Active day
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-indigo-500/20" />
            Inactive
          </div>
        </div>
      </div>

      {/* Best / Worst Topic */}
      {(best || worst) && (
        <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-yellow-400" /> Quiz Performance
          </h3>
          <div className="space-y-3">
            {best && (
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-2 text-sm">
                  <span>🏆</span>
                  <span className="text-slate-300">Best: <span className="text-white font-medium">{best.id.replace('topic-', 'Module ')}</span></span>
                </div>
                <span className="font-bold text-emerald-400">{best.avg}%</span>
              </div>
            )}
            {worst && worst.id !== best?.id && (
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 text-sm">
                  <span>📖</span>
                  <span className="text-slate-300">Review: <span className="text-white font-medium">{worst.id.replace('topic-', 'Module ')}</span></span>
                </div>
                <span className="font-bold text-red-400">{worst.avg}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Insight Card */}
      <div className="rounded-2xl p-5 animate-fade-in-up" style={{
        animationDelay: '200ms',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.2)',
      }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
            <Award className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-indigo-300 text-sm mb-1">AI Insight</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {pct === 0
                ? `Welcome, ${profile?.nickname || profile?.name}! Start your first module to unlock personalized insights. Every journey begins with a single step. 🚀`
                : pct < 30
                ? `Great start, ${profile?.nickname || profile?.name}! You're building momentum. Consistency matters more than speed — even 20 minutes daily compounds into mastery.`
                : pct < 60
                ? `You're making excellent progress on ${profile?.topic}! ${streak > 1 ? `Your ${streak}-day streak shows real commitment.` : 'Try to build a daily habit — streaks are powerful motivators!'}`
                : pct < 100
                ? `Impressive dedication! You're in the top tier of learners. ${avgScore >= 80 ? 'Your quiz scores show deep understanding.' : 'Focus a little more on quizzes to solidify your understanding.'}`
                : `🏆 Outstanding! You've completed the entire ${profile?.topic} roadmap. Consider building a real project to cement your skills!`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
