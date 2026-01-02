
import React from 'react';
import { useApp } from '../context/AppContext';
import { GlassContainer } from './GlassContainer';

export const DailyIntentHeader: React.FC = () => {
  const { dailyIntent, setDailyIntent } = useApp();

  const handleChange = (field: keyof typeof dailyIntent, value: string) => {
    setDailyIntent({ ...dailyIntent, [field]: value });
  };

  return (
    <GlassContainer className="p-4 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-l-4 border-l-[#63A2FF]">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Main Goal</label>
        <input 
          value={dailyIntent.mainGoal}
          onChange={(e) => handleChange('mainGoal', e.target.value)}
          placeholder="What must be done?"
          className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-0"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yesterday's Win</label>
        <input 
          value={dailyIntent.yesterdayWin}
          onChange={(e) => handleChange('yesterdayWin', e.target.value)}
          placeholder="Celebrate a small victory"
          className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-0"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Current Roadblock</label>
        <input 
          value={dailyIntent.blocker}
          onChange={(e) => handleChange('blocker', e.target.value)}
          placeholder="What's stopping you?"
          className="w-full bg-transparent border-none p-0 text-sm font-bold text-rose-700 placeholder:text-rose-300 focus:ring-0"
        />
      </div>
    </GlassContainer>
  );
};
