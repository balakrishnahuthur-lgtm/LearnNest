import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Brain, Zap, Coffee, ArrowRight } from 'lucide-react';

export default function Summary() {
  const navigate = useNavigate();
  const { sessionData, profile } = useAppContext();

  // Calculate Cognitive State
  const cognitiveState = useMemo(() => {
    if (!sessionData || !sessionData.metrics || sessionData.metrics.length === 0) return 'unknown';
    
    const m = sessionData.metrics;
    
    // Averages
    const avgTime = m.reduce((acc, curr) => acc + curr.timeTaken, 0) / m.length;
    const avgBackspaces = m.reduce((acc, curr) => acc + curr.backspaces, 0) / m.length;
    const correctCount = m.filter(curr => curr.correct).length;
    
    // Logic for prototype
    if (avgTime > 15000 && avgBackspaces > 10 && correctCount < 2) {
      return 'overloaded';
    } else if (avgTime < 5000 && correctCount === 3) {
      return 'bored'; // Too easy
    } else {
      return 'flow';
    }
  }, [sessionData]);

  if (!sessionData) {
    navigate('/dashboard');
    return null;
  }

  const renderStateContent = () => {
    switch (cognitiveState) {
      case 'overloaded':
        return {
          icon: <Coffee className="w-12 h-12 text-yellow-500 mb-4" />,
          title: "Take a Breather",
          message: "You've absorbed a lot of new concepts. We noticed some hesitation during the checks. Take a 5-minute break before jumping into the next topic to let the knowledge settle.",
          color: "text-yellow-500",
          bg: "bg-yellow-500/10"
        };
      case 'bored':
        return {
          icon: <Zap className="w-12 h-12 text-primary mb-4" />,
          title: "Speed Demon",
          message: "You're breezing through this material! We'll adjust the difficulty of future quizzes to keep you engaged and challenged.",
          color: "text-primary",
          bg: "bg-primary/10"
        };
      case 'flow':
      default:
        return {
          icon: <Brain className="w-12 h-12 text-accent mb-4" />,
          title: "In the Zone",
          message: "Perfect rhythm! Your response times and accuracy show you're in a deep state of flow. Keep this momentum going!",
          color: "text-accent",
          bg: "bg-accent/10"
        };
    }
  };

  const content = renderStateContent();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-surface">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center animate-fade-in-up">
        
        <div className={`flex flex-col items-center p-6 rounded-xl ${content.bg} mb-8`}>
          {content.icon}
          <h1 className={`text-2xl font-bold mb-2 ${content.color}`}>{content.title}</h1>
          <p className="text-slate-300 leading-relaxed">{content.message}</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Session Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-white">{sessionData.metrics.length}</div>
              <div className="text-xs text-slate-500">Checks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{sessionData.metrics.filter(m => m.correct).length}</div>
              <div className="text-xs text-slate-500">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">
                {Math.round(sessionData.metrics.reduce((acc, curr) => acc + curr.timeTaken, 0) / 1000)}s
              </div>
              <div className="text-xs text-slate-500">Total Time</div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-4 rounded-lg flex items-center justify-center transition-all shadow-lg"
        >
          Return to Roadmap <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
