// ============================================================
// ReliefSetu — Volunteer Task View
// Mobile-first task cards with Hindi/English briefs
// ============================================================

import { useState } from 'react'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { useAuth } from '@/contexts/AuthContext'
import { TaskStatus, AssignmentStatus, Task } from '@/types/models'
import { UrgencyBadge, StatusChip, TimeAgo, EmptyState } from '@/components/ui'
import {
  ClipboardCheck, MapPin, Phone, Package, Shield, Navigation,
  CheckCircle2, Clock, AlertTriangle, Globe, ChevronDown, ChevronUp,
  ArrowRight, XCircle, Play, Flag
} from 'lucide-react'
import clsx from 'clsx'

export default function VolunteerTaskView() {
  const { user } = useAuth()
  const [language, setLanguage] = useState<'english' | 'hindi'>('english')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  // Get tasks assigned to current demo volunteer
  const allTasks = store.getTasks()
  const myTasks = allTasks.filter(t => t.assignedVolunteerId === 'v3' || t.assignedVolunteerId === 'v2' || t.assignedVolunteerId === 'v5')
  const activeTasks = myTasks.filter(t => [TaskStatus.ASSIGNED, TaskStatus.ACCEPTED, TaskStatus.IN_PROGRESS].includes(t.status))
  const completedTasks = myTasks.filter(t => t.status === TaskStatus.COMPLETED)

  const [tab, setTab] = useState<'active' | 'completed'>('active')
  const displayTasks = tab === 'active' ? activeTasks : completedTasks

  const handleStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    store.updateTask(taskId, { status: newStatus })
    store.addAuditLog({
      id: `al_${Date.now()}`, action: `task_${newStatus}`, userId: user?.id || 'v', userName: user?.name || 'Volunteer',
      entityType: 'task', entityId: taskId, timestamp: new Date().toISOString(),
      details: `Task status updated to ${newStatus}`, aiGenerated: false,
    })
  }

  const getStatusActions = (task: Task) => {
    switch (task.status) {
      case TaskStatus.ASSIGNED:
        return (
          <div className="flex gap-2">
            <button onClick={() => handleStatusUpdate(task.id, TaskStatus.ACCEPTED)} className="btn-success btn-sm flex-1">
              <CheckCircle2 className="w-4 h-4" /> Accept Task
            </button>
            <button onClick={() => handleStatusUpdate(task.id, TaskStatus.CANCELLED)} className="btn-danger btn-sm">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )
      case TaskStatus.ACCEPTED:
        return (
          <button onClick={() => handleStatusUpdate(task.id, TaskStatus.IN_PROGRESS)} className="btn-primary w-full">
            <Play className="w-4 h-4" /> Start Task — En Route
          </button>
        )
      case TaskStatus.IN_PROGRESS:
        return (
          <button onClick={() => handleStatusUpdate(task.id, TaskStatus.COMPLETED)} className="btn-success w-full">
            <Flag className="w-4 h-4" /> Mark as Completed
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900">My Tasks</h1>
          <p className="text-sm text-surface-500">{activeTasks.length} active • {completedTasks.length} completed</p>
        </div>
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'english' ? 'hindi' : 'english')}
          className="btn-ghost btn-sm border border-surface-200"
        >
          <Globe className="w-3.5 h-3.5" />
          {language === 'english' ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-100 rounded-xl p-1">
        <button onClick={() => setTab('active')} className={clsx('flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all', tab === 'active' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500')}>
          Active ({activeTasks.length})
        </button>
        <button onClick={() => setTab('completed')} className={clsx('flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all', tab === 'completed' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500')}>
          Completed ({completedTasks.length})
        </button>
      </div>

      {displayTasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-10 h-10" />}
          title={tab === 'active' ? 'No active tasks' : 'No completed tasks yet'}
          description={tab === 'active' ? 'You will be notified when a new task is assigned to you.' : 'Complete your first task to see it here.'}
        />
      ) : (
        <div className="space-y-4">
          {displayTasks.map((task, i) => {
            const brief = task.taskBrief?.[language]
            const isExpanded = expandedTask === task.id

            return (
              <div key={task.id} className={clsx('card overflow-hidden animate-slide-up', task.extractedNeed.urgency === 'critical' && 'ring-1 ring-red-200')} style={{ animationDelay: `${i * 60}ms` }}>
                {/* Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <UrgencyBadge urgency={task.extractedNeed.urgency} pulse={task.status === TaskStatus.ASSIGNED} />
                    <StatusChip status={task.status} />
                  </div>
                  <h3 className="text-base font-bold text-surface-900 mb-1">{task.extractedNeed.category}</h3>
                  <p className="text-sm text-surface-600">{language === 'hindi' && task.extractedNeed.summaryHindi ? task.extractedNeed.summaryHindi : task.extractedNeed.summary}</p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-surface-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.extractedNeed.location.area}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> <TimeAgo timestamp={task.createdAt} /></span>
                  </div>
                </div>

                {/* Task Brief (if available) */}
                {brief && (
                  <>
                    <button
                      onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-brand-50/50 border-y border-brand-100 text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4" />
                        {language === 'english' ? 'AI Task Brief' : 'AI टास्क ब्रीफ'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-surface-50 space-y-4 animate-slide-up">
                        {/* What to do */}
                        <div>
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
                            {language === 'english' ? '📋 What to Do' : '📋 क्या करना है'}
                          </p>
                          <p className="text-sm text-surface-700">{brief.whatToDo}</p>
                        </div>

                        {/* What to carry */}
                        <div>
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
                            {language === 'english' ? '🎒 What to Carry' : '🎒 क्या ले जाना है'}
                          </p>
                          <ul className="space-y-1">
                            {brief.whatToCarry.map((item, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-surface-700">
                                <Package className="w-3.5 h-3.5 text-surface-400 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Where to go */}
                        <div>
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
                            {language === 'english' ? '📍 Where to Go' : '📍 कहाँ जाना है'}
                          </p>
                          <p className="text-sm text-surface-700 flex items-start gap-2">
                            <Navigation className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                            {brief.whereToGo}
                          </p>
                        </div>

                        {/* Contact */}
                        <div>
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
                            {language === 'english' ? '📞 Who to Contact' : '📞 किससे संपर्क करें'}
                          </p>
                          <p className="text-sm text-surface-700 flex items-start gap-2">
                            <Phone className="w-3.5 h-3.5 text-surface-400 shrink-0 mt-0.5" />
                            {brief.whoToContact}
                          </p>
                        </div>

                        {/* Safety */}
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1.5">
                            {language === 'english' ? '⚠️ Safety Notes' : '⚠️ सुरक्षा नोट्स'}
                          </p>
                          <ul className="space-y-1">
                            {brief.safetyNotes.map((note, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs text-amber-700">
                                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Estimated time */}
                        <div className="flex items-center gap-2 text-sm text-surface-500">
                          <Clock className="w-4 h-4" />
                          {language === 'english' ? 'Estimated Time' : 'अनुमानित समय'}: <span className="font-semibold text-surface-700">{brief.estimatedTime}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Actions */}
                <div className="p-4 pt-3">
                  {getStatusActions(task)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-[10px] text-surface-400 text-center mt-4 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" /> Emergency: Call 112 | Coordinator: +91 98765 43211
      </p>
    </div>
  )
}
