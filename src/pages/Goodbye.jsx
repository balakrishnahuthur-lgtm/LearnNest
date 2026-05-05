import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function Goodbye() {
  const navigate = useNavigate();

  // Redirect back to roadmap/onboarding after a few seconds or allow manual close
  useEffect(() => {
    const timer = setTimeout(() => {
      // Typically an app might close here, but since it's a web app, we just redirect.
      // Or we can just leave it on this screen.
      window.location.href = '/'; // Hard reload to test cold start
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-surface">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center animate-fade-in-up flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-accent mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-white">Session Saved!</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your progress has been safely stored. We'll have a quick task waiting for you when you return. 
        </p>
        <p className="text-sm text-slate-500">
          You can safely close this tab now.
        </p>
      </div>
    </div>
  );
}
