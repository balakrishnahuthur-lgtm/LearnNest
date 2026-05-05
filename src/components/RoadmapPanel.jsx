import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getRoadmapForTopic, DIFFICULTY_COLORS } from '../data/roadmaps';
import { Lock, PlayCircle, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function RoadmapPanel() {
  const navigate = useNavigate();
  const { profile, unlockedTopics, completedTopics, dynamicTopics } = useAppContext();

  const topics = dynamicTopics || getRoadmapForTopic(profile?.topic || 'Web Dev');

  return (
    <div className="space-y-4 relative">
      {/* Timeline line */}
      <div className="timeline-line" style={{ left: '23px', zIndex: 0 }} />

      {topics.map((topic, index) => {
        const isCompleted = completedTopics.includes(topic.id);
        const isUnlocked = unlockedTopics.includes(topic.id);
        const diff = topic.difficulty || 'Beginner';
        const diffStyle = DIFFICULTY_COLORS[diff] || DIFFICULTY_COLORS['Beginner'];

        return (
          <div
            key={topic.id}
            className="relative flex items-start gap-4 animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms`, zIndex: 1 }}
          >
            {/* Node */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-500/30 glow-success'
                  : isUnlocked
                  ? 'bg-indigo-500 border-indigo-500/30 glow-primary animate-pulse-ring'
                  : 'bg-slate-800 border-slate-700'
              }`}
              style={{ borderColor: isCompleted ? '#10b981' : isUnlocked ? '#6366f1' : '#334155' }}
            >
              {isCompleted
                ? <CheckCircle2 className="w-5 h-5 text-white" />
                : isUnlocked
                ? <PlayCircle className="w-5 h-5 text-white" />
                : <Lock className="w-4 h-4 text-slate-500" />}
            </div>

            {/* Card */}
            <div
              onClick={() => isUnlocked && navigate(`/learning/${topic.id}`)}
              className={`flex-1 p-4 rounded-2xl border transition-all duration-300 ${
                isCompleted
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : isUnlocked
                  ? 'glass-card cursor-pointer hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isUnlocked ? 'text-indigo-400' : 'text-slate-600'}`}>
                      Module {index + 1}
                    </span>
                    {isCompleted && (
                      <span className="badge text-xs" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                        ✓ Done
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">{topic.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{topic.description}</p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {topic.estimatedTime && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" /> {topic.estimatedTime}
                    </div>
                  )}
                  {diff && (
                    <span className="badge"
                      style={{ background: diffStyle.bg, color: diffStyle.text, border: `1px solid ${diffStyle.border}` }}>
                      {diff}
                    </span>
                  )}
                </div>
              </div>

              {isUnlocked && !isCompleted && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Click to start learning</span>
                  <div className="flex items-center gap-1 text-xs text-indigo-400 font-medium">
                    <Zap className="w-3 h-3" /> +100 XP
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Completion banner */}
      {completedTopics.length === topics.length && topics.length > 0 && (
        <div className="relative z-10 p-5 rounded-2xl text-center"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="font-bold text-emerald-400 text-lg">Roadmap Complete!</h3>
          <p className="text-slate-300 text-sm mt-1">You've mastered all modules. Check your progress tab!</p>
        </div>
      )}
    </div>
  );
}
