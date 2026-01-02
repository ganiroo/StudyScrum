
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, StudySession, DailyIntent, TimerState } from '../types';

interface AppContextType {
  tasks: Task[];
  sessions: StudySession[];
  dailyIntent: DailyIntent;
  timerState: TimerState;
  addTask: (task: Omit<Task, 'id' | 'status' | 'formulas' | 'notes' | 'successCriteria' | 'isBlocked'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addSession: (duration: number, type: 'study' | 'break') => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  setDailyIntent: (intent: DailyIntent) => void;
  setTimerState: (state: TimerState) => void;
  efficiencyScore: number;
  streak: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'studyscrum_os_v3_data';

const initialTimerState: TimerState = {
  mode: 'countdown',
  isPaused: true,
  accumulatedSeconds: 0,
  lastStartTime: null,
  studyMinutes: 25,
  breakMinutes: 5,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dailyIntent, setDailyIntentState] = useState<DailyIntent>({
    mainGoal: '',
    yesterdayWin: '',
    blocker: ''
  });
  const [timerState, setTimerState] = useState<TimerState>(initialTimerState);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setTasks(parsed.tasks || []);
      setSessions(parsed.sessions || []);
      setDailyIntentState(parsed.dailyIntent || { mainGoal: '', yesterdayWin: '', blocker: '' });
      setTimerState(parsed.timerState || initialTimerState);
    }
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, sessions, dailyIntent, timerState }));
  }, [tasks, sessions, dailyIntent, timerState]);

  const addTask = useCallback((taskBase: any) => {
    const newTask: Task = {
      ...taskBase,
      id: Math.random().toString(36).substr(2, 9),
      status: TaskStatus.TO_LEARN,
      formulas: '',
      notes: '',
      successCriteria: [],
      isBlocked: false,
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const moveTask = useCallback((id: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status: newStatus,
          completedAt: newStatus === TaskStatus.COMPLETED ? Date.now() : undefined
        };
      }
      return t;
    }));
  }, []);

  const addSession = useCallback((duration: number, type: 'study' | 'break') => {
    const newSession: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: Date.now(),
      duration,
      type,
      date: new Date().toISOString().split('T')[0]
    };
    setSessions(prev => [...prev, newSession]);
  }, []);

  const setDailyIntent = useCallback((intent: DailyIntent) => {
    setDailyIntentState(intent);
  }, []);

  const efficiencyScore = useMemo(() => {
    const focusMins = sessions.reduce((acc, s) => s.type === 'study' ? acc + (s.duration / 60) : acc, 0);
    const criteriaMet = tasks.reduce((acc, t) => acc + t.successCriteria.filter(c => c.done).length, 0);
    const blockers = tasks.filter(t => t.isBlocked).length;
    return Math.max(0, Math.round((focusMins * 1) + (criteriaMet * 10) - (blockers * 2)));
  }, [sessions, tasks]);

  const streak = useMemo(() => {
    const sessionsByDate: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.type === 'study') {
        sessionsByDate[s.date] = (sessionsByDate[s.date] || 0) + (s.duration / 60);
      }
    });

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (sessionsByDate[dateStr] >= 45) {
        currentStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [sessions]);

  return (
    <AppContext.Provider value={{ 
      tasks, sessions, dailyIntent, timerState, addTask, updateTask, deleteTask, addSession, moveTask, setDailyIntent, setTimerState, efficiencyScore, streak 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
