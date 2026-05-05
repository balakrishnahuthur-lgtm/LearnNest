import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings2, LogOut } from 'lucide-react';

export default function DemoToggle() {
  const { demoMode, setDemoMode, resetProgress, logout } = useAppContext();

  const handleToggle = () => {
    setDemoMode(!demoMode);
    resetProgress(); // Reset progress when switching modes to avoid state conflicts
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <button
        onClick={logout}
        className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-full p-2 px-4 flex items-center shadow-2xl hover:bg-slate-700 transition"
      >
        <LogOut className="w-4 h-4 mr-2 text-red-400" />
        <span className="text-sm font-bold text-red-400">Logout / Reset</span>
      </button>

      <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-full p-2 pr-4 flex items-center shadow-2xl">
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            demoMode ? 'bg-primary' : 'bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              demoMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="ml-3 text-sm font-bold flex items-center">
          <Settings2 className="w-4 h-4 mr-1 text-slate-400" />
          <span className={demoMode ? 'text-primary' : 'text-slate-400'}>Demo Mode</span>
        </span>
      </div>
    </div>
  );
}
