// ============================================================
// ReliefSetu — Coordinator Command Center
// Dashboard with metrics, activity feed, and quick actions
// ============================================================

import { useNavigate } from 'react-router-dom'
import { store } from '@/services/store'
import { MetricCard, UrgencyBadge, StatusChip, TimeAgo, SectionHeader, EmptyState } from '@/components/ui'
import { useStore } from '@/hooks/useStore'
import { Urgency, TaskStatus } from '@/types/models'
import {
  AlertTriangle, CheckCircle2, Users, FileText, Clock, TrendingUp,
  ArrowRight, Activity, Zap, MapPin, Layers
} from 'lucide-react'
import clsx from 'clsx'

export default function CommandCenter() {
  const dataStore = useStore()
  const navigate = useNavigate()
  const stats = store.getStats()
  const recentLogs = store.getAuditLogs().slice(0, 8)
  const tasks = store.getTasks()
  const criticalTasks = tasks.filter(t => t.extractedNeed.urgency === Urgency.CRITICAL && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED)
  const pendingReports = store.getReportsByStatus('extracted' as any)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900">Command Center</h1>
          <p className="text-sm text-surface-500 mt-0.5">Real-time field intelligence overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Activity className="w-3 h-3" /> Live
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard
          label="Critical Needs"
          value={stats.criticalTasks}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
        <MetricCard
          label="Pending Review"
          value={stats.extractedPending}
          icon={<FileText className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          label="Active Tasks"
          value={stats.activeTasks}
          icon={<Zap className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          label="Volunteers Active"
          value={`${stats.volunteersDeployed}/${stats.totalVolunteers}`}
          icon={<Users className="w-5 h-5" />}
          color="violet"
        />
        <MetricCard
          label="Completed Today"
          value={stats.completedTasks}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Critical Needs - 2/3 width */}
        <div className="lg:col-span-2">
          <SectionHeader
            title="⚠️ Critical & Urgent Needs"
            subtitle={`${criticalTasks.length} needs require immediate attention`}
            action={
              <button onClick={() => navigate('/coordinator/tasks')} className="btn-ghost btn-sm">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <div className="space-y-3">
            {criticalTasks.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-8 h-8" />}
                title="No Critical Needs"
                description="All critical needs have been addressed. Great work!"
              />
            ) : (
              criticalTasks.map((task, i) => (
                <div
                  key={task.id}
                  onClick={() => navigate('/coordinator/tasks')}
                  className={clsx(
                    'card-interactive p-4 border-l-4 animate-slide-up',
                    task.extractedNeed.urgency === Urgency.CRITICAL ? 'border-l-red-500' : 'border-l-amber-400'
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <UrgencyBadge urgency={task.extractedNeed.urgency} size="sm" pulse={task.extractedNeed.urgency === Urgency.CRITICAL} />
                        <StatusChip status={task.status} />
                      </div>
                      <h3 className="text-sm font-semibold text-surface-800 mb-1">{task.extractedNeed.category}</h3>
                      <p className="text-xs text-surface-500 line-clamp-2">{task.extractedNeed.summary}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.extractedNeed.location.area}, {task.extractedNeed.location.city}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.extractedNeed.affectedCount} affected</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-red-600">{task.extractedNeed.urgencyScore}/10</div>
                      <TimeAgo timestamp={task.createdAt} />
                    </div>
                  </div>
                  {task.priorityReason && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-100">
                      <Zap className="w-3 h-3 inline mr-1" /> AI: {task.priorityReason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pending AI Extractions */}
          {pendingReports.length > 0 && (
            <div className="mt-6">
              <SectionHeader
                title="📋 Pending AI Review"
                subtitle={`${pendingReports.length} reports extracted, awaiting coordinator review`}
                action={
                  <button onClick={() => navigate('/coordinator/review')} className="btn-primary btn-sm">
                    Review Now <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <div className="space-y-2">
                {pendingReports.slice(0, 3).map(report => (
                  <div key={report.id} className="card p-3 border-l-4 border-l-blue-400 cursor-pointer hover:bg-surface-50" onClick={() => navigate('/coordinator/review')}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-surface-700">{report.extractedNeed?.category}</span>
                        <p className="text-xs text-surface-500 truncate mt-0.5">{report.rawText.slice(0, 80)}...</p>
                      </div>
                      <UrgencyBadge urgency={report.extractedNeed?.urgency || Urgency.MEDIUM} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Feed - 1/3 width */}
        <div>
          <SectionHeader title="📡 Activity Feed" subtitle="Real-time actions" />
          <div className="card divide-y divide-surface-100 overflow-hidden">
            {recentLogs.map((log, i) => (
              <div key={log.id} className="p-3 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start gap-2.5">
                  <div className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    log.aiGenerated ? 'bg-brand-50 text-brand-600' : 'bg-surface-100 text-surface-500'
                  )}>
                    {log.aiGenerated ? <Zap className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-700 leading-relaxed">
                      <span className="font-medium">{log.userName}</span>
                      {' · '}
                      {log.details.length > 80 ? log.details.slice(0, 80) + '...' : log.details}
                    </p>
                    <TimeAgo timestamp={log.timestamp} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 card p-4">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Avg Response Time</span>
                <span className="font-semibold text-brand-700">{stats.avgResponseTime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Total Reports</span>
                <span className="font-semibold">{stats.totalReports}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-surface-500">Duplicates Detected</span>
                <span className="font-semibold text-amber-600">{stats.duplicatesDetected}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
