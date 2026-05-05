import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { TOPICS as PYTHON_TOPICS } from '../data/topics';
import { generateIntervention } from '../services/ClaudeAPI';
import { Brain, Zap, Coffee, ArrowRight, Loader2 } from 'lucide-react';

export default function Intervention() {
  const navigate = useNavigate();
  const { sessionData, profile, demoMode, dynamicTopics, unlockTopic } = useAppContext();
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate Cognitive State based on precise requirements
  const cognitiveState = useMemo(() => {
    if (!sessionData || !sessionData.metrics || sessionData.metrics.length === 0) return 'flow';
    
    const m = sessionData.metrics;
    const avgResponseTime = m.reduce((acc, curr) => acc + curr.timeTaken, 0) / m.length;
    const allCorrect = m.every(curr => curr.correct);
    const backspaceCount = sessionData.totalBackspaces || 0;
    
    if (avgResponseTime > 30000 || backspaceCount > 3) {
      return 'overloaded';
    } else if (avgResponseTime < 8000 && allCorrect) {
      return 'bored';
    } else {
      return 'flow';
    }
  }, [sessionData]);

  const topicsToSearch = demoMode ? PYTHON_TOPICS : (dynamicTopics || PYTHON_TOPICS);
  const topic = sessionData ? topicsToSearch.find(t => t.id === sessionData.topicId) : null;

  useEffect(() => {
    if (!topic) {
      navigate('/dashboard');
      return;
    }

    const fetchIntervention = async () => {
      setLoading(true);
      const generatedContent = await generateIntervention(cognitiveState, topic.title, demoMode);
      setContent(generatedContent);
      setLoading(false);
      
      // Unlock next topic
      const topicIndex = topicsToSearch.findIndex(t => t.id === topic.id);
      if (topicIndex < topicsToSearch.length - 1) {
        unlockTopic(topicsToSearch[topicIndex + 1].id);
      }
    };

    fetchIntervention();
  }, [cognitiveState, topic, demoMode, navigate, unlockTopic, topicsToSearch]);

  if (!topic) return null;

  const renderStateHeader = () => {
    switch (cognitiveState) {
      case 'overloaded':
        return {
          icon: <Coffee className="w-12 h-12 text-yellow-500 mb-4" />,
          title: "Let's Reframe",
          color: "text-yellow-500",
          bg: "bg-yellow-500/10"
        };
      case 'bored':
        return {
          icon: <Zap className="w-12 h-12 text-primary mb-4" />,
          title: "Level Up",
          color: "text-primary",
          bg: "bg-primary/10"
        };
      case 'flow':
      default:
        return {
          icon: <Brain className="w-12 h-12 text-accent mb-4" />,
          title: "In the Zone",
          color: "text-accent",
          bg: "bg-accent/10"
        };
    }
  };

  const header = renderStateHeader();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-surface">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center animate-fade-in-up">
        
        <div className={`flex flex-col items-center p-6 rounded-xl ${header.bg} mb-8`}>
          {header.icon}
          <h1 className={`text-2xl font-bold mb-2 ${header.color}`}>{header.title}</h1>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8 min-h-[100px] flex items-center justify-center">
            {cognitiveState === 'flow' ? (
              <p className="text-lg text-slate-300 italic">"Perfect rhythm! Your response times and accuracy show you're in a deep state of flow. Keep this momentum going!"</p>
            ) : (
              <p className="text-lg text-slate-300 leading-relaxed text-left">{content}</p>
            )}
          </div>
        )}

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
