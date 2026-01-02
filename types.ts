
export enum TaskStatus {
  TO_LEARN = 'To-Learn',
  ACTIVE = 'Active',
  COMPLETED = 'Completed'
}

export interface Task {
  id: string;
  title: string;
  urgency: number; // 1-5
  status: TaskStatus;
  formulas: string;
  notes: string;
  successCriteria: { id: string; text: string; done: boolean }[];
  isBlocked: boolean;
  blockerReason?: string;
  color: string;
  completedAt?: number; // Unix timestamp
}

export interface StudySession {
  id: string;
  startTime: number;
  duration: number; // in seconds
  type: 'study' | 'break';
  date: string; // YYYY-MM-DD
}

export interface DailyIntent {
  mainGoal: string;
  yesterdayWin: string;
  blocker: string;
}

export interface TimerState {
  mode: 'countdown' | 'stopwatch' | 'break';
  isPaused: boolean;
  accumulatedSeconds: number;
  lastStartTime: number | null;
  studyMinutes: number;
  breakMinutes: number;
}

export interface AppState {
  tasks: Task[];
  sessions: StudySession[];
  dailyIntent: DailyIntent;
  timerState: TimerState;
}
