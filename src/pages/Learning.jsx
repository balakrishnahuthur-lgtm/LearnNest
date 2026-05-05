import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { TOPICS as PYTHON_TOPICS } from '../data/topics';
import { useAppContext } from '../context/AppContext';
import { generateMicroTask } from '../services/ClaudeAPI';
import { getRoadmapForTopic } from '../data/roadmaps';
import { getQuestions } from '../data/quizBank';
import VideoQuizOverlay from '../components/VideoQuizOverlay';
import { ArrowLeft, LogOut, Loader2, Brain } from 'lucide-react';

// Quiz fires after this many ms of actual playback
const QUIZ_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const DEMO_QUIZ_INTERVAL_MS = 30 * 1000;  // 30 seconds in demo mode

export default function Learning() {
  const { topicId } = useParams();
  const navigate    = useNavigate();
  const { demoMode, dynamicTopics, saveMicroTask, trackStudyTime } = useAppContext();

  const [saving, setSaving]           = useState(false);
  const [showPausePopup, setShowPausePopup] = useState(false);
  const [quizVisible, setQuizVisible] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [difficulty, setDifficulty]   = useState('beginner');
  const [quizRound, setQuizRound]     = useState(0);

  const playerRef        = useRef(null);
  const pauseTimerRef    = useRef(null);
  const quizTimerRef     = useRef(null);
  const playedMsRef      = useRef(0);       // accumulated play time
  const playStartRef     = useRef(null);    // when playback started
  const sessionStartRef  = useRef(Date.now());

  const topicsToSearch = dynamicTopics || getRoadmapForTopic('Web Dev');
  const topic = topicsToSearch.find(t => t.id === topicId);

  useEffect(() => {
    if (!topic) navigate('/dashboard');
  }, [topic, navigate]);

  useEffect(() => {
    return () => {
      clearTimeout(pauseTimerRef.current);
      clearTimeout(quizTimerRef.current);
    };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────
  const accumulatePlaytime = () => {
    if (playStartRef.current) {
      playedMsRef.current += Date.now() - playStartRef.current;
      playStartRef.current = null;
    }
  };

  const scheduleQuiz = () => {
    clearTimeout(quizTimerRef.current);
    const interval = demoMode ? DEMO_QUIZ_INTERVAL_MS : QUIZ_INTERVAL_MS;
    const remaining = Math.max(0, interval - playedMsRef.current);
    quizTimerRef.current = setTimeout(() => triggerQuiz(), remaining);
  };

  const triggerQuiz = () => {
    // Pause video
    playerRef.current?.pauseVideo();
    // Pick questions
    const qs = getQuestions(topic?.title || '', difficulty, 5);
    setQuizQuestions(qs);
    setQuizVisible(true);
    playedMsRef.current = 0; // reset for next round
  };

  const handleQuizComplete = ({ nextDifficulty }) => {
    setQuizRound(r => r + 1);
    if (nextDifficulty === 'intermediate' && difficulty === 'beginner') setDifficulty('intermediate');
    if (nextDifficulty === 'advanced' && difficulty === 'intermediate') setDifficulty('advanced');
  };

  const handleQuizResume = () => {
    setQuizVisible(false);
    playerRef.current?.playVideo();
  };

  const handleSaveAndExit = async () => {
    clearTimeout(pauseTimerRef.current);
    clearTimeout(quizTimerRef.current);
    accumulatePlaytime();
    setSaving(true);

    const minutesStudied = Math.round((Date.now() - sessionStartRef.current) / 60000);
    if (minutesStudied > 0) trackStudyTime(topicId, minutesStudied);

    const task = await generateMicroTask(topic?.title || '', demoMode);
    saveMicroTask({ microTask: task, microTaskTopic: topicId, timestamp: Date.now() });
    navigate('/goodbye');
  };

  // ── YouTube State Change ──────────────────────────────────────
  const onStateChange = (event) => {
    if (event.data === 1) {
      // Playing
      playStartRef.current = Date.now();
      setShowPausePopup(false);
      clearTimeout(pauseTimerRef.current);
      scheduleQuiz();
    } else if (event.data === 2) {
      // Paused
      accumulatePlaytime();
      clearTimeout(quizTimerRef.current);
      pauseTimerRef.current = setTimeout(() => setShowPausePopup(true), 120_000);
    } else if (event.data === 0) {
      // Ended
      accumulatePlaytime();
      clearTimeout(quizTimerRef.current);
    }
  };

  const handleStillHere = () => {
    setShowPausePopup(false);
    playerRef.current?.playVideo();
  };

  if (!topic) return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden pb-24" style={{ background: '#050b18' }}>

      {saving && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
          <p className="text-white font-bold text-lg">Saving session...</p>
        </div>
      )}

      {/* ── Quiz Overlay ── */}
      <VideoQuizOverlay
        visible={quizVisible}
        questions={quizQuestions}
        topicTitle={topic.title}
        difficulty={difficulty}
        onComplete={handleQuizComplete}
        onResume={handleQuizResume}
      />

      {/* ── Pause Popup ── */}
      {showPausePopup && !saving && !quizVisible && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2 text-white">Still watching?</h3>
            <p className="text-slate-300 mb-6">You've been paused for a while. Save your spot?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleStillHere}
                className="w-full gradient-primary text-white font-bold py-3 rounded-xl">
                I'm Still Here
              </button>
              <button onClick={handleSaveAndExit}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition">
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="w-full z-10 p-4 flex items-center justify-between glass-navbar">
        <div className="flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition mr-3">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="font-bold text-white leading-tight">{topic.title}</h2>
            <span className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Learning Module</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quiz round indicator */}
          {quizRound > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Brain className="w-3 h-3" /> Round {quizRound}
            </div>
          )}
          <button onClick={handleSaveAndExit}
            className="flex items-center text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition">
            <LogOut className="w-4 h-4 mr-2" /> Exit
          </button>
        </div>
      </header>

      {/* ── Video ── */}
      <div className="flex-1 w-full flex flex-col max-w-4xl mx-auto p-4 space-y-5">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-video w-full bg-black relative">
          <YouTube
            videoId={topic.videoId}
            opts={{ height: '100%', width: '100%', playerVars: { autoplay: 0, rel: 0, modestbranding: 1 } }}
            className="w-full h-full"
            onReady={e => { playerRef.current = e.target; }}
            onStateChange={onStateChange}
          />
        </div>

        {/* Info banner */}
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Brain className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-300">Adaptive Learning Active</p>
            <p className="text-xs text-slate-400 mt-0.5">
              A fill-in-the-blank quiz will appear every {demoMode ? '30 seconds' : '10 minutes'} of playback to reinforce what you're watching.
            </p>
          </div>
          <span className="badge ml-auto" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            {difficulty}
          </span>
        </div>

        {/* Quiz CTA */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/80">
          <h3 className="text-lg font-bold mb-1 text-white">Ready to test your knowledge?</h3>
          <p className="text-slate-400 text-sm mb-4">Take the full module quiz to unlock the next topic and earn XP.</p>
          <button onClick={() => navigate(`/quiz/${topic.id}`)}
            className="w-full gradient-primary hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all glow-primary">
            Start Module Quiz → +150 XP
          </button>
        </div>
      </div>
    </div>
  );
}
