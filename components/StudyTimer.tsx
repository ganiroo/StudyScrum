
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { GlassContainer } from './GlassContainer';
import { TimerState } from '../types';

export const StudyTimer: React.FC = () => {
  const { addSession, timerState, setTimerState } = useApp();
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Sync display time based on timestamp differential for high precision & tab backgrounding
  const updateDisplay = useCallback(() => {
    const { mode, accumulatedSeconds, lastStartTime, isPaused, studyMinutes, breakMinutes } = timerState;
    
    let currentElapsed = accumulatedSeconds;
    if (!isPaused && lastStartTime) {
      currentElapsed += (Date.now() - lastStartTime) / 1000;
    }

    if (mode === 'countdown') {
      const total = studyMinutes * 60;
      const remaining = Math.max(0, total - currentElapsed);
      setDisplaySeconds(Math.floor(remaining));
      if (remaining <= 0 && !isPaused) handleAutoFinish();
    } else if (mode === 'break') {
      const total = breakMinutes * 60;
      const remaining = Math.max(0, total - currentElapsed);
      setDisplaySeconds(Math.floor(remaining));
      if (remaining <= 0 && !isPaused) handleAutoFinish();
    } else {
      // stopwatch - always starts at 0 and counts up
      setDisplaySeconds(Math.floor(currentElapsed));
    }
  }, [timerState]);

  const handleAutoFinish = () => {
    finishSession();
  };

  useEffect(() => {
    if (!timerState.isPaused) {
      timerIntervalRef.current = window.setInterval(updateDisplay, 100); // Higher frequency for smoother UI
    } else {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    }
    updateDisplay();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateDisplay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerState.isPaused, updateDisplay]);

  const togglePause = () => {
    if (timerState.isPaused) {
      // Start/Resume
      setTimerState({
        ...timerState,
        isPaused: false,
        lastStartTime: Date.now(),
      });
    } else {
      // Pause
      const currentElapsed = timerState.accumulatedSeconds + (Date.now() - (timerState.lastStartTime || Date.now())) / 1000;
      setTimerState({
        ...timerState,
        isPaused: true,
        accumulatedSeconds: currentElapsed,
        lastStartTime: null,
      });
    }
  };

  const finishSession = () => {
    const { mode, accumulatedSeconds, lastStartTime, isPaused, studyMinutes, breakMinutes } = timerState;
    const currentElapsed = accumulatedSeconds + (!isPaused && lastStartTime ? (Date.now() - lastStartTime) / 1000 : 0);
    
    if (mode !== 'break') {
      addSession(currentElapsed, 'study');
      // Auto-transition to Break Mode
      setTimerState({
        mode: 'break',
        isPaused: true,
        accumulatedSeconds: 0,
        lastStartTime: null,
        studyMinutes: studyMinutes,
        breakMinutes: breakMinutes,
      });
    } else {
      addSession(currentElapsed, 'break');
      // Transition back to Countdown
      setTimerState({
        mode: 'countdown',
        isPaused: true,
        accumulatedSeconds: 0,
        lastStartTime: null,
        studyMinutes: studyMinutes,
        breakMinutes: breakMinutes,
      });
    }
  };

  const skipBreak = () => {
    setTimerState({
      ...timerState,
      mode: 'countdown',
      isPaused: true,
      accumulatedSeconds: 0,
      lastStartTime: null,
    });
  };

  const switchMode = (newMode: 'countdown' | 'stopwatch' | 'break') => {
    if (!timerState.isPaused) return; 
    
    // Strict Mode Decoupling
    setTimerState({
      ...timerState,
      mode: newMode,
      accumulatedSeconds: 0,
      lastStartTime: null,
      isPaused: true,
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0 || timerState.mode === 'stopwatch') {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const { mode, studyMinutes, breakMinutes } = timerState;
    const currentElapsed = timerState.accumulatedSeconds + (!timerState.isPaused && timerState.lastStartTime ? (Date.now() - timerState.lastStartTime) / 1000 : 0);
    if (mode === 'countdown') return 1 - (currentElapsed / (studyMinutes * 60));
    if (mode === 'break') return 1 - (currentElapsed / (breakMinutes * 60));
    return 1;
  };

  const themeColors = {
    blue: { stroke: 'stroke-blue-500', bg: 'bg-[#63A2FF]', shadow: 'shadow-blue-100', text: 'text-blue-500' },
    emerald: { stroke: 'stroke-emerald-500', bg: 'bg-emerald-500', shadow: 'shadow-emerald-100', text: 'text-emerald-500' },
    indigo: { stroke: 'stroke-indigo-500', bg: 'bg-indigo-500', shadow: 'shadow-indigo-100', text: 'text-indigo-500' }
  };

  const currentTheme = timerState.mode === 'break' ? themeColors.emerald : (timerState.mode === 'stopwatch' ? themeColors.indigo : themeColors.blue);

  // Helper for contextual button text
  const getButtonText = () => {
    if (!timerState.isPaused) return 'Pause';
    
    const isStarted = timerState.accumulatedSeconds > 0;
    if (timerState.mode === 'break') {
      return isStarted ? 'Resume Break' : 'Start Break';
    }
    return isStarted ? 'Resume Session' : 'Start Studying';
  };

  return (
    <GlassContainer className="min-h-[550px] flex flex-col items-center justify-between p-10 transition-all duration-500 relative overflow-hidden">
      {timerState.mode === 'break' && <div className="absolute inset-0 bg-emerald-50/20 pointer-events-none animate-pulse" />}
      
      <div className="text-center w-full z-10">
        <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${timerState.mode === 'break' ? 'text-emerald-400' : 'text-slate-400'}`}>
          {timerState.mode === 'break' ? 'Recovery State' : 'Focus Matrix'}
        </h2>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mx-auto">
          <button 
            disabled={!timerState.isPaused}
            onClick={() => switchMode('countdown')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${timerState.mode === 'countdown' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-500'} disabled:opacity-50`}
          >
            Countdown
          </button>
          <button 
            disabled={!timerState.isPaused}
            onClick={() => switchMode('stopwatch')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${timerState.mode === 'stopwatch' ? 'bg-white text-indigo-500 shadow-sm' : 'text-slate-400 hover:text-slate-500'} disabled:opacity-50`}
          >
            Stopwatch
          </button>
          <button 
            disabled={!timerState.isPaused}
            onClick={() => switchMode('break')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${timerState.mode === 'break' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400 hover:text-slate-500'} disabled:opacity-50`}
          >
            Break
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-8 z-10 w-full">
        <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="42%" className="stroke-slate-100 fill-none" strokeWidth="6" />
            <circle 
              cx="50%" cy="50%" r="42%" 
              className={`fill-none transition-all duration-1000 ${currentTheme.stroke}`}
              strokeWidth="6"
              strokeDasharray="264%"
              strokeDashoffset={`${264 * (1 - Math.min(1, Math.max(0, getProgress())))}%`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {timerState.isPaused && (timerState.mode === 'countdown' || timerState.mode === 'break') && timerState.accumulatedSeconds === 0 ? (
              <div className="flex items-center justify-center">
                <input 
                  type="number"
                  value={timerState.mode === 'break' ? timerState.breakMinutes : timerState.studyMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setTimerState({
                      ...timerState,
                      [timerState.mode === 'break' ? 'breakMinutes' : 'studyMinutes']: val
                    });
                  }}
                  className={`w-24 text-5xl font-black bg-transparent text-center border-none focus:ring-0 p-0 ${currentTheme.text}`}
                />
                <span className="text-sm font-bold text-slate-300 ml-1">m</span>
              </div>
            ) : (
              <span className={`text-5xl md:text-6xl font-black tracking-tighter tabular-nums leading-none ${currentTheme.text}`}>
                {formatTime(displaySeconds)}
              </span>
            )}
            <span className="text-[10px] font-black text-slate-300 uppercase mt-4 tracking-[0.2em]">
              {timerState.isPaused ? 'Paused' : (timerState.mode === 'break' ? 'Resting' : 'Deep Focus')}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4 z-10">
        <button 
          onClick={togglePause} 
          className={`w-full py-4 ${currentTheme.bg} text-white font-black rounded-2xl shadow-xl ${currentTheme.shadow} transition-all hover:brightness-105 uppercase text-xs tracking-widest`}
        >
          {getButtonText()}
        </button>
        
        {timerState.isPaused && (timerState.accumulatedSeconds > 0 || timerState.mode === 'stopwatch' && displaySeconds > 0) && (
          <button onClick={finishSession} className="w-full py-3 bg-white border border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all text-xs tracking-widest uppercase">
            {timerState.mode === 'break' ? 'End Break' : 'Finish Session'}
          </button>
        )}

        {timerState.mode === 'break' && (
          <button onClick={skipBreak} className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-all text-[10px] uppercase tracking-widest">
            Skip Break
          </button>
        )}
      </div>
    </GlassContainer>
  );
};
