// ============================================================
// ReliefSetu — Coordinator Command Center
// Dashboard with metrics, activity feed, and quick actions
// ============================================================

import { useNavigate } from 'react-router-dom'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { Urgency, TaskStatus } from '@/types/models'
import clsx from 'clsx'

export default function CommandCenter() {
  const dataStore = useStore()
  const navigate = useNavigate()
  const stats = store.getStats()
  const tasks = store.getTasks()
  const criticalTasks = tasks.filter(t => t.extractedNeed.urgency === Urgency.CRITICAL && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-1">Smart Resource Allocation</p>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight leading-none">Command</h1>
        </div>
        <div className="bg-white border border-surface-200 shadow-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-bold text-surface-700">Demo adapter</span>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-[#ebfbf6] border border-[#bbf0df] rounded-lg p-3 mb-6 flex items-center">
        <p className="text-xs font-bold text-[#0f766e]">
          Demo mode active. Vertex AI and Firebase adapters are ready for cloud credentials.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-surface-200 rounded-lg p-4 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-surface-600 mb-2">Open needs</span>
          <span className="text-3xl font-extrabold text-surface-900 leading-none mb-2">{stats.activeTasks}</span>
          <span className="text-[10px] font-semibold text-surface-500">Awaiting action</span>
        </div>
        <div className="bg-white border border-surface-200 rounded-lg p-4 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-surface-600 mb-2">Critical</span>
          <span className="text-3xl font-extrabold text-surface-900 leading-none mb-2">{stats.criticalTasks}</span>
          <span className="text-[10px] font-semibold text-surface-500">Human approval required</span>
        </div>
        <div className="bg-white border border-surface-200 rounded-lg p-4 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-surface-600 mb-2">People helped</span>
          <span className="text-3xl font-extrabold text-surface-900 leading-none mb-2">{stats.completedTasks}</span>
          <span className="text-[10px] font-semibold text-surface-500">Completed tasks</span>
        </div>
        <div className="bg-white border border-surface-200 rounded-lg p-4 shadow-sm flex flex-col">
          <span className="text-xs font-semibold text-surface-600 mb-2">Volunteer capacity</span>
          <span className="text-3xl font-extrabold text-surface-900 leading-none mb-2">
            {stats.totalVolunteers > 0 ? Math.round(((stats.totalVolunteers - stats.volunteersDeployed) / stats.totalVolunteers) * 100) : 0}%
          </span>
          <span className="text-[10px] font-semibold text-surface-500">Available today</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Priority Queue */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Priority Queue</p>
              <h2 className="text-lg font-extrabold text-surface-900">Urgent local needs</h2>
            </div>
            <button onClick={() => navigate('/coordinator/tasks')} className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-xs font-bold text-surface-700 shadow-sm hover:bg-surface-50">
              View queue
            </button>
          </div>

          <div className="space-y-4">
            {criticalTasks.length === 0 ? (
              <div className="bg-white border border-surface-200 rounded-lg p-8 text-center text-surface-500 text-sm font-semibold">
                No critical needs pending.
              </div>
            ) : (
              criticalTasks.map((task, i) => (
                <div key={task.id} className="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      task.extractedNeed.urgency === Urgency.CRITICAL ? "bg-[#fef2f2] text-[#dc2626]" : "bg-blue-50 text-blue-600"
                    )}>
                      {task.extractedNeed.urgency === Urgency.CRITICAL ? 'Critical' : 'Medium'}
                    </span>
                    <span className="px-2 py-0.5 bg-[#ebfbf6] text-[#0f766e] rounded-full text-[10px] font-bold">
                      Approved
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-surface-900 mb-1">{task.extractedNeed.category}</h3>
                  <p className="text-xs text-surface-500 mb-4">{task.extractedNeed.summary}</p>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-surface-100 text-surface-600 rounded text-[10px] font-semibold">{task.extractedNeed.location.area || 'Unknown'}</span>
                    <span className="px-2 py-1 bg-surface-100 text-surface-600 rounded text-[10px] font-semibold">
                      {task.extractedNeed.deadline ? new Date(task.extractedNeed.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'immediately'}
                    </span>
                    <span className="px-2 py-1 bg-surface-100 text-surface-600 rounded text-[10px] font-semibold">{task.extractedNeed.affectedCount} people</span>
                  </div>

                  <button 
                    onClick={() => navigate('/coordinator/matching')}
                    className="w-full py-2.5 bg-white border border-surface-200 rounded-lg text-xs font-bold text-surface-800 hover:bg-surface-50 transition-colors shadow-sm"
                  >
                    Match volunteers
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Gemini Pipeline */}
        <div>
          <div className="mb-4">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Gemini Pipeline</p>
            <h2 className="text-lg font-extrabold text-surface-900">Field reports becoming action</h2>
          </div>
          
          <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] mt-1.5 shrink-0"></div>
                <p className="text-xs font-semibold text-surface-600 leading-relaxed">Coordinator approval guardrail enabled</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] mt-1.5 shrink-0"></div>
                <p className="text-xs font-semibold text-surface-600 leading-relaxed">Firestore demo store loaded with India-specific seed data</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] mt-1.5 shrink-0"></div>
                <p className="text-xs font-semibold text-surface-600 leading-relaxed">Vertex AI Gemini demo adapter initialized</p>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
