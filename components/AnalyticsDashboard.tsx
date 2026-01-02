
import React from 'react';
import { useApp } from '../context/AppContext';
import { GlassContainer } from './GlassContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { sessions, efficiencyScore, streak } = useApp();

  const getLastSevenDays = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const chartData = getLastSevenDays().map(date => {
    const daySessions = sessions.filter(s => s.date === date);
    const studyMins = daySessions
      .filter(s => s.type === 'study')
      .reduce((acc, curr) => acc + curr.duration / 60, 0);
    
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: Math.round(studyMins),
    };
  });

  const totalStudyMinsToday = sessions
    .filter(s => s.date === new Date().toISOString().split('T')[0] && s.type === 'study')
    .reduce((acc, curr) => acc + curr.duration / 60, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Focus Analytics</h2>
          <p className="text-slate-500 text-sm font-medium">Archived session throughput.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Score</p>
             <p className="text-3xl font-black text-indigo-500">{efficiencyScore}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Streak</p>
             <p className="text-3xl font-black text-[#63A2FF]">{streak}<span className="text-xs ml-1">Days</span></p>
          </div>
        </div>
      </div>

      <GlassContainer className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dx={-10} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
            />
            <Bar dataKey="minutes" radius={[12, 12, 0, 0]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.minutes >= 45 ? '#63A2FF' : '#CBD5E1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassContainer>

      <div className="grid grid-cols-2 gap-4">
        <GlassContainer className="p-5 flex items-center gap-4 bg-white border border-slate-50">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Time Today</p>
            <p className="text-xl font-black text-slate-800">{Math.round(totalStudyMinsToday)}m</p>
          </div>
        </GlassContainer>
        <GlassContainer className="p-5 flex items-center gap-4 bg-white border border-slate-50">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Status</p>
            <p className="text-xl font-black text-slate-800">{totalStudyMinsToday >= 45 ? 'Complete' : 'Pending'}</p>
          </div>
        </GlassContainer>
      </div>
    </div>
  );
};
