// ============================================================
// ReliefSetu — Volunteer Task View
// Mobile-first task cards with Hindi/English briefs
// ============================================================

import { useState } from 'react'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle2, Navigation, Package, Phone, UserCheck, Shield, ChevronDown } from 'lucide-react'

export default function VolunteerTaskView() {
  const { user } = useAuth()
  
  // Make component reactive to store changes
  useStore()
  
  // For the demo, we want to show the most recently assigned task
  // so the user can immediately see the result of their Coordinator actions.
  const allTasks = store.getTasks()
  const activeTasks = allTasks.filter(t => 
    t.status === 'assigned' || t.status === 'accepted' || t.status === 'in_progress'
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  
  const activeTask = activeTasks.length > 0 ? activeTasks[0] : allTasks[0];
  
  const volunteerId = activeTask?.assignedVolunteerId
  const volunteer = volunteerId ? store.getVolunteers().find(v => v.id === volunteerId) : store.getVolunteers()[0];
  const brief = activeTask?.taskBrief;

  if (!volunteer || !brief) {
    return (
      <div className="p-8 text-center text-surface-500">
        No active tasks assigned yet.
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Alert Banner */}
      <div className="bg-[#ebfbf6] border border-[#bbf0df] rounded-lg p-3 mb-6 flex items-center">
        <p className="text-xs font-bold text-[#0f766e]">
          {volunteer.name} assigned. Gemini generated Hindi and English task briefs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Volunteer Mobile View */}
        <div className="lg:col-span-1">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Volunteer Mobile</p>
              <h2 className="text-lg font-extrabold text-surface-900">{volunteer.name}</h2>
            </div>
          </div>

          <div className="bg-white border border-surface-200 rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
             {/* Fake notch/dynamic island */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-surface-100 rounded-b-xl border border-surface-200 border-t-0 z-10"></div>
            
            <div className="pt-4">
              {/* Profile Dropdown */}
              <button className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-bold text-surface-900 text-left flex items-center justify-between mb-6 transition-all hover:bg-surface-100">
                <span>{volunteer.name} (Active)</span>
                <ChevronDown className="w-4 h-4 text-surface-500" />
              </button>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">Languages</p>
                  <div className="flex gap-2">
                    {volunteer.languages.map(l => (
                      <span key={l} className="px-2 py-1 bg-[#f0f9ff] text-[#0369a1] rounded-md text-[11px] font-bold border border-[#bae6fd]">{l}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.skills.map(s => (
                      <span key={s} className="px-2 py-1 bg-surface-100 text-surface-700 rounded-md text-[11px] font-bold border border-surface-200">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">Transport</p>
                    <p className="text-sm font-bold text-surface-900">{volunteer.transportMode}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">Reliability</p>
                    <p className="text-sm font-bold text-surface-900 text-[#0f766e]">{volunteer.reliabilityScore}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Work & Briefs */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Assigned Work</p>
            <h2 className="text-lg font-extrabold text-surface-900">Task briefs</h2>
          </div>

          <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-extrabold text-surface-900 mb-6 pb-4 border-b border-surface-100">
              {activeTask.extractedNeed.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English Brief */}
              <div>
                <p className="text-[10px] font-bold text-[#0369a1] uppercase tracking-widest mb-4 bg-[#f0f9ff] inline-block px-2 py-1 rounded border border-[#bae6fd]">English brief</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-surface-400 uppercase mb-1">What to do</p>
                    <p className="text-sm font-medium text-surface-800">{brief.english.whatToDo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-400 uppercase mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Equipment</p>
                    <ul className="text-sm font-medium text-surface-800 list-disc list-inside">
                      {brief.english.whatToCarry.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-400 uppercase mb-1 flex items-center gap-1"><Navigation className="w-3 h-3" /> Location</p>
                    <p className="text-sm font-medium text-surface-800">{brief.english.whereToGo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-500 uppercase mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Safety</p>
                    <ul className="text-sm font-medium text-surface-800 list-disc list-inside">
                      {brief.english.safetyNotes.map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hindi Brief */}
              <div>
                <p className="text-[10px] font-bold text-[#0f766e] uppercase tracking-widest mb-4 bg-[#ebfbf6] inline-block px-2 py-1 rounded border border-[#bbf0df]">Hindi brief</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-surface-400 uppercase mb-1">क्या करना है</p>
                    <p className="text-sm font-medium text-surface-800">{brief.hindi?.whatToDo || brief.english.whatToDo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-400 uppercase mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> क्या ले जाना है</p>
                    <ul className="text-sm font-medium text-surface-800 list-disc list-inside">
                      {(brief.hindi?.whatToCarry || brief.english.whatToCarry).map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-400 uppercase mb-1 flex items-center gap-1"><Navigation className="w-3 h-3" /> कहाँ जाना है</p>
                    <p className="text-sm font-medium text-surface-800">{brief.hindi?.whereToGo || brief.english.whereToGo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-500 uppercase mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> सुरक्षा नोट्स</p>
                    <ul className="text-sm font-medium text-surface-800 list-disc list-inside">
                      {(brief.hindi?.safetyNotes || brief.english.safetyNotes).map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-surface-100 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
              {activeTask.status === 'in_progress' ? (
                <button 
                  onClick={() => {
                    store.updateTask(activeTask.id, { status: 'completed' as any });
                    const assignments = store.getAssignmentsByTask(activeTask.id);
                    if (assignments.length > 0) {
                      store.updateAssignment(assignments[0].id, { status: 'completed' as any });
                    }
                    store.addAuditLog({
                      id: `al_${Date.now()}`, action: 'task_completed', userId: volunteer.id, userName: volunteer.name,
                      entityType: 'task', entityId: activeTask.id, timestamp: new Date().toISOString(),
                      details: 'Volunteer completed the task', aiGenerated: false,
                    });
                    // Force re-render to fetch next active task
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className="py-3 px-8 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-sm mx-auto w-full sm:w-auto"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete Assignment
                </button>
              ) : (
                <button 
                  onClick={() => {
                    store.updateTask(activeTask.id, { status: 'in_progress' as any });
                    const assignments = store.getAssignmentsByTask(activeTask.id);
                    if (assignments.length > 0) {
                      store.updateAssignment(assignments[0].id, { status: 'accepted' as any });
                    }
                    store.addAuditLog({
                      id: `al_${Date.now()}`, action: 'task_started', userId: volunteer.id, userName: volunteer.name,
                      entityType: 'task', entityId: activeTask.id, timestamp: new Date().toISOString(),
                      details: 'Volunteer started the assignment', aiGenerated: false,
                    });
                    // Force component to re-render
                    window.dispatchEvent(new Event('storage'));
                  }}
                  className="py-3 px-8 bg-[#0f766e] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#115e59] transition-all shadow-sm mx-auto w-full sm:w-auto"
                >
                  <Navigation className="w-4 h-4" /> Start Assignment
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
