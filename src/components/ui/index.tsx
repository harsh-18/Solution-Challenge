// ============================================================
// ReliefSetu — Shared UI Components
// ============================================================

import { ReactNode } from 'react'
import { Urgency, TaskStatus, AssignmentStatus, ReportStatus } from '@/types/models'
import clsx from 'clsx'
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, Circle, Truck,
  ArrowRight, Loader2
} from 'lucide-react'

// ---- Urgency Badge ----
export function UrgencyBadge({ urgency, size = 'md', pulse = false }: { urgency: Urgency, size?: 'sm' | 'md' | 'lg', pulse?: boolean }) {
  const config = {
    [Urgency.CRITICAL]: { class: 'urgency-critical-badge', icon: AlertTriangle, label: 'Critical' },
    [Urgency.HIGH]: { class: 'urgency-high-badge', icon: Clock, label: 'High' },
    [Urgency.MEDIUM]: { class: 'urgency-medium-badge', icon: Circle, label: 'Medium' },
    [Urgency.LOW]: { class: 'urgency-low-badge', icon: CheckCircle2, label: 'Low' },
  }
  const c = config[urgency]
  const Icon = c.icon
  return (
    <span className={clsx('badge', c.class, {
      'text-xs px-2 py-0.5': size === 'sm',
      'text-xs px-2.5 py-1': size === 'md',
      'text-sm px-3 py-1.5': size === 'lg',
      'animate-pulse-urgent': pulse && urgency === Urgency.CRITICAL,
    })}>
      <Icon className={clsx(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      {c.label}
    </span>
  )
}

// ---- Status Chip ----
const STATUS_CONFIG: Record<string, { class: string, label: string }> = {
  'pending_review': { class: 'status-pending', label: 'Pending Review' },
  'approved': { class: 'status-approved', label: 'Approved' },
  'assigned': { class: 'status-assigned', label: 'Assigned' },
  'accepted': { class: 'status-accepted', label: 'Accepted' },
  'in_progress': { class: 'status-in-progress', label: 'In Progress' },
  'completed': { class: 'status-completed', label: 'Completed' },
  'cancelled': { class: 'status-cancelled', label: 'Cancelled' },
  'proposed': { class: 'status-pending', label: 'Proposed' },
  'sent': { class: 'status-assigned', label: 'Sent' },
  'rejected': { class: 'status-rejected', label: 'Rejected' },
  'submitted': { class: 'status-pending', label: 'Submitted' },
  'extracting': { class: 'status-in-progress', label: 'Extracting...' },
  'extracted': { class: 'status-approved', label: 'Extracted' },
  'duplicate_flagged': { class: 'status-cancelled', label: 'Duplicate' },
  'task_created': { class: 'status-completed', label: 'Task Created' },
}

export function StatusChip({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || { class: 'status-pending', label: status }
  return <span className={clsx('badge', c.class)}>{c.label}</span>
}

// ---- Confidence Bar ----
export function ConfidenceBar({ value, label }: { value: number, label?: string }) {
  const pct = Math.round(value * 100)
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-surface-500 min-w-[80px]">{label}</span>}
      <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-surface-600 min-w-[36px] text-right">{pct}%</span>
    </div>
  )
}

// ---- TimeAgo display ----
export function TimeAgo({ timestamp }: { timestamp: string }) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  
  let text = ''
  if (days > 0) text = `${days}d ago`
  else if (hours > 0) text = `${hours}h ago`
  else if (mins > 0) text = `${mins}m ago`
  else text = 'Just now'

  return <span className="text-xs text-surface-400">{text}</span>
}

// ---- Metric Card ----
export function MetricCard({ label, value, icon, color = 'brand', trend }: {
  label: string
  value: string | number
  icon: ReactNode
  color?: 'brand' | 'red' | 'amber' | 'emerald' | 'blue' | 'violet'
  trend?: string
}) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-700',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between">
        <div className={clsx('p-2 rounded-lg', colorMap[color])}>
          {icon}
        </div>
        {trend && <span className="text-xs text-emerald-600 font-medium">{trend}</span>}
      </div>
      <div className="stat-value mt-2">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

// ---- Empty State ----
export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="p-4 bg-surface-100 rounded-2xl text-surface-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-surface-700 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ---- Loading Spinner ----
export function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className={clsx(sizeMap[size], 'animate-spin text-brand-600')} />
      {text && <p className="text-sm text-surface-500">{text}</p>}
    </div>
  )
}

// ---- AI Processing Animation ----
export function AIProcessingCard({ step, steps }: { step: number, steps: string[] }) {
  return (
    <div className="card p-6 border-brand-200 bg-brand-50/30 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-400 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-700">Gemini AI Processing</p>
          <p className="text-xs text-brand-500">Analyzing field report...</p>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className={clsx('flex items-center gap-2 text-sm transition-all duration-300', {
            'text-brand-700 font-medium': i === step,
            'text-emerald-600': i < step,
            'text-surface-400': i > step,
          })}>
            {i < step ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : i === step ? (
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Match Score Ring ----
export function MatchScoreRing({ score, size = 48 }: { score: number, size?: number }) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e7e5e4" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{score}</span>
    </div>
  )
}

// ---- Section Header ----
export function SectionHeader({ title, subtitle, action }: { title: string, subtitle?: string, action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-surface-900">{title}</h2>
        {subtitle && <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ---- Language Badge ----
export function LanguageBadge({ language }: { language: string }) {
  return <span className="badge bg-violet-50 text-violet-700 border border-violet-200">{language}</span>
}

// ---- Info Row ----
export function InfoRow({ icon, label, value }: { icon: ReactNode, label: string, value: string | ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-surface-400 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-500">{label}</p>
        <p className="text-sm font-medium text-surface-800 break-words">{value}</p>
      </div>
    </div>
  )
}
