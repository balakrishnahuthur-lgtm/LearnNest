import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    topic: 'Web Dev',
    goal: 'Career',
    game: '',
    nickname: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    navigate('/roadmap');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-surface">
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Welcome to Learn Nest
        </h1>
        <p className="text-slate-400 text-center mb-8">Let's personalize your learning experience.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input 
              type="text" required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Primary Topic</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})}
            >
              <option>Web Dev</option>
              <option>Python</option>
              <option>MERN</option>
              <option>DSA</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Goal</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value})}
            >
              <option>Career</option>
              <option>Interest</option>
              <option>Exam</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Favorite Game</label>
            <input 
              type="text"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.game} onChange={(e) => setFormData({...formData, game: e.target.value})}
              placeholder="e.g. Minecraft, Chess"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nickname</label>
            <input 
              type="text" required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})}
            />
          </div>
          
          <button 
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            Start My Journey
          </button>
        </form>
      </div>
    </div>
  );
}
