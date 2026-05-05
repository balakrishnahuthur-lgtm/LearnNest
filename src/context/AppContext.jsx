import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('mb_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [demoMode, setDemoMode] = useState(() => {
    const saved = localStorage.getItem('mb_demo_mode');
    return saved ? JSON.parse(saved) : true;
  });

  const [dynamicTopics, setDynamicTopics] = useState(() => {
    const saved = localStorage.getItem('mb_dynamic_topics');
    return saved ? JSON.parse(saved) : null;
  });

  const [unlockedTopics, setUnlockedTopics] = useState(() => {
    const saved = localStorage.getItem('mb_unlocked');
    return saved ? JSON.parse(saved) : ['topic-0']; // Default first topic unlocked
  });

  const [sessionData, setSessionData] = useState(() => {
    const saved = localStorage.getItem('mb_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [microTaskData, setMicroTaskData] = useState(() => {
    const saved = localStorage.getItem('mb_microtask');
    return saved ? JSON.parse(saved) : null;
  });

  const [returnReminderVisible, setReturnReminderVisible] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (profile) localStorage.setItem('mb_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('mb_demo_mode', JSON.stringify(demoMode));
  }, [demoMode]);

  useEffect(() => {
    if (dynamicTopics) localStorage.setItem('mb_dynamic_topics', JSON.stringify(dynamicTopics));
  }, [dynamicTopics]);

  useEffect(() => {
    if (unlockedTopics) localStorage.setItem('mb_unlocked', JSON.stringify(unlockedTopics));
  }, [unlockedTopics]);

  useEffect(() => {
    if (sessionData) {
      localStorage.setItem('mb_session', JSON.stringify(sessionData));
    } else {
      localStorage.removeItem('mb_session');
    }
  }, [sessionData]);

  useEffect(() => {
    if (microTaskData) {
      localStorage.setItem('mb_microtask', JSON.stringify(microTaskData));
    } else {
      localStorage.removeItem('mb_microtask');
    }
  }, [microTaskData]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const thresholdMs = 30 * 60 * 1000; // 30 minutes

    const shouldShowReminder = () => {
      const storedLastActive = localStorage.getItem('mb_last_active');
      const lastActive = storedLastActive ? Number(storedLastActive) : null;
      const now = Date.now();

      return profile && lastActive && !Number.isNaN(lastActive) && now - lastActive > thresholdMs;
    };

    const maybeShowReminder = () => {
      if (shouldShowReminder()) {
        setReturnReminderVisible(true);

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('is this your Capacity? Gave up easily');
        }
      }
    };

    maybeShowReminder();

    const saveLastActive = () => localStorage.setItem('mb_last_active', Date.now().toString());
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveLastActive();
      }
      if (document.visibilityState === 'visible') {
        maybeShowReminder();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', saveLastActive);
      window.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', saveLastActive);
        window.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [profile]);

  const dismissReturnReminder = () => {
    setReturnReminderVisible(false);
    localStorage.setItem('mb_last_active', Date.now().toString());
  };

  const showReturnReminder = () => {
    setReturnReminderVisible(true);
  };

  const updateProfile = (data) => {
    if (data.topic && profile?.topic !== data.topic) {
      setDynamicTopics(null);
      setUnlockedTopics(['topic-0']);
    }
    setProfile({ ...profile, ...data });
  };
  
  const unlockTopic = (topicId) => {
    if (!unlockedTopics.includes(topicId)) {
      setUnlockedTopics([...unlockedTopics, topicId]);
    }
  };

  const saveSession = (data) => setSessionData(data);
  const clearSession = () => setSessionData(null);

  const saveMicroTask = (data) => setMicroTaskData(data);
  const clearMicroTask = () => setMicroTaskData(null);

  const resetProgress = () => {
    setUnlockedTopics(['topic-0']);
    setDynamicTopics(null);
    clearSession();
    clearMicroTask();
  };

  const logout = () => {
    resetProgress();
    setProfile(null);
    localStorage.removeItem('mb_profile');
  };

  return (
    <AppContext.Provider value={{
      profile, updateProfile,
      demoMode, setDemoMode,
      dynamicTopics, setDynamicTopics,
      unlockedTopics, unlockTopic,
      sessionData, saveSession, clearSession,
      microTaskData, saveMicroTask, clearMicroTask,
      returnReminderVisible, dismissReturnReminder, showReturnReminder,
      resetProgress, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};
