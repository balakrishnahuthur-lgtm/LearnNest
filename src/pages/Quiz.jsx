import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateQuiz, generateMicroTask } from '../services/ClaudeAPI';
import { TOPICS as PYTHON_TOPICS } from '../data/topics';
import { getRoadmapForTopic } from '../data/roadmaps';
import { Loader2, ArrowRight, LogOut, ArrowLeft } from 'lucide-react';

export default function Quiz() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { demoMode, dynamicTopics, saveSession, saveMicroTask, unlockTopic, completeTopic, recordQuizScore } = useAppContext();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Metrics
  const backspaceCount = useRef(0);
  const questionStartTime = useRef(Date.now());
  const metrics = useRef([]);

  const topicsToSearch = dynamicTopics || getRoadmapForTopic('Web Dev');
  const topic = topicsToSearch.find(t => t.id === topicId);

  useEffect(() => {
    if (!topic) {
      navigate('/dashboard');
      return;
    }

    const fetchQuiz = async () => {
      setLoading(true);
      const q = await generateQuiz(topic.title, demoMode);
      setQuestions(q);
      setLoading(false);
      questionStartTime.current = Date.now();
    };

    fetchQuiz();
  }, [topic, demoMode, navigate]);

  // Backspace tracker
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        backspaceCount.current += 1;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveAndExit = async () => {
    setSaving(true);
    const task = await generateMicroTask(topic.title, demoMode);
    
    saveMicroTask({
      microTask: task,
      microTaskTopic: topic.id,
      timestamp: Date.now()
    });
    
    navigate('/goodbye');
  };

  const handleNext = () => {
    const timeTaken = Date.now() - questionStartTime.current;
    const isCorrect = selectedOption === questions[currentIndex].correct;
    
    metrics.current.push({
      timeTaken,
      correct: isCorrect
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      questionStartTime.current = Date.now();
    } else {
      // Calculate score
      const correctCount = metrics.current.filter(m => m.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);

      // Record in analytics
      recordQuizScore(topic.id, score);

      // Mark topic complete + unlock next
      completeTopic(topic.id);
      const currentIdx = topicsToSearch.findIndex(t => t.id === topic.id);
      if (currentIdx >= 0 && currentIdx < topicsToSearch.length - 1) {
        unlockTopic(topicsToSearch[currentIdx + 1].id);
      }

      saveSession({
        topicId: topic.id,
        score,
        metrics: metrics.current,
        totalBackspaces: backspaceCount.current,
        completedAt: new Date().toISOString()
      });
      navigate('/intervention');
    }
  };

  if (!topic) return null;

  if (loading || saving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400">
          {saving ? 'Saving session and preparing task...' : 'AI is generating your custom quiz...'}
        </p>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden pb-24">
      {/* Header */}
      <header className="w-full p-4 flex items-center justify-between bg-background">
        <div className="flex items-center">
          <button onClick={() => navigate(`/learning/${topic.id}`)} className="p-2 rounded-full hover:bg-slate-800 transition mr-2 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-300">Quiz: {topic.title}</span>
        </div>
        
        <button 
          onClick={handleSaveAndExit}
          className="flex items-center text-sm font-bold hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          <LogOut className="w-4 h-4 mr-2" /> Save & Exit
        </button>
      </header>

      <div className="p-6 flex flex-col items-center max-w-2xl mx-auto w-full flex-1">
        
        <div className="w-full flex justify-between items-center mb-8">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex space-x-2">
            {questions.map((_, idx) => (
              <div key={idx} className={`w-10 h-2 rounded-full transition-colors ${idx <= currentIndex ? 'bg-primary' : 'bg-slate-800'}`} />
            ))}
          </div>
        </div>

        <div className="glass-panel w-full rounded-2xl p-8 mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
            {currentQ.question}
          </h2>

          <div className="space-y-4">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedOption === idx 
                    ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${selectedOption === idx ? 'border-primary' : 'border-slate-600'}`}>
                    {selectedOption === idx && <div className="w-3 h-3 rounded-full bg-primary" />}
                  </div>
                  <span className="text-lg">{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={selectedOption === null}
          onClick={handleNext}
          className="w-full mt-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center transition-all"
        >
          {currentIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'} 
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>

      </div>
    </div>
  );
}
