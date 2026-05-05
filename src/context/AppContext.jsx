import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // ─── Core Profile ──────────────────────────────────────────────
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_profile')) || null; } catch { return null; }
  });

  const [demoMode, setDemoMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_demo_mode')) ?? false; } catch { return false; }
  });

  const [dynamicTopics, setDynamicTopics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_dynamic_topics')) || null; } catch { return null; }
  });

  const [unlockedTopics, setUnlockedTopics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_unlocked')) || ['topic-0']; } catch { return ['topic-0']; }
  });

  const [completedTopics, setCompletedTopics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_completed')) || []; } catch { return []; }
  });

  const [sessionData, setSessionData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_session')) || null; } catch { return null; }
  });

  const [microTaskData, setMicroTaskData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_microtask')) || null; } catch { return null; }
  });

  const [returnReminderVisible, setReturnReminderVisible] = useState(false);

  // ─── Analytics ────────────────────────────────────────────────
  const [analytics, setAnalytics] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mb_analytics')) || {
        totalStudyMinutes: 0,
        quizScores: {},      // { topicId: [score1, score2, ...] }
        dailyActivity: {},   // { 'YYYY-MM-DD': true }
        weeklyMinutes: {},   // { 'YYYY-MM-DD': minutes }
        topicsStarted: [],
        lastActive: null,
      };
    } catch {
      return {
        totalStudyMinutes: 0,
        quizScores: {},
        dailyActivity: {},
        weeklyMinutes: {},
        topicsStarted: [],
        lastActive: null,
      };
    }
  });

  // ─── Persist to localStorage ───────────────────────────────────
  useEffect(() => { if (profile) localStorage.setItem('mb_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('mb_demo_mode', JSON.stringify(demoMode)); }, [demoMode]);
  useEffect(() => { if (dynamicTopics) localStorage.setItem('mb_dynamic_topics', JSON.stringify(dynamicTopics)); }, [dynamicTopics]);
  useEffect(() => { localStorage.setItem('mb_unlocked', JSON.stringify(unlockedTopics)); }, [unlockedTopics]);
  useEffect(() => { localStorage.setItem('mb_completed', JSON.stringify(completedTopics)); }, [completedTopics]);
  useEffect(() => {
    sessionData ? localStorage.setItem('mb_session', JSON.stringify(sessionData)) : localStorage.removeItem('mb_session');
  }, [sessionData]);
  useEffect(() => {
    microTaskData ? localStorage.setItem('mb_microtask', JSON.stringify(microTaskData)) : localStorage.removeItem('mb_microtask');
  }, [microTaskData]);
  useEffect(() => { localStorage.setItem('mb_analytics', JSON.stringify(analytics)); }, [analytics]);

  // ─── Notification Setup ────────────────────────────────────────
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ─── Return Reminder ───────────────────────────────────────────
  const showReturnReminder = useCallback(() => setReturnReminderVisible(true), []);

  useEffect(() => {
    const thresholdMs = 30 * 60 * 1000;
    const check = () => {
      const last = Number(localStorage.getItem('mb_last_active'));
      if (profile && last && !isNaN(last) && Date.now() - last > thresholdMs) {
        setReturnReminderVisible(true);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('LearnNest: Time to get back! 🧠', { body: 'Your learning streak is waiting for you.' });
        }
      }
    };
    check();
    const save = () => localStorage.setItem('mb_last_active', Date.now().toString());
    const onVis = () => { document.visibilityState === 'hidden' ? save() : check(); };
    window.addEventListener('beforeunload', save);
    window.addEventListener('visibilitychange', onVis);
    return () => { window.removeEventListener('beforeunload', save); window.removeEventListener('visibilitychange', onVis); };
  }, [profile]);

  const dismissReturnReminder = () => {
    setReturnReminderVisible(false);
    localStorage.setItem('mb_last_active', Date.now().toString());
  };

  // ─── Profile Actions ───────────────────────────────────────────
  const updateProfile = (data) => {
    if (data.topic && profile?.topic !== data.topic) {
      setDynamicTopics(null);
      setUnlockedTopics(['topic-0']);
      setCompletedTopics([]);
    }
    setProfile((prev) => ({ ...(prev || {}), ...data }));
  };

  // ─── Topic Progress ────────────────────────────────────────────
  const unlockTopic = (topicId) => {
    setUnlockedTopics((prev) => prev.includes(topicId) ? prev : [...prev, topicId]);
  };

  const completeTopic = (topicId) => {
    setCompletedTopics((prev) => prev.includes(topicId) ? prev : [...prev, topicId]);
    // Record daily activity
    recordDailyActivity();
  };

  // ─── Analytics Actions ─────────────────────────────────────────
  const recordDailyActivity = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setAnalytics((prev) => ({
      ...prev,
      dailyActivity: { ...prev.dailyActivity, [today]: true },
      lastActive: today,
    }));
  }, []);

  const trackStudyTime = useCallback((topicId, minutes) => {
    const today = new Date().toISOString().split('T')[0];
    setAnalytics((prev) => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + minutes,
      weeklyMinutes: {
        ...prev.weeklyMinutes,
        [today]: (prev.weeklyMinutes[today] || 0) + minutes,
      },
      topicsStarted: prev.topicsStarted.includes(topicId)
        ? prev.topicsStarted
        : [...prev.topicsStarted, topicId],
    }));
    recordDailyActivity();
  }, [recordDailyActivity]);

  const recordQuizScore = useCallback((topicId, score) => {
    setAnalytics((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [topicId]: [...(prev.quizScores[topicId] || []), score],
      },
    }));
    recordDailyActivity();
  }, [recordDailyActivity]);

  // ─── Computed Analytics ────────────────────────────────────────
  const getStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (analytics.dailyActivity[key]) streak++;
      else break;
    }
    return streak;
  };

  const getAvgQuizScore = () => {
    const all = Object.values(analytics.quizScores).flat();
    if (!all.length) return 0;
    return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  };

  const getWeeklyActivity = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ date: key, day: d.toLocaleDateString('en', { weekday: 'short' }), minutes: analytics.weeklyMinutes[key] || 0, active: !!analytics.dailyActivity[key] });
    }
    return days;
  };

  const getTotalTopics = () => dynamicTopics?.length || 8;
  const getCompletedCount = () => completedTopics.length;
  const getCompletionPct = () => Math.round((getCompletedCount() / getTotalTopics()) * 100);

  // XP calculation
  const getXP = () => (completedTopics.length * 100) + (Object.values(analytics.quizScores).flat().filter(s => s >= 70).length * 50);
  const getLevel = () => {
    const xp = getXP();
    if (xp >= 1200) return { name: 'Master', icon: '👑', next: null, min: 1200 };
    if (xp >= 800)  return { name: 'Pro', icon: '🔥', next: 1200, min: 800 };
    if (xp >= 400)  return { name: 'Explorer', icon: '🚀', next: 800, min: 400 };
    if (xp >= 150)  return { name: 'Learner', icon: '📚', next: 400, min: 150 };
    return { name: 'Beginner', icon: '🌱', next: 150, min: 0 };
  };

  // ─── Session & MicroTask ───────────────────────────────────────
  const saveSession = (data) => setSessionData(data);
  const clearSession = () => setSessionData(null);
  const saveMicroTask = (data) => setMicroTaskData(data);
  const clearMicroTask = () => setMicroTaskData(null);

  const resetProgress = () => {
    setUnlockedTopics(['topic-0']);
    setCompletedTopics([]);
    setDynamicTopics(null);
    clearSession();
    clearMicroTask();
  };

  const logout = () => {
    resetProgress();
    setProfile(null);
    setAnalytics({ totalStudyMinutes: 0, quizScores: {}, dailyActivity: {}, weeklyMinutes: {}, topicsStarted: [], lastActive: null });
    localStorage.clear();
  };

  return (
    <AppContext.Provider value={{
      profile, updateProfile,
      demoMode, setDemoMode,
      dynamicTopics, setDynamicTopics,
      unlockedTopics, unlockTopic,
      completedTopics, completeTopic,
      sessionData, saveSession, clearSession,
      microTaskData, saveMicroTask, clearMicroTask,
      returnReminderVisible, dismissReturnReminder, showReturnReminder,
      analytics, trackStudyTime, recordQuizScore, recordDailyActivity,
      getStreak, getAvgQuizScore, getWeeklyActivity,
      getTotalTopics, getCompletedCount, getCompletionPct,
      getXP, getLevel,
      resetProgress, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
};
