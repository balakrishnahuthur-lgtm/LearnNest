import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { TOPICS as PYTHON_TOPICS } from '../data/topics';
import { generateRoadmap } from '../services/ClaudeAPI';
import { Lock, PlayCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function Roadmap() {
  const navigate = useNavigate();
  const { profile, unlockedTopics, demoMode, dynamicTopics, setDynamicTopics } = useAppContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) {
      navigate('/onboarding');
      return;
    }

    const fetchTopics = async () => {
      if (!demoMode && !dynamicTopics) {
        setLoading(true);
        const generated = await generateRoadmap(profile.topic, profile.goal, demoMode);
        setDynamicTopics(generated);
        setLoading(false);
      }
    };

    fetchTopics();
  }, [demoMode, dynamicTopics, profile, navigate, setDynamicTopics]);

  if (!profile) return null;

  const hasApiKey = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);
  const isMockMode = demoMode || !hasApiKey;
  const topicsToDisplay = dynamicTopics || PYTHON_TOPICS;

  return (
    <div className="min-h-screen p-6 pb-20 max-w-md mx-auto">
      <header className="mb-8 mt-4 animate-fade-in-down">
        <h1 className="text-2xl font-bold text-slate-100">Hi, {profile.nickname || profile.name}! 👋</h1>
        <p className="text-slate-400">Ready to conquer {profile.topic}?</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-400">AI is crafting your personalized roadmap...</p>
        </div>
      ) : (
        <>
          {isMockMode && (
            <div className="mb-4 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 text-sm text-slate-300">
              {demoMode
                ? 'Demo mode is active. Showing sample roadmap content.'
                : 'AI key not configured. Showing topic-based fallback roadmap.'}
            </div>
          )}
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-secondary before:to-slate-800">
            {topicsToDisplay.map((topic, index) => {
              const isUnlocked = unlockedTopics.includes(topic.id);
              const isCompleted = unlockedTopics.indexOf(topic.id) < unlockedTopics.length - 1 && unlockedTopics.length > 1;

              return (
                <div key={topic.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl ${isCompleted ? 'bg-accent' : isUnlocked ? 'bg-primary' : 'bg-slate-700'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : isUnlocked ? <PlayCircle className="w-5 h-5 text-white" /> : <Lock className="w-4 h-4 text-slate-400" />}
                  </div>

                  <div 
                    onClick={() => isUnlocked && navigate(`/learning/${topic.id}`)}
                    className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-xl transition-all ${
                      isUnlocked 
                        ? 'glass-panel cursor-pointer hover:-translate-y-1 hover:shadow-primary/20 hover:border-primary/50' 
                        : 'bg-slate-800/50 border border-slate-700/50 opacity-70 grayscale cursor-not-allowed'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isUnlocked ? 'text-primary' : 'text-slate-500'}`}>
                        Module {index + 1}
                      </span>
                      <h3 className="font-bold text-lg mb-1">{topic.title}</h3>
                      <p className="text-sm text-slate-400">{topic.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
