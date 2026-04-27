// ============================================================
// ReliefSetu — Extraction Review
// Side-by-side raw report ↔ AI-extracted data
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { Report, ReportStatus, TaskStatus, Urgency, Task } from '@/types/models'
import { UrgencyBadge, StatusChip, ConfidenceBar, TimeAgo, EmptyState, LanguageBadge, InfoRow } from '@/components/ui'
import {
  FileText, CheckCircle2, XCircle, AlertTriangle, MapPin, Users,
  Clock, Package, Wrench, Brain, ArrowRight, ChevronLeft, ChevronRight,
  Copy, Globe, Zap, Shield, MessageSquare
} from 'lucide-react'
import clsx from 'clsx'

export default function ExtractionReview() {
  const dataStore = useStore()
  const navigate = useNavigate()

  // Get reports that have been extracted but not yet made into tasks
  const pendingReports = store.getReportsByStatus(ReportStatus.EXTRACTED)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selectedReport = pendingReports[selectedIdx]

  const handleApprove = (report: Report) => {
    // Create task from report
    const taskId = `t_${Date.now()}`
    const newTask: Task = {
      id: taskId,
      reportId: report.id,
      extractedNeed: report.extractedNeed!,
      status: TaskStatus.PENDING_REVIEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priorityRank: report.extractedNeed!.urgencyScore,
      priorityReason: report.extractedNeed!.reasoning,
    }

    store.addTask(newTask)
    store.updateReport(report.id, { status: ReportStatus.TASK_CREATED })
    store.addAuditLog({
      id: `al_${Date.now()}`,
      action: 'task_created_from_report',
      userId: 'u2',
      userName: 'Rajesh Kumar',
      entityType: 'task',
      entityId: taskId,
      timestamp: new Date().toISOString(),
      details: `Task created from report: ${report.extractedNeed!.category}`,
      aiGenerated: false,
    })

    // Move to next if available
    if (selectedIdx >= pendingReports.length - 1) {
      setSelectedIdx(Math.max(0, selectedIdx - 1))
    }
  }

  const handleReject = (report: Report) => {
    store.updateReport(report.id, { status: ReportStatus.REJECTED })
    if (selectedIdx >= pendingReports.length - 1) {
      setSelectedIdx(Math.max(0, selectedIdx - 1))
    }
  }

  if (pendingReports.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-surface-900 mb-4">AI Extraction Review</h1>
        <EmptyState
          icon={<CheckCircle2 className="w-10 h-10" />}
          title="All reports reviewed"
          description="No pending reports to review. New field reports will appear here after AI extraction."
          action={<button onClick={() => navigate('/coordinator')} className="btn-primary">Back to Command Center</button>}
        />
      </div>
    )
  }

  const need = selectedReport?.extractedNeed
  const duplicates = store.getDuplicateClusters().filter(dc => dc.reportIds.includes(selectedReport?.id || ''))

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900">AI Extraction Review</h1>
          <p className="text-sm text-surface-500">{pendingReports.length} reports pending review</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))} disabled={selectedIdx === 0} className="btn-ghost btn-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-surface-600">{selectedIdx + 1} / {pendingReports.length}</span>
          <button onClick={() => setSelectedIdx(Math.min(pendingReports.length - 1, selectedIdx + 1))} disabled={selectedIdx >= pendingReports.length - 1} className="btn-ghost btn-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicates.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-fade-in">
          <Copy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Potential Duplicate Detected</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {duplicates[0].similarity > 0.8 ? 'High' : 'Moderate'} similarity ({Math.round(duplicates[0].similarity * 100)}%) with {duplicates[0].reportIds.length - 1} other report(s).
              Review before creating a new task.
            </p>
          </div>
        </div>
      )}

      {selectedReport && need && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Raw Report */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-surface-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-surface-700">Raw Field Report</h2>
                <p className="text-xs text-surface-400">Submitted by {selectedReport.submittedByName}</p>
              </div>
            </div>

            <div className="bg-surface-50 rounded-lg p-4 text-sm text-surface-700 leading-relaxed border border-surface-100 mb-4 font-mono">
              "{selectedReport.rawText}"
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={`${selectedReport.location.area}, ${selectedReport.location.city}`} />
              <InfoRow icon={<Clock className="w-3.5 h-3.5" />} label="Submitted" value={<TimeAgo timestamp={selectedReport.timestamp} />} />
              <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Language" value={selectedReport.language || 'Auto-detected'} />
              {selectedReport.urgencyHint && (
                <InfoRow icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Field Urgency" value={<UrgencyBadge urgency={selectedReport.urgencyHint} size="sm" />} />
              )}
            </div>
          </div>

          {/* Right: AI Extraction */}
          <div className="card p-5 border-brand-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-400 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-brand-700">Gemini AI Extraction</h2>
                <p className="text-xs text-surface-400">Structured data ready for review</p>
              </div>
            </div>

            {/* Category + Urgency */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-surface-800">{need.category}</span>
              <UrgencyBadge urgency={need.urgency} />
            </div>

            {/* Summary */}
            <div className="mb-4">
              <p className="text-sm text-surface-700 mb-2">{need.summary}</p>
              {need.summaryHindi && (
                <p className="text-sm text-surface-500 italic border-l-2 border-brand-200 pl-3">{need.summaryHindi}</p>
              )}
            </div>

            {/* Confidence */}
            <div className="mb-4">
              <ConfidenceBar value={need.confidence} label="AI Confidence" />
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-surface-50 rounded-lg p-2.5">
                <p className="text-[10px] text-surface-400 uppercase tracking-wider">Affected</p>
                <p className="text-lg font-bold text-surface-800">{need.affectedCount}</p>
              </div>
              <div className="bg-surface-50 rounded-lg p-2.5">
                <p className="text-[10px] text-surface-400 uppercase tracking-wider">Urgency Score</p>
                <p className="text-lg font-bold text-surface-800">{need.urgencyScore}/10</p>
              </div>
            </div>

            {/* Vulnerable groups */}
            {need.vulnerableGroups.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-surface-500 mb-1.5">Vulnerable Groups</p>
                <div className="flex flex-wrap gap-1">
                  {need.vulnerableGroups.map(g => (
                    <span key={g} className="badge bg-red-50 text-red-600 border border-red-200 text-[10px]">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Required supplies */}
            {need.requiredSupplies.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-surface-500 mb-1.5 flex items-center gap-1"><Package className="w-3 h-3" /> Required Supplies</p>
                <div className="flex flex-wrap gap-1">
                  {need.requiredSupplies.map(s => (
                    <span key={s} className="badge bg-blue-50 text-blue-600 border border-blue-200 text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills needed */}
            {need.requiredSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-surface-500 mb-1.5 flex items-center gap-1"><Wrench className="w-3 h-3" /> Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {need.requiredSkills.map(s => (
                    <span key={s} className="badge bg-violet-50 text-violet-600 border border-violet-200 text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Language needs */}
            <div className="mb-3">
              <p className="text-xs text-surface-500 mb-1.5">Language Requirement</p>
              <div className="flex gap-1">
                {need.languageNeed.map(l => <LanguageBadge key={l} language={l} />)}
              </div>
            </div>

            {/* Constraints */}
            {need.constraints.length > 0 && (
              <div className="mb-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs font-medium text-amber-700 mb-1">⚠️ Constraints</p>
                <ul className="text-xs text-amber-600 space-y-0.5">
                  {need.constraints.map((c, i) => <li key={i}>• {c}</li>)}
                </ul>
              </div>
            )}

            {/* Missing info */}
            {need.missingInfo.length > 0 && (
              <div className="mb-4 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-medium text-blue-700 mb-1">ℹ️ Missing Information</p>
                <ul className="text-xs text-blue-600 space-y-0.5">
                  {need.missingInfo.map((m, i) => <li key={i}>• {m}</li>)}
                </ul>
              </div>
            )}

            {/* AI Reasoning */}
            <div className="mb-4 p-2.5 bg-brand-50/50 rounded-lg border border-brand-100">
              <p className="text-xs font-medium text-brand-700 mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> AI Reasoning
              </p>
              <p className="text-xs text-brand-600">{need.reasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-surface-100">
              <button onClick={() => handleApprove(selectedReport)} className="btn-success flex-1">
                <CheckCircle2 className="w-4 h-4" /> Approve & Create Task
              </button>
              <button onClick={() => handleReject(selectedReport)} className="btn-danger flex-1">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>

            <p className="text-[10px] text-surface-400 text-center mt-2 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> AI recommendations require human approval
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
