
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { GlassContainer } from './GlassContainer';

type TimerMode = 'countdown' | 'deepFocus';

export const EfficiencyEngine: React.FC = () => {
  const { addSession } = useApp();
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [inputValue, setInputValue] = useState('25');
  // Use number instead of NodeJS.Timeout for browser compatibility
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      // Use window.setInterval to ensure it returns a number ID
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (mode === 'countdown') {
            if (prev <= 1) {
              handleFinish();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [isRunning, mode]);

  const handleFinish = () => {
    setIsRunning(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    
    // Calculate actual elapsed time
    const elapsed = mode === 'countdown' 
      ? parseInt(inputValue) * 60 - timeLeft 
      : timeLeft;
    
    addSession(elapsed, 'study');
    alert('Session Logged! OS Synchronized.');
  };

  const toggleTimer = () => {
    if (!isRunning && mode === 'countdown') {
      const mins = Math.min(Math.max(parseInt(inputValue) || 1, 1), 180);
      setTimeLeft(mins * 60);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'countdown') {
      setTimeLeft(parseInt(inputValue) * 60);
    } else {
      setTimeLeft(0);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <GlassContainer className="min-h-[450px] flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency Engine</h2>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => { setMode('countdown'); setIsRunning(false); setTimeLeft(25 * 60); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'countdown' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400'}`}
          >
            Countdown
          </button>
          <button 
            onClick={() => { setMode('deepFocus'); setIsRunning(false); setTimeLeft(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'deepFocus' ? 'bg-white text-indigo-500 shadow-sm' : 'text-slate-400'}`}
          >
            Deep Focus
          </button>
        </div>
      </div>

      <div className="relative">
        <svg className="w-64 h-64 -rotate-90">
          <circle 
            cx="128" cy="128" r="120" 
            className="stroke-slate-100 fill-none" 
            strokeWidth="8"
          />
          <circle 
            cx="128" cy="128" r="120" 
            className={`fill-none transition-all duration-1000 ${mode === 'countdown' ? 'stroke-blue-500' : 'stroke-indigo-500'}`}
            strokeWidth="8"
            strokeDasharray={754}
            strokeDashoffset={mode === 'countdown' ? 754 * (1 - timeLeft / (parseInt(inputValue) * 60 || 1)) : 0}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-slate-800 tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase mt-2">
            {isRunning ? 'Optimizing Neurons' : 'Engine Idle'}
          </span>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-6">
        {mode === 'countdown' && !isRunning && (
          <div className="flex items-center justify-center gap-3">
             <span className="text-slate-400 font-bold text-sm">Duration:</span>
             <input 
               type="number"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               className="w-20 bg-slate-100 border-none rounded-xl px-3 py-2 text-center font-bold text-slate-700"
               min="1"
               max="180"
             />
             <span className="text-slate-400 font-bold text-sm">min</span>
          </div>
        )}

        <div className="flex gap-4">
          <button 
            onClick={toggleTimer}
            className={`flex-1 py-4 rounded-2xl font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${isRunning ? 'bg-rose-400 shadow-rose-100' : (mode === 'countdown' ? 'bg-blue-500 shadow-blue-100' : 'bg-indigo-500 shadow-indigo-100')}`}
          >
            {isRunning ? 'ABORT' : 'INITIATE FOCUS'}
          </button>
          
          <button 
            onClick={resetTimer}
            className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </GlassContainer>
  );
};
