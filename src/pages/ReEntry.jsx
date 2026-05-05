import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { TOPICS } from '../data/topics';
import { Play } from 'lucide-react';

export default function ReEntry() {
  const navigate = useNavigate();
  const { sessionData, profile } = useAppContext();

  // If no partial session, go to roadmap
  if (!sessionData || !sessionData.partial) {
    navigate('/roadmap');
    return null;
  }

  const topic = TOPICS.find(t => t.id === sessionData.topicId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-surface">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.nickname || 'Learner'}!</h1>
        <p className="text-slate-400 mb-8">You were right in the middle of something great.</p>

        <div className="bg-slate-800 rounded-xl p-6 mb-8 text-left border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">Resume Topic</span>
          <h3 className="font-bold text-xl mb-2 text-white">{topic?.title}</h3>
          
          <div className="flex items-center text-sm text-slate-400 mt-4">
            <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
            You've completed {sessionData.metrics?.length || 0} quick checks so far.
          </div>
        </div>

        <button 
          onClick={() => navigate(`/learning/${topic?.id}`)}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-4 rounded-lg flex items-center justify-center transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        >
          <Play className="mr-2 w-5 h-5 fill-current" /> Jump Back In
        </button>
        
        <button 
          onClick={() => navigate('/roadmap')}
          className="mt-4 text-sm text-slate-400 hover:text-white transition"
        >
          No thanks, take me to the roadmap
        </button>
      </div>
    </div>
  );
}
