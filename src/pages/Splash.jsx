import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Splash() {
  const navigate = useNavigate();
  const { profile, microTaskData } = useAppContext();

  useEffect(() => {
    // Hold on the splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      if (!profile) {
        navigate('/onboarding');
      } else if (microTaskData) {
        navigate('/reentry');
      } else {
        navigate('/dashboard');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, profile, microTaskData]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#030305]">
      
      {/* Deep space ambient glow behind the orb */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in-up">
        
        {/* 3D Glowing Orb Simulation */}
        <div className="relative w-48 h-48 mb-12 animate-float">
          {/* Core Orb */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-900 via-purple-600 to-indigo-400 shadow-[0_0_80px_rgba(124,58,237,0.8)] opacity-90 backdrop-blur-md border border-white/20"></div>
          
          {/* Inner Light Core */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-white/40 to-transparent blur-md"></div>
          
          {/* Geometric Crystalline overlay (simulated with rotated squares) */}
          <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
            <div className="w-32 h-32 border border-white/10 rounded-3xl rotate-45 backdrop-filter blur-[2px]"></div>
            <div className="absolute w-32 h-32 border border-purple-400/20 rounded-3xl rotate-12 backdrop-filter blur-[1px]"></div>
          </div>
          
          {/* Orbital rings */}
          <div className="absolute -inset-8 border-[1px] border-indigo-500/20 rounded-full animate-[spin_8s_linear_infinite]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
          <div className="absolute -inset-12 border-[1px] border-purple-500/10 rounded-full animate-[spin_12s_linear_infinite_reverse]" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}></div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          LearnNest
        </h1>
        
        {/* Subtitle */}
        <div className="glass-panel px-6 py-2 rounded-full border border-indigo-500/20 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
          <p className="text-indigo-300 text-sm font-semibold tracking-[0.2em] uppercase">
            Initializing Flow State...
          </p>
        </div>

      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full opacity-20 animate-float"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: Math.random() * 10 + 5 + 's',
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>
    </div>
  );
}
