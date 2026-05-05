import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { useAppContext } from '../context/AppContext';
import { generateInlineQuestion, generateMicroTask, generateModuleQuiz } from '../services/ClaudeAPI';
import { getRoadmapForTopic, getTopicsSeenByNow } from '../data/roadmaps';
import VideoQuizOverlay from '../components/VideoQuizOverlay';
import EndOfModuleQuiz from '../components/EndOfModuleQuiz';
import { ArrowLeft, LogOut, Loader2, SkipForward } from 'lucide-react';

const MAX_INTERRUPTS = 3;

const randomIntervalMs = (demo) =>
  demo
    ? Math.floor(Math.random() * 15_000) + 10_000
    : Math.floor(Math.random() * 90_000) + 60_000;

const SKIP_THRESHOLD_SEC = 8;
const POLL_MS = 1_500;

export default function Learning() {
  const { topicId } = useParams();
  const navigate    = useNavigate();
  const { profile, demoMode, dynamicTopics, saveMicroTask, trackStudyTime, completeTopic, unlockTopic } = useAppContext();

  const [saving, setSaving]               = useState(false);
  const [quizVisible, setQuizVisible]     = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [interruptCount, setInterruptCount]   = useState(0);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [skipBadge, setSkipBadge]         = useState(false);

  // End-of-module quiz state
  const [endQuizVisible, setEndQuizVisible]   = useState(false);
  const [endQuizLoading, setEndQuizLoading]   = useState(false);
  const [endQuizQuestions, setEndQuizQuestions] = useState([]);

  // Custom YouTube video state
  const [customVideoId, setCustomVideoId] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [analyzingCaptions, setAnalyzingCaptions] = useState(false);

  const behavioralData = useRef([]);
  const playerRef      = useRef(null);
  const quizTimerRef   = useRef(null);
  const seekPollRef    = useRef(null);
  const playStartRef   = useRef(null);
  const playedMsRef    = useRef(0);
  const lastPlayerTime = useRef(0);
  const sessionStart   = useRef(Date.now());
  const isQuizActive   = useRef(false);

  const topicsToSearch = dynamicTopics || getRoadmapForTopic(profile?.topic || 'Web Dev');
  const topic          = topicsToSearch.find(t => t.id === topicId);
  const topicIndex     = topicsToSearch.findIndex(t => t.id === topicId);
  const nextTopic      = topicsToSearch[topicIndex + 1] || null;

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

  // ── Playback helpers ──────────────────────────────────────────
  const accumulatePlay = () => {
    if (playStartRef.current) {
      playedMsRef.current += Date.now() - playStartRef.current;
      playStartRef.current = null;
    }
  };

  const scheduleNextQuiz = () => {
    clearTimeout(quizTimerRef.current);
    quizTimerRef.current = setTimeout(triggerInlineQuiz, randomIntervalMs(demoMode));
  };

  const startSeekDetection = () => {
    clearInterval(seekPollRef.current);
    seekPollRef.current = setInterval(() => {
      if (!playerRef.current || isQuizActive.current) return;
      try {
        const currentSec = playerRef.current.getCurrentTime();
        if (currentSec - lastPlayerTime.current > SKIP_THRESHOLD_SEC) {
          clearInterval(seekPollRef.current);
          clearTimeout(quizTimerRef.current);
          setSkipBadge(true);
          setTimeout(() => setSkipBadge(false), 2500);
          triggerInlineQuiz();
        } else {
          lastPlayerTime.current = currentSec;
        }
      } catch {}
    }, POLL_MS);
  };

  const stopSeekDetection = () => clearInterval(seekPollRef.current);

  // ── Inline (mid-video) quiz ───────────────────────────────────
  const triggerInlineQuiz = async () => {
    if (isQuizActive.current) return;
    isQuizActive.current = true;
    accumulatePlay();
    playerRef.current?.pauseVideo();
    stopSeekDetection();
    setLoadingQuestion(true);

    let currentTimeSec = 0, durationSec = 600;
    try {
      currentTimeSec = playerRef.current?.getCurrentTime?.() || 0;
      durationSec    = playerRef.current?.getDuration?.()    || 600;
    } catch {}

    const seenTopics = getTopicsSeenByNow(topic.keyTopics || [], currentTimeSec, durationSec);
    const q = await generateInlineQuestion(topic.title, seenTopics, currentTimeSec, demoMode);
    setCurrentQuestion(q);
    setLoadingQuestion(false);
    setQuizVisible(true);
    playedMsRef.current = 0;
  };

  const handleInlineQuizDone = (signals) => {
    isQuizActive.current = false;
    const newCount = interruptCount + 1;
    behavioralData.current = [...behavioralData.current, signals];
    setInterruptCount(newCount);
    setQuizVisible(false);

    if (newCount >= MAX_INTERRUPTS) {
      navigate('/summary', {
        state: {
          topicId, topicTitle: topic.title,
          behavioralData: behavioralData.current,
          demoMode, forceDemoState: demoMode ? 'overloaded' : null,
        }
      });
    } else {
      playerRef.current?.playVideo();
    }
  };

  // ── End-of-module quiz (fires when video ends) ────────────────
  const triggerEndOfModuleQuiz = async () => {
    clearTimeout(quizTimerRef.current);
    stopSeekDetection();
    setEndQuizLoading(true);
    setEndQuizVisible(true);

    const count = demoMode ? 5 : Math.floor(Math.random() * 4) + 6; // 5 in demo, 6-9 live
    const questions = await generateModuleQuiz(topic.title, topic.keyTopics || [], count, demoMode);
    setEndQuizQuestions(questions);
    setEndQuizLoading(false);
  };

  const handleEndQuizPass = () => {
    const minutesStudied = Math.round((Date.now() - sessionStart.current) / 60000);
    if (minutesStudied > 0) trackStudyTime?.(topicId, minutesStudied);
    completeTopic?.(topicId);
    if (nextTopic) unlockTopic?.(nextTopic.id);
    navigate('/dashboard', { state: { justCompleted: topic.title, nextUnlocked: nextTopic?.title } });
  };

  const handleEndQuizFail = () => {
    setEndQuizVisible(false);
    playerRef.current?.seekTo(0);
    playerRef.current?.pauseVideo();
  };

  // ── YouTube state change ──────────────────────────────────────
  const onStateChange = (event) => {
    if (event.data === 1) {        // playing
      playStartRef.current = Date.now();
      try { lastPlayerTime.current = playerRef.current.getCurrentTime(); } catch {}
      scheduleNextQuiz();
      startSeekDetection();
    } else if (event.data === 2) { // paused
      accumulatePlay();
      clearTimeout(quizTimerRef.current);
      stopSeekDetection();
    } else if (event.data === 0) { // ended — trigger mandatory end quiz
      accumulatePlay();
      clearTimeout(quizTimerRef.current);
      stopSeekDetection();
      triggerEndOfModuleQuiz();
    } else if (event.data === 3) { // buffering
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

  const handleCustomUrlChange = (e) => {
    const url = e.target.value;
    setCustomUrl(url);
    
    // Extract video ID from YouTube URL (watch?v= or youtu.be/)
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match && match[1]) {
      setCustomVideoId(match[1]);
      setAnalyzingCaptions(true);
      // Simulate AI analyzing the captions of the new video
      setTimeout(() => {
        setAnalyzingCaptions(false);
      }, 2500);
    }
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

      {analyzingCaptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card flex flex-col items-center gap-4 p-8 rounded-2xl border border-indigo-500/30">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
            </div>
            <p className="text-white font-bold text-lg">AI is reading the video captions...</p>
            <p className="text-slate-400 text-sm max-w-xs text-center">We are generating a custom quiz based on what the YouTuber says in this exact video.</p>
          </div>
        </div>
      )}

      {/* Skip badge */}
      {skipBadge && (
        <div className="fixed top-4 left-1/2 z-50 animate-fade-in-up"
          style={{ transform: 'translateX(-50%)', background: '#7c3aed', borderRadius: '999px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(124,58,237,0.5)', whiteSpace: 'nowrap' }}>
          <SkipForward style={{ width: '14px', height: '14px', color: '#fff' }} />
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Caught skipping! 😏 Answer a question first.</span>
        </div>
      )}

      {/* Inline mid-video quiz */}
      <VideoQuizOverlay
        visible={quizVisible}
        question={currentQuestion}
        topicTitle={topic.title}
        demoMode={demoMode}
        onDone={handleInlineQuizDone}
      />

      {/* End-of-module mandatory quiz */}
      <EndOfModuleQuiz
        visible={endQuizVisible}
        questions={endQuizQuestions}
        topicTitle={topic.title}
        loading={endQuizLoading}
        onPass={handleEndQuizPass}
        onFail={handleEndQuizFail}
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
                {interruptCount}/{MAX_INTERRUPTS} check-ins done
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
            videoId={customVideoId || topic.videoId}
            opts={{ height: '100%', width: '100%', playerVars: { autoplay: 0, rel: 0, modestbranding: 1, enablejsapi: 1 } }}
            style={{ width: '100%', height: '100%' }}
            onReady={e => { playerRef.current = e.target; }}
            onStateChange={onStateChange}
          />
        </div>

        <div className="mt-4 p-4 glass-card rounded-2xl border border-indigo-500/20">
          <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">Use Your Own Video (Optional)</label>
          <input 
            type="text" 
            value={customUrl}
            onChange={handleCustomUrlChange}
            placeholder="Paste YouTube link here..." 
            className="input-field mb-2"
          />
          <p className="text-[11px] text-slate-500">The AI will read the captions of your pasted video to generate the quiz.</p>
        </div>

        <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '12px', background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
            🧠 Questions appear at <strong style={{ color: '#a78bfa' }}>random intervals</strong>.
            When the video ends, a <strong style={{ color: '#a78bfa' }}>module quiz</strong> unlocks the next topic.
          </p>
        </div>
      </div>
    </div>
  );
}
