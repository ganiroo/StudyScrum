
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { TaskBoard } from './components/TaskBoard';
import { StudyTimer } from './components/StudyTimer';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DailyIntentHeader } from './components/DailyIntentHeader';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'board' | 'focus'>('board');

  return (
    <AppProvider>
      <div className="min-h-screen pb-20 md:pb-0 bg-[#F8FAFC]">
        {/* Navigation Sidebar (Desktop) */}
        <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-10 bg-white border-r border-slate-100 z-40">
          <div className="w-12 h-12 bg-[#63A2FF] rounded-2xl flex items-center justify-center text-white mb-12 shadow-lg shadow-blue-100 cursor-pointer">
            <span className="font-black text-2xl italic">S</span>
          </div>
          
          <div className="flex flex-col gap-8 flex-1">
            <button 
              onClick={() => setActiveTab('board')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'board' ? 'bg-blue-50 text-blue-500' : 'text-slate-300 hover:text-slate-400'}`}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => setActiveTab('focus')}
              className={`p-3 rounded-2xl transition-all ${activeTab === 'focus' ? 'bg-blue-50 text-blue-500' : 'text-slate-300 hover:text-slate-400'}`}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <div className="mt-auto group cursor-pointer relative">
             <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden grayscale hover:grayscale-0 transition-all">
                <img src="https://picsum.photos/40/40?grayscale" alt="User" />
             </div>
          </div>
        </nav>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 glass rounded-[32px] flex items-center justify-around px-8 z-40 shadow-2xl border border-white/50">
           <button 
              onClick={() => setActiveTab('board')}
              className={`p-3 rounded-2xl ${activeTab === 'board' ? 'text-blue-500 bg-blue-50' : 'text-slate-300'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => setActiveTab('focus')}
              className={`p-3 rounded-2xl ${activeTab === 'focus' ? 'text-blue-500 bg-blue-50' : 'text-slate-300'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
        </nav>

        <main className="md:ml-24 p-6 lg:p-12 max-w-[1600px] mx-auto min-h-screen">
          <DailyIntentHeader />
          
          {activeTab === 'board' ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <TaskBoard />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="lg:col-span-5">
                <StudyTimer />
              </div>
              <div className="lg:col-span-7">
                <AnalyticsDashboard />
              </div>
            </div>
          )}
        </main>
      </div>
    </AppProvider>
  );
};

export default App;
