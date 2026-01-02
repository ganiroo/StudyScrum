
import React, { useState } from 'react';
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

export const QuestBoard: React.FC = () => {
  const { tasks, moveTask, addTask } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrgency, setNewUrgency] = useState(3);

  const columns = [TaskStatus.TO_LEARN, TaskStatus.ACTIVE, TaskStatus.COMPLETED];

  const getSortedTasks = (status: TaskStatus) => {
    return tasks
      .filter(t => t.status === status)
      .sort((a, b) => b.urgency - a.urgency);
  };

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
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Quest Board</h2>
          <p className="text-slate-500 font-medium">Prioritize your engineering curriculum.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#63A2FF] text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          New Quest
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(status => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{status}</h3>
              <span className="bg-slate-200 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-lg">
                {getSortedTasks(status).length}
              </span>
            </div>
            
            <div className="min-h-[500px] bg-slate-100/30 rounded-[32px] p-2 space-y-4">
              {getSortedTasks(status).map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white p-5 rounded-[24px] shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-blue-100 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <UrgencyBadge level={task.urgency} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {status !== TaskStatus.COMPLETED && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveTask(task.id, status === TaskStatus.TO_LEARN ? TaskStatus.ACTIVE : TaskStatus.COMPLETED); }}
                          className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-blue-500"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-700 mb-2 leading-tight">{task.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {/* Fixed: checklist does not exist on Task, using successCriteria instead */}
                      {task.successCriteria.length} Steps
                    </span>
                    {task.notes && (
                      <span className="flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Notes
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {getSortedTasks(status).length === 0 && (
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-[24px]">
                  <p className="text-slate-300 font-medium text-sm">No quests here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <KnowledgeVault task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <GlassContainer className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-bold mb-6">Create New Quest</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Quest Title</label>
                <input 
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-700 font-medium focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Solid Mechanics Review"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Urgency Scale (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button 
                      key={v}
                      onClick={() => setNewUrgency(v)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${newUrgency === v ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-3 font-bold text-slate-400">Cancel</button>
                <button onClick={handleCreate} className="flex-1 py-3 bg-[#63A2FF] text-white font-bold rounded-xl shadow-lg">Start Quest</button>
              </div>
            </div>
          </GlassContainer>
        </div>
      )}
    </div>
  );
};
