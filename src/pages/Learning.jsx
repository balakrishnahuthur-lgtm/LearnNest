import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { TOPICS as PYTHON_TOPICS } from '../data/topics';
import { useAppContext } from '../context/AppContext';
import { generateMicroTask } from '../services/ClaudeAPI';
import { ArrowLeft, Play, LogOut, Loader2 } from 'lucide-react';

export default function Learning() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { demoMode, dynamicTopics, saveMicroTask } = useAppContext();
  
  const [saving, setSaving] = useState(false);
  const [showPausePopup, setShowPausePopup] = useState(false);
  
  const playerRef = useRef(null);
  const pauseTimerRef = useRef(null);

  const topicsToSearch = demoMode ? PYTHON_TOPICS : (dynamicTopics || PYTHON_TOPICS);
  const topic = topicsToSearch.find(t => t.id === topicId);

  useEffect(() => {
    if (!topic) {
      navigate('/roadmap');
    }
  }, [topic, navigate]);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  const handleSaveAndExit = async () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setSaving(true);
    
    const task = await generateMicroTask(topic.title, demoMode);
    
    saveMicroTask({
      microTask: task,
      microTaskTopic: topic.id,
      timestamp: Date.now()
    });
    
    navigate('/goodbye');
  };

  const onStateChange = (event) => {
    // 1 = playing, 2 = paused
    if (event.data === 2) {
      // Start 2 minute timer (120000ms). For testing, you could make it 5000ms.
      pauseTimerRef.current = setTimeout(() => {
        setShowPausePopup(true);
      }, 120000); 
    } else if (event.data === 1) {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
      setShowPausePopup(false);
    }
  };

  const handleStillHere = () => {
    setShowPausePopup(false);
    if (playerRef.current) {
      playerRef.current.playVideo();
    }
  };

  if (!topic) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden pb-24">
      {saving && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-white font-bold text-lg">Saving session and preparing task...</p>
        </div>
      )}

      {showPausePopup && !saving && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel p-6 rounded-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2 text-white">Still watching?</h3>
            <p className="text-slate-300 mb-6">You've been paused for a while. Save your spot?</p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleStillHere}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition"
              >
                I'm Still Here
              </button>
              <button 
                onClick={handleSaveAndExit}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full z-10 p-4 flex items-center justify-between bg-slate-900 border-b border-slate-800">
        <div className="flex items-center">
          <button onClick={() => navigate('/roadmap')} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition mr-4">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="font-bold text-white leading-tight">{topic.title}</h2>
            <span className="text-xs text-primary uppercase font-bold tracking-wider">Learning Module</span>
          </div>
        </div>
        
        <button 
          onClick={handleSaveAndExit}
          className="flex items-center text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition"
        >
          <LogOut className="w-4 h-4 mr-2" /> Save & Exit
        </button>
      </header>

      {/* Video Container */}
      <div className="flex-1 w-full flex flex-col max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-800 aspect-video w-full bg-black">
          <YouTube
            videoId={topic.videoId}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 0,
                rel: 0,
                modestbranding: 1
              },
            }}
            className="w-full h-full"
            onReady={(e) => playerRef.current = e.target}
            onStateChange={onStateChange}
          />
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-bold mb-2">Ready to test your knowledge?</h3>
          <p className="text-slate-400 mb-6">Take a quick quiz to ensure you've grasped the core concepts of {topic.title}.</p>
          
          <button 
            onClick={() => navigate(`/quiz/${topic.id}`)}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-4 rounded-lg flex items-center justify-center transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            <Play className="w-5 h-5 mr-2 fill-current" /> Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
