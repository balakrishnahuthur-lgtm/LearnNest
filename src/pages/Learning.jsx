import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { useAppContext } from '../context/AppContext';
import { generateInlineQuestion, generateMicroTask } from '../services/ClaudeAPI';
import { getRoadmapForTopic } from '../data/roadmaps';
import VideoQuizOverlay from '../components/VideoQuizOverlay';
import { ArrowLeft, LogOut, Loader2 } from 'lucide-react';

const QUIZ_INTERVAL_MS   = 90_000;  // 90 seconds of playback
const MAX_INTERRUPTS     = 3;

export default function Learning() {
  const { topicId } = useParams();
  const navigate    = useNavigate();
  const { demoMode, dynamicTopics, saveMicroTask, trackStudyTime } = useAppContext();

  const [saving, setSaving]             = useState(false);
  const [quizVisible, setQuizVisible]   = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [interruptCount, setInterruptCount]   = useState(0);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // Behavioral data collected across all 3 interrupts
  const behavioralData = useRef([]);

  // Playback tracking
  const playerRef       = useRef(null);
  const quizTimerRef    = useRef(null);
  const playStartRef    = useRef(null);
  const playedMsRef     = useRef(0);
  const sessionStart    = useRef(Date.now());

  const topicsToSearch = dynamicTopics || getRoadmapForTopic('Web Dev');
  const topic = topicsToSearch.find(t => t.id === topicId);

  useEffect(() => {
    if (!topic) navigate('/dashboard');
  }, [topic, navigate]);

  useEffect(() => {
    return () => {
      clearTimeout(quizTimerRef.current);
    };
  }, []);

  if (!topic) return null;

  // ── Playback helpers ──────────────────────────────────────────
  const accumulatePlay = () => {
    if (playStartRef.current) {
      playedMsRef.current += Date.now() - playStartRef.current;
      playStartRef.current = null;
    }
  };

  const scheduleNextQuiz = () => {
    clearTimeout(quizTimerRef.current);
    const remaining = Math.max(0, QUIZ_INTERVAL_MS - playedMsRef.current);
    quizTimerRef.current = setTimeout(triggerQuiz, remaining);
  };

  const triggerQuiz = async () => {
    accumulatePlay();
    playerRef.current?.pauseVideo();
    setLoadingQuestion(true);
    const q = await generateInlineQuestion(topic.title, demoMode);
    setCurrentQuestion(q);
    setLoadingQuestion(false);
    setQuizVisible(true);
    playedMsRef.current = 0; // reset for next interval
  };

  // Called when VideoQuizOverlay finishes
  const handleQuizDone = (signals) => {
    const newCount = interruptCount + 1;
    behavioralData.current = [...behavioralData.current, signals];
    setInterruptCount(newCount);
    setQuizVisible(false);

    if (newCount >= MAX_INTERRUPTS) {
      // Navigate to summary with all behavioral data
      const allData = behavioralData.current;
      navigate('/summary', {
        state: {
          topicId,
          topicTitle: topic.title,
          behavioralData: allData,
          demoMode,
          // Force OVERLOADED in demo mode (spec requirement)
          forceDemoState: demoMode ? 'overloaded' : null,
        }
      });
    } else {
      // Resume video and schedule next quiz
      playerRef.current?.playVideo();
    }
  };

  const onStateChange = (event) => {
    if (event.data === 1) {         // playing
      playStartRef.current = Date.now();
      scheduleNextQuiz();
    } else if (event.data === 2) {  // paused
      accumulatePlay();
      clearTimeout(quizTimerRef.current);
    } else if (event.data === 0) {  // ended
      accumulatePlay();
      clearTimeout(quizTimerRef.current);
    }
  };

  // Save & Exit
  const handleSaveAndExit = async () => {
    clearTimeout(quizTimerRef.current);
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

      {/* Loading question overlay */}
      {loadingQuestion && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7c3aed' }} />
            <p style={{ color: '#a0a0a0', fontSize: '14px' }}>Generating quiz question...</p>
          </div>
        </div>
      )}

      {/* Quiz Overlay */}
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
                Interrupt {interruptCount}/{MAX_INTERRUPTS}
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

        {/* Info */}
        <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '12px', background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
            🧠 A fill-in-the-blank question will appear every <strong style={{ color: '#a78bfa' }}>90 seconds</strong> of playback.
            After <strong style={{ color: '#a78bfa' }}>3 questions</strong>, you'll get a personalized session summary.
          </p>
        </div>
      </div>
    </div>
  );
}
