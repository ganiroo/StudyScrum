
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, Task } from '../types';
import { GlassContainer } from './GlassContainer';
import { KnowledgeVault } from './KnowledgeVault';

const UrgencyBadge: React.FC<{ level: number }> = ({ level }) => {
  const colors = ['bg-slate-100', 'bg-blue-100', 'bg-indigo-100', 'bg-purple-100', 'bg-rose-100'];
  const textColors = ['text-slate-500', 'text-blue-500', 'text-indigo-500', 'text-purple-500', 'text-rose-500'];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[level-1]} ${textColors[level-1]}`}>
      Urgency {level}
    </span>
  );
};

export const TaskBoard: React.FC = () => {
  const { tasks, moveTask, addTask } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrgency, setNewUrgency] = useState(3);

  const columns = [TaskStatus.TO_LEARN, TaskStatus.ACTIVE, TaskStatus.COMPLETED];

  const isToday = (timestamp?: number) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const getSortedTasks = (status: TaskStatus) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    if (status === TaskStatus.COMPLETED) {
      // Only show today's tasks in the main board column for clarity
      return columnTasks.filter(t => isToday(t.completedAt));
    }

    return columnTasks.sort((a, b) => b.urgency - a.urgency);
  };

  const archivedTasks = useMemo(() => {
    return tasks
      .filter(t => t.status === TaskStatus.COMPLETED)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }, [tasks]);

  const groupedHistory = useMemo(() => {
    return archivedTasks.reduce((groups, task) => {
      const date = task.completedAt 
        ? new Date(task.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
        : 'Unknown Date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
      return groups;
    }, {} as Record<string, Task[]>);
  }, [archivedTasks]);

  const handleCreate = () => {
    if (newTitle.trim()) {
      addTask({ title: newTitle, urgency: newUrgency, color: '#63A2FF' });
      setNewTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Task Board</h2>
          <p className="text-slate-500 font-medium">Master your study cycle.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#63A2FF] text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(status => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {status} {status === TaskStatus.COMPLETED ? '(Today)' : ''}
                </h3>
                {status === TaskStatus.COMPLETED && (
                  <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                    title="View Archive History"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
              </div>
              <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-lg">
                {getSortedTasks(status).length}
              </span>
            </div>
            
            <div className="min-h-[550px] bg-slate-100/30 rounded-[32px] p-2 space-y-4 flex flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto hide-scrollbar max-h-[800px]">
                {getSortedTasks(status).map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`bg-white p-5 rounded-[24px] shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 group relative ${task.isBlocked ? 'border-rose-100 bg-rose-50/20' : 'border-transparent hover:border-blue-50'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <UrgencyBadge level={task.urgency} />
                        {task.isBlocked && (
                          <div className="bg-rose-500 text-white p-1 rounded-md animate-pulse">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {columns.filter(c => c !== status).map(destStatus => (
                          <button 
                            key={destStatus}
                            onClick={(e) => { e.stopPropagation(); moveTask(task.id, destStatus); }}
                            title={`Move to ${destStatus}`}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-300 hover:text-blue-500"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-700 mb-2 leading-tight">{task.title}</h4>
                    
                    {task.isBlocked && task.blockerReason && (
                      <div className="mb-3 p-2 bg-rose-100/50 rounded-xl">
                        <p className="text-[10px] text-rose-700 font-bold italic line-clamp-2">“{task.blockerReason}”</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        {task.successCriteria.filter(c => c.done).length}/{task.successCriteria.length} Criteria
                      </span>
                      {task.notes && (
                        <span className="text-blue-400">Context Saved</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {getSortedTasks(status).length === 0 && (
                  <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-[24px]">
                    <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">No Tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History Overlay */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black text-slate-800">Archive History</h3>
                <p className="text-slate-500 font-medium">Grouped chronological summary of completed tasks.</p>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 hide-scrollbar">
              {Object.keys(groupedHistory).length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-400">Archive Empty</h4>
                  <p className="text-slate-400">Your completed engineering quests will appear here.</p>
                </div>
              ) : (
                Object.entries(groupedHistory).map(([date, tasks]) => (
                  <div key={date} className="space-y-4">
                    <div className="sticky top-0 bg-white/80 backdrop-blur-sm py-2 z-10">
                      <h4 className="text-xs font-black text-[#63A2FF] uppercase tracking-[0.2em]">{date}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.map(task => (
                        <div 
                          key={task.id}
                          className="p-5 bg-slate-50 border border-slate-100 rounded-[24px] hover:border-blue-200 transition-all group"
                        >
                          <div className="flex justify-between items-start mb-2">
                             <h5 className="font-bold text-slate-700">{task.title}</h5>
                             <UrgencyBadge level={task.urgency} />
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{task.successCriteria.filter(c => c.done).length} Criteria Met</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-emerald-500">Done at {new Date(task.completedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total archived tasks: {archivedTasks.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <KnowledgeVault task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <GlassContainer className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-black mb-6">Initialize Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Description</label>
                <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-blue-100" placeholder="e.g. Finite Element Analysis" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Urgency Scale</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => setNewUrgency(v)} className={`flex-1 py-3 rounded-xl font-black transition-all ${newUrgency === v ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-3 font-bold text-slate-400">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-3 bg-[#63A2FF] text-white font-black rounded-xl shadow-lg">Start Quest</button>
              </div>
            </div>
          </GlassContainer>
        </div>
      )}
    </div>
  );
};
