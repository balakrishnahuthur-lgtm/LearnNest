import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import DemoToggle from './components/DemoToggle';

// Pages
import Onboarding from './pages/Onboarding';
import Dashboard  from './pages/Dashboard';
import Learning   from './pages/Learning';
import Quiz       from './pages/Quiz';
import Intervention from './pages/Intervention';
import ReEntry    from './pages/ReEntry';
import Goodbye    from './pages/Goodbye';
import Summary    from './pages/Summary';

// Root redirect
const RootRedirect = () => {
  const { profile, microTaskData } = useAppContext();
  if (!profile)      return <Navigate to="/onboarding" />;
  if (microTaskData) return <Navigate to="/reentry" />;
  return <Navigate to="/dashboard" />;
};

const router = createBrowserRouter([
  { path: '/',                element: <RootRedirect /> },
  { path: '/onboarding',     element: <Onboarding /> },
  { path: '/dashboard',      element: <Dashboard /> },
  { path: '/roadmap',        element: <Navigate to="/dashboard" replace /> }, // legacy redirect
  { path: '/learning/:topicId', element: <Learning /> },
  { path: '/quiz/:topicId',  element: <Quiz /> },
  { path: '/summary',        element: <Summary /> },
  { path: '/intervention',   element: <Intervention /> },
  { path: '/reentry',        element: <ReEntry /> },
  { path: '/goodbye',        element: <Goodbye /> },
]);

function AppContent() {
  const { returnReminderVisible, dismissReturnReminder, showReturnReminder } = useAppContext();
  const [swStatus, setSwStatus] = useState('');

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const handleMessage = (event) => {
      if (event.data?.type === 'schedule-return-notification-ack') setSwStatus(`Scheduled`);
      if (event.data?.type === 'notification-shown')  setSwStatus('Notification shown!');
      if (event.data?.type === 'notification-error')  setSwStatus(`Error: ${event.data.error}`);
      if (event.data?.type === 'return-reminder-clicked') showReturnReminder();
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [showReturnReminder]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    if (search.get('returnReminder') === 'true') {
      showReturnReminder();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showReturnReminder]);

  return (
    <>
      <RouterProvider router={router} />

      {/* Return reminder overlay */}
      {returnReminderVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="glass-card max-w-sm w-full rounded-3xl p-6 text-center"
            style={{ border: '1px solid rgba(99,102,241,0.25)' }}>
            <div className="text-5xl mb-3">🧠</div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome back!</h2>
            <p className="text-slate-300 mb-6 text-sm">Your learning journey is waiting. Every minute counts toward mastery.</p>
            <button
              onClick={dismissReturnReminder}
              className="w-full gradient-primary hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all glow-primary"
            >
              Let's Continue 🚀
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
