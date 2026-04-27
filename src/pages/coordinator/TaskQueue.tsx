// ============================================================
// ReliefSetu — Task Queue
// Filterable, sortable task pipeline view
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { TaskStatus, Urgency } from '@/types/models'
import { UrgencyBadge, StatusChip, TimeAgo, EmptyState, SectionHeader } from '@/components/ui'
import {
  ListChecks, Filter, MapPin, Users, Clock, ArrowRight, CheckCircle2,
  AlertTriangle, Zap, User as UserIcon, ChevronDown
} from 'lucide-react'
import clsx from 'clsx'

const STATUS_TABS = [
  { key: 'all', label: 'All', count: 0 },
  { key: TaskStatus.PENDING_REVIEW, label: 'Pending', count: 0 },
  { key: TaskStatus.APPROVED, label: 'Approved', count: 0 },
  { key: TaskStatus.ASSIGNED, label: 'Assigned', count: 0 },
  { key: TaskStatus.IN_PROGRESS, label: 'In Progress', count: 0 },
  { key: TaskStatus.COMPLETED, label: 'Completed', count: 0 },
]

export default function TaskQueue() {
  const dataStore = useStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'all'>('all')

  const allTasks = store.getTasks()

  // compute counts
  const tabs = STATUS_TABS.map(tab => ({
    ...tab,
    count: tab.key === 'all' ? allTasks.length : allTasks.filter(t => t.status === tab.key).length,
  }))

  let filteredTasks = activeTab === 'all' ? allTasks : allTasks.filter(t => t.status === activeTab)
  if (urgencyFilter !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.extractedNeed.urgency === urgencyFilter)
  }

  // Sort: critical first, then by urgencyScore desc
  filteredTasks.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const aOrder = urgencyOrder[a.extractedNeed.urgency] ?? 4
    const bOrder = urgencyOrder[b.extractedNeed.urgency] ?? 4
    if (aOrder !== bOrder) return aOrder - bOrder
    return b.extractedNeed.urgencyScore - a.extractedNeed.urgencyScore
  })

  const handleApproveTask = (taskId: string) => {
    store.updateTask(taskId, { status: TaskStatus.APPROVED, approvedBy: 'u2', approvalTimestamp: new Date().toISOString() })
    store.addAuditLog({
      id: `al_${Date.now()}`, action: 'task_approved', userId: 'u2', userName: 'Rajesh Kumar',
      entityType: 'task', entityId: taskId, timestamp: new Date().toISOString(),
      details: 'Task approved by coordinator', aiGenerated: false,
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <SectionHeader
        title="Task Queue"
        subtitle={`${allTasks.length} total tasks`}
      />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar mb-4 bg-surface-100 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              activeTab === tab.key
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            )}
          >
            {tab.label}
            <span className={clsx('ml-1.5 badge text-[10px]', activeTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-surface-200 text-surface-500')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Urgency Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-surface-400" />
        <span className="text-xs text-surface-500">Urgency:</span>
        <button
          onClick={() => setUrgencyFilter('all')}
          className={clsx('badge text-[10px] cursor-pointer', urgencyFilter === 'all' ? 'bg-surface-800 text-white' : 'bg-surface-100 text-surface-500')}
        >
          All
        </button>
        {Object.values(Urgency).map(u => (
          <button key={u} onClick={() => setUrgencyFilter(urgencyFilter === u ? 'all' : u)} className={clsx('cursor-pointer opacity-80 hover:opacity-100', urgencyFilter === u && 'opacity-100 ring-2 ring-offset-1 ring-surface-300 rounded-full')}>
            <UrgencyBadge urgency={u} size="sm" />
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-10 h-10" />}
          title="No tasks found"
          description={`No tasks match the current filter. Try adjusting your filters.`}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, i) => (
            <div
              key={task.id}
              className={clsx(
                'card p-4 border-l-4 animate-slide-up',
                task.extractedNeed.urgency === Urgency.CRITICAL ? 'border-l-red-500' :
                task.extractedNeed.urgency === Urgency.HIGH ? 'border-l-amber-400' :
                task.extractedNeed.urgency === Urgency.MEDIUM ? 'border-l-blue-400' :
                'border-l-emerald-400'
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <UrgencyBadge urgency={task.extractedNeed.urgency} size="sm" />
                    <StatusChip status={task.status} />
                    {task.extractedNeed.vulnerableGroups.map(g => (
                      <span key={g} className="badge bg-red-50 text-red-500 border border-red-100 text-[10px]">{g}</span>
                    ))}
                  </div>

                  <h3 className="text-sm font-semibold text-surface-800 mb-0.5">{task.extractedNeed.category}</h3>
                  <p className="text-xs text-surface-500 line-clamp-2 mb-2">{task.extractedNeed.summary}</p>

                  <div className="flex items-center gap-4 text-xs text-surface-400 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.extractedNeed.location.area}, {task.extractedNeed.location.city}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.extractedNeed.affectedCount} affected</span>
                    <TimeAgo timestamp={task.createdAt} />
                    {task.assignedVolunteerName && (
                      <span className="flex items-center gap-1 text-violet-600"><UserIcon className="w-3 h-3" /> {task.assignedVolunteerName}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-lg font-bold text-surface-700">{task.extractedNeed.urgencyScore}/10</div>
                  {task.status === TaskStatus.PENDING_REVIEW && (
                    <button onClick={() => handleApproveTask(task.id)} className="btn-primary btn-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {task.status === TaskStatus.APPROVED && (
                    <button onClick={() => navigate('/coordinator/matching', { state: { taskId: task.id } })} className="btn-primary btn-sm">
                      <UserIcon className="w-3.5 h-3.5" /> Assign
                    </button>
                  )}
                </div>
              </div>

              {task.priorityReason && (
                <div className="mt-2 text-xs text-brand-600 bg-brand-50/50 rounded-lg p-2 border border-brand-100">
                  <Zap className="w-3 h-3 inline mr-1" /> {task.priorityReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
