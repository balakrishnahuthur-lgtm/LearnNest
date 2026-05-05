import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { useAppContext } from '../context/AppContext';
import { generateInlineQuestion, generateMicroTask } from '../services/ClaudeAPI';
import { getRoadmapForTopic } from '../data/roadmaps';
import VideoQuizOverlay from '../components/VideoQuizOverlay';
import { ArrowLeft, LogOut, Loader2, SkipForward } from 'lucide-react';

const MAX_INTERRUPTS = 3;

// Random interval: 60–150s normal, 10–25s demo
const randomIntervalMs = (demo) =>
  demo
    ? Math.floor(Math.random() * 15_000) + 10_000   // 10–25 seconds
    : Math.floor(Math.random() * 90_000) + 60_000;  // 60–150 seconds

// If user seeks forward more than this many seconds, trigger quiz
const SKIP_THRESHOLD_SEC = 8;
// Poll interval for seek detection
const POLL_MS = 1_500;

export default function Learning() {
  const { topicId } = useParams();
  const navigate    = useNavigate();
  const { demoMode, dynamicTopics, saveMicroTask, trackStudyTime } = useAppContext();

  const [saving, setSaving]           = useState(false);
  const [quizVisible, setQuizVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [interruptCount, setInterruptCount]   = useState(0);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [skipBadge, setSkipBadge]     = useState(false); // flash "caught skipping!" badge

  // Behavioral data across all interrupts
  const behavioralData = useRef([]);

  // Timers & tracking
  const playerRef       = useRef(null);
  const quizTimerRef    = useRef(null);
  const seekPollRef     = useRef(null);
  const playStartRef    = useRef(null);
  const playedMsRef     = useRef(0);
  const lastPlayerTime  = useRef(0);
  const sessionStart    = useRef(Date.now());
  const isQuizActive    = useRef(false); // prevent double-trigger

  const topicsToSearch = dynamicTopics || getRoadmapForTopic('Web Dev');
  const topic = topicsToSearch.find(t => t.id === topicId);

  useEffect(() => {
    if (!topic) navigate('/dashboard');
  }, [topic, navigate]);

  useEffect(() => {
    return () => {
      clearTimeout(quizTimerRef.current);
      clearInterval(seekPollRef.current);
    };
  }, []);

  if (!topic) return null;

  // ── Helpers ───────────────────────────────────────────────────
  const accumulatePlay = () => {
    if (playStartRef.current) {
      playedMsRef.current += Date.now() - playStartRef.current;
      playStartRef.current = null;
    }
  };

  const scheduleNextQuiz = () => {
    clearTimeout(quizTimerRef.current);
    const interval = randomIntervalMs(demoMode);
    quizTimerRef.current = setTimeout(triggerQuiz, interval);
  };

  const startSeekDetection = () => {
    clearInterval(seekPollRef.current);
    seekPollRef.current = setInterval(() => {
      if (!playerRef.current || isQuizActive.current) return;
      try {
        const currentSec = playerRef.current.getCurrentTime();
        const diff = currentSec - lastPlayerTime.current;
        // diff > SKIP_THRESHOLD means user jumped forward
        if (diff > SKIP_THRESHOLD_SEC) {
          clearInterval(seekPollRef.current);
          clearTimeout(quizTimerRef.current);
          setSkipBadge(true);
          setTimeout(() => setSkipBadge(false), 2000);
          triggerQuiz();
        } else {
          lastPlayerTime.current = currentSec;
        }
      } catch {/* player not ready */}
    }, POLL_MS);
  };

  const stopSeekDetection = () => clearInterval(seekPollRef.current);

  const triggerQuiz = async () => {
    if (isQuizActive.current) return;
    isQuizActive.current = true;
    accumulatePlay();
    playerRef.current?.pauseVideo();
    stopSeekDetection();
    setLoadingQuestion(true);
    const q = await generateInlineQuestion(topic.title, demoMode);
    setCurrentQuestion(q);
    setLoadingQuestion(false);
    setQuizVisible(true);
    playedMsRef.current = 0;
  };

  const handleQuizDone = (signals) => {
    isQuizActive.current = false;
    const newCount = interruptCount + 1;
    behavioralData.current = [...behavioralData.current, signals];
    setInterruptCount(newCount);
    setQuizVisible(false);

    if (newCount >= MAX_INTERRUPTS) {
      navigate('/summary', {
        state: {
          topicId,
          topicTitle: topic.title,
          behavioralData: behavioralData.current,
          demoMode,
          forceDemoState: demoMode ? 'overloaded' : null,
        }
      });
    } else {
      playerRef.current?.playVideo();
    }
  };

  const onStateChange = (event) => {
    if (event.data === 1) {        // playing
      playStartRef.current = Date.now();
      // Capture current time as baseline for seek detection
      try { lastPlayerTime.current = playerRef.current.getCurrentTime(); } catch {}
      scheduleNextQuiz();
      startSeekDetection();
    } else if (event.data === 2) { // paused
      accumulatePlay();
      clearTimeout(quizTimerRef.current);
      stopSeekDetection();
    } else if (event.data === 0) { // ended
      accumulatePlay();
      clearTimeout(quizTimerRef.current);
      stopSeekDetection();
    } else if (event.data === 3) { // buffering (often means seeking started)
      // Update lastPlayerTime so we detect the jump on next poll
      try { lastPlayerTime.current = playerRef.current?.getCurrentTime() || 0; } catch {}
    }
  };

  const handleSaveAndExit = async () => {
    clearTimeout(quizTimerRef.current);
    stopSeekDetection();
    accumulatePlay();
    setSaving(true);
    const minutesStudied = Math.round((Date.now() - sessionStart.current) / 60000);
    if (minutesStudied > 0) trackStudyTime?.(topicId, minutesStudied);
    const task = await generateMicroTask(topic.title, demoMode);
    saveMicroTask({ microTask: task, microTaskTopic: topic.title, microTaskTimestamp: Date.now() });
    navigate('/goodbye');
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {saving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#7c3aed' }} />
          <p style={{ color: '#f0f0f0', fontWeight: 600 }}>Saving your session...</p>
        </div>
      )}

      {loadingQuestion && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7c3aed' }} />
            <p style={{ color: '#a0a0a0', fontSize: '14px' }}>Generating question...</p>
          </div>
        </div>
      )}

      {/* Caught skipping badge */}
      {skipBadge && (
        <div className="fixed top-4 left-1/2 z-50 animate-fade-in-up"
          style={{ transform: 'translateX(-50%)', background: '#7c3aed', borderRadius: '999px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(124,58,237,0.5)' }}>
          <SkipForward style={{ width: '14px', height: '14px', color: '#fff' }} />
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Caught skipping! 😏 Answer a question first.</span>
        </div>
      )}

      <VideoQuizOverlay
        visible={quizVisible}
        question={currentQuestion}
        topicTitle={topic.title}
        demoMode={demoMode}
        onDone={handleQuizDone}
      />

      {/* Header */}
      <header style={{ background: '#111', borderBottom: '1px solid #1f1f1f', padding: '12px 16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/dashboard')}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '8px', cursor: 'pointer' }}>
              <ArrowLeft style={{ width: '18px', height: '18px', color: '#f0f0f0' }} />
            </button>
            <div>
              <div style={{ color: '#f0f0f0', fontWeight: 600, fontSize: '15px' }}>{topic.title}</div>
              <div style={{ color: '#7c3aed', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {interruptCount}/{MAX_INTERRUPTS} questions answered
              </div>
            </div>
          </div>
          <button onClick={handleSaveAndExit}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', color: '#a0a0a0', fontSize: '13px', fontWeight: 500 }}>
            <LogOut style={{ width: '14px', height: '14px' }} /> Save & Exit
          </button>
        </div>
      </header>

      {/* Video */}
      <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%', padding: '16px' }}>
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #1f1f1f', aspectRatio: '16/9', background: '#000' }}>
          <YouTube
            videoId={topic.videoId}
            opts={{ height: '100%', width: '100%', playerVars: { autoplay: 0, rel: 0, modestbranding: 1, enablejsapi: 1 } }}
            style={{ width: '100%', height: '100%' }}
            onReady={e => { playerRef.current = e.target; }}
            onStateChange={onStateChange}
          />
        </div>

        {/* Info banner */}
        <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '12px', background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
            🧠 Questions appear at <strong style={{ color: '#a78bfa' }}>random intervals</strong> while you watch.
            Trying to skip? <strong style={{ color: '#a78bfa' }}>Expect a pop quiz.</strong>{' '}
            After <strong style={{ color: '#a78bfa' }}>3 questions</strong>, you'll get your session summary.
          </p>
        </div>
      </div>
    </div>
  );
}
