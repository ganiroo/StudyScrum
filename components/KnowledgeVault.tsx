
import React, { useState } from 'react';
import { Task } from '../types';
import { useApp } from '../context/AppContext';

interface KnowledgeVaultProps {
  task: Task;
  onClose: () => void;
}

export const KnowledgeVault: React.FC<{ task: Task; onClose: () => void }> = ({ task, onClose }) => {
  const { updateTask, deleteTask } = useApp();
  const [localTask, setLocalTask] = useState<Task>(task);
  const [openSection, setOpenSection] = useState<'formulas' | 'notes' | 'criteria' | 'blocker' | null>('notes');

  const handleSave = () => {
    updateTask(localTask);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const toggleCheck = (id: string) => {
    const newCriteria = localTask.successCriteria.map(c => c.id === id ? { ...c, done: !c.done } : c);
    setLocalTask({ ...localTask, successCriteria: newCriteria });
  };

  const addCriteriaItem = () => {
    const newItem = { id: Math.random().toString(), text: '', done: false };
    setLocalTask({ ...localTask, successCriteria: [...localTask.successCriteria, newItem] });
  };

  const updateCriteriaText = (id: string, text: string) => {
    const newCriteria = localTask.successCriteria.map(c => c.id === id ? { ...c, text } : c);
    setLocalTask({ ...localTask, successCriteria: newCriteria });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="glass w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-4">
              <input 
                value={localTask.title}
                onChange={(e) => setLocalTask({ ...localTask, title: e.target.value })}
                className="text-3xl font-black text-slate-800 bg-transparent border-none focus:ring-0 w-full p-0"
                placeholder="Task Title"
              />
              <p className="text-slate-500 font-medium text-sm mt-1">Contextual Knowledge Vault</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button 
                onClick={() => {
                  const newState = !localTask.isBlocked;
                  setLocalTask({...localTask, isBlocked: newState});
                  if (newState) setOpenSection('blocker');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${localTask.isBlocked ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
                </svg>
                {localTask.isBlocked ? 'BLOCKED' : 'FLAG BLOCKER'}
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
            {/* Blocker Reason Section */}
            {localTask.isBlocked && (
              <div className={`border-2 border-rose-200 rounded-2xl overflow-hidden transition-all bg-rose-50/30`}>
                <button onClick={() => setOpenSection(openSection === 'blocker' ? null : 'blocker')} className="w-full flex justify-between items-center p-4 text-left font-bold text-rose-700">
                  <span className="flex items-center gap-2">Blocker Reason</span>
                  <svg className={`w-5 h-5 transition-transform ${openSection === 'blocker' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {openSection === 'blocker' && (
                  <div className="px-4 pb-4">
                    <textarea 
                      value={localTask.blockerReason || ''} 
                      onChange={(e) => setLocalTask({ ...localTask, blockerReason: e.target.value })} 
                      className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[60px] text-rose-800 font-medium placeholder:text-rose-300" 
                      placeholder="Why is this task stuck? (Enter for new line)" 
                    />
                  </div>
                )}
              </div>
            )}

            {/* Formulas Box */}
            <div className={`border border-slate-200 rounded-2xl overflow-hidden transition-all ${openSection === 'formulas' ? 'bg-white' : 'bg-slate-50'}`}>
              <button onClick={() => setOpenSection(openSection === 'formulas' ? null : 'formulas')} className="w-full flex justify-between items-center p-4 text-left font-bold text-slate-700">
                <span className="flex items-center gap-2">Formulas</span>
                <svg className={`w-5 h-5 transition-transform ${openSection === 'formulas' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openSection === 'formulas' && (
                <div className="px-4 pb-4">
                  <textarea 
                    value={localTask.formulas} 
                    onChange={(e) => setLocalTask({ ...localTask, formulas: e.target.value })} 
                    className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[100px] text-slate-600 font-mono text-sm" 
                    placeholder="Key equations... (Enter for new line)" 
                  />
                </div>
              )}
            </div>

            {/* Notes Box */}
            <div className={`border border-slate-200 rounded-2xl overflow-hidden transition-all ${openSection === 'notes' ? 'bg-white' : 'bg-slate-50'}`}>
              <button onClick={() => setOpenSection(openSection === 'notes' ? null : 'notes')} className="w-full flex justify-between items-center p-4 text-left font-bold text-slate-700">
                <span className="flex items-center gap-2">Notes</span>
                <svg className={`w-5 h-5 transition-transform ${openSection === 'notes' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openSection === 'notes' && (
                <div className="px-4 pb-4">
                  <textarea 
                    value={localTask.notes} 
                    onChange={(e) => setLocalTask({ ...localTask, notes: e.target.value })} 
                    className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[200px] text-slate-600 leading-relaxed text-sm" 
                    placeholder="Capture your detailed study notes here... (Enter key creates new line)" 
                  />
                </div>
              )}
            </div>

            {/* Success Criteria Box */}
            <div className={`border border-slate-200 rounded-2xl overflow-hidden transition-all ${openSection === 'criteria' ? 'bg-white' : 'bg-slate-50'}`}>
              <button onClick={() => setOpenSection(openSection === 'criteria' ? null : 'criteria')} className="w-full flex justify-between items-center p-4 text-left font-bold text-slate-700">
                <span className="flex items-center gap-2">Success Criteria</span>
                <svg className={`w-5 h-5 transition-transform ${openSection === 'criteria' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openSection === 'criteria' && (
                <div className="px-4 pb-4 space-y-2">
                  {localTask.successCriteria.map(item => (
                    <div key={item.id} className="flex items-center gap-3 group">
                      <input type="checkbox" checked={item.done} onChange={() => toggleCheck(item.id)} className="w-5 h-5 rounded-lg border-slate-300 text-blue-500 focus:ring-blue-500" />
                      <input type="text" value={item.text} onChange={(e) => updateCriteriaText(item.id, e.target.value)} className={`flex-1 bg-transparent border-none focus:ring-0 p-0 text-slate-600 font-medium ${item.done ? 'line-through opacity-50' : ''}`} placeholder="Success metric..." />
                    </div>
                  ))}
                  <button onClick={addCriteriaItem} className="text-xs text-blue-500 font-black hover:underline pt-2 uppercase tracking-widest">+ Add Criterion</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button onClick={handleDelete} className="text-rose-400 text-[10px] font-black hover:text-rose-600 transition-colors uppercase tracking-[0.2em]">Delete Task</button>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-6 py-2 rounded-2xl text-slate-400 font-bold hover:bg-slate-100 transition-colors text-sm">Cancel</button>
              <button onClick={handleSave} className="px-8 py-2 rounded-2xl bg-[#63A2FF] text-white font-black shadow-xl shadow-blue-100 hover:brightness-105 transition-all text-sm">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
