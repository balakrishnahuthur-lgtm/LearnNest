import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import DemoToggle from './components/DemoToggle';

// Pages
import Onboarding from './pages/Onboarding';
import Roadmap from './pages/Roadmap';
import Learning from './pages/Learning';
import Quiz from './pages/Quiz';
import Intervention from './pages/Intervention';
import ReEntry from './pages/ReEntry';
import Goodbye from './pages/Goodbye';

// Root Component to handle conditional redirects
const RootRedirect = () => {
  const { profile, sessionData, microTaskData } = useAppContext();

  if (!profile) return <Navigate to="/onboarding" />;
  if (microTaskData) return <Navigate to="/reentry" />;
  if (sessionData && sessionData.partial) return <Navigate to="/reentry" />; // Fallback if old logic remains
  
  return <Navigate to="/roadmap" />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />
  },
  {
    path: '/onboarding',
    element: <Onboarding />
  },
  {
    path: '/roadmap',
    element: <Roadmap />
  },
  {
    path: '/learning/:topicId',
    element: <Learning />
  },
  {
    path: '/quiz/:topicId',
    element: <Quiz />
  },
  {
    path: '/intervention',
    element: <Intervention />
  },
  {
    path: '/reentry',
    element: <ReEntry />
  },
  {
    path: '/goodbye',
    element: <Goodbye />
  }
]);

function AppContent() {
  const { returnReminderVisible, dismissReturnReminder, showReturnReminder } = useAppContext();
  const [swStatus, setSwStatus] = useState('');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleMessage = (event) => {
      if (event.data?.type === 'schedule-return-notification-ack') {
        setSwStatus(`Worker acked schedule: delay=${event.data.delay}s`);
      }
      if (event.data?.type === 'notification-shown') {
        setSwStatus('Notification shown!');
      }
      if (event.data?.type === 'notification-error') {
        setSwStatus(`Notification error: ${event.data.error}`);
      }
      if (event.data?.type === 'return-reminder-clicked') {
        showReturnReminder();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [showReturnReminder]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    if (search.get('returnReminder') === 'true') {
      showReturnReminder();
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [showReturnReminder]);

  const scheduleDesktopAlert = async () => {
    if (typeof Notification === 'undefined' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      alert('Desktop notifications are not supported in this browser.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Please allow notifications to test the desktop alert.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const target = registration.active || navigator.serviceWorker.controller;
      if (!target) {
        alert('Service worker not ready.');
        return;
      }

      target.postMessage({
        type: 'schedule-return-notification',
        delay: 10,
        title: 'is this your Capacity?',
        body: 'Gave up easily.'
      });

      setSwStatus('Desktop alert scheduled. Close the app and wait 10 seconds.');
    } catch (error) {
      setSwStatus(`Service worker registration failed: ${error.message}`);
    }
  };

  return (
    <>
      <RouterProvider router={router} />

      <button
        onClick={scheduleDesktopAlert}
        className="fixed top-4 left-4 z-50 bg-primary text-slate-900 font-bold px-4 py-2 rounded-full shadow-2xl hover:bg-primary/90 transition"
      >
        Trigger Judge Alert
      </button>
      {swStatus && (
        <div className="fixed top-20 left-4 z-50 bg-slate-900 text-slate-100 p-3 rounded-2xl border border-slate-700 shadow-xl max-w-xs">
          {swStatus}
        </div>
      )}

      {returnReminderVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 text-center border border-slate-700/80 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">is this your Capacity?</h2>
            <p className="text-slate-300 mb-6">Gave up easily.</p>
            <button
              onClick={dismissReturnReminder}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-full transition"
            >
              I’m back
            </button>
          </div>
        </div>
      )}

      <DemoToggle />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
