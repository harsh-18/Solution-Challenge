// ============================================================
// ReliefSetu — Extraction Review
// Inbox list of reports and AI extraction details
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { Report, ReportStatus, TaskStatus, Urgency, Task } from '@/types/models'
import { CheckCircle2, Zap } from 'lucide-react'
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
      <div className="w-full">
        <h1 className="text-2xl font-extrabold text-surface-900 mb-4">AI Review</h1>
        <div className="bg-white border border-surface-200 rounded-xl p-8 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-surface-900 mb-2">Inbox Zero</h2>
          <p className="text-sm text-surface-500">No pending reports to review.</p>
        </div>
      </div>
    )
  }

  const need = selectedReport?.extractedNeed
  const duplicates = store.getDuplicateClusters().filter(dc => dc.reportIds.includes(selectedReport?.id || ''))

  return (
    <div className="w-full">
      {/* Alert Banner */}
      <div className="bg-[#ebfbf6] border border-[#bbf0df] rounded-lg p-3 mb-6 flex items-center">
        <p className="text-xs font-bold text-[#0f766e]">
          Vertex AI Gemini extracted the need and routed it to coordinator review.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inbox List */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Coordinator Inbox</p>
            <h2 className="text-lg font-extrabold text-surface-900">AI extraction review</h2>
          </div>

          <div className="space-y-3 max-h-[40vh] lg:max-h-none overflow-y-auto pr-1">
            {pendingReports.map((report, idx) => {
              const isSelected = selectedIdx === idx;
              const isCritical = report.extractedNeed?.urgency === Urgency.CRITICAL;
              
              return (
                <div 
                  key={report.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={clsx(
                    "border rounded-xl p-4 cursor-pointer transition-all shadow-sm",
                    isSelected 
                      ? "bg-white border-brand-300 ring-1 ring-brand-300" 
                      : "bg-white border-surface-200 hover:border-brand-200 hover:bg-surface-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      isCritical ? "bg-[#fef2f2] text-[#dc2626]" : "bg-blue-50 text-blue-600"
                    )}>
                      {isCritical ? 'Critical' : 'Medium'}
                    </span>
                    <span className="text-[10px] font-bold text-surface-400">
                      Score: {report.extractedNeed?.urgencyScore}/10
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-surface-900 mb-1">{report.extractedNeed?.category}</h3>
                  <p className="text-xs text-surface-500 line-clamp-2">{report.rawText}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: AI Output Details */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Vertex AI Gemini Output</p>
            <h2 className="text-lg font-extrabold text-surface-900">Extraction details</h2>
          </div>

          {selectedReport && need && (
            <div className="bg-white border border-surface-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
              {/* Fake top badge */}
              <div className="absolute top-0 right-0 bg-[#ebfbf6] text-[#0f766e] px-3 py-1 rounded-bl-lg text-[10px] font-bold border-b border-l border-[#bbf0df]">
                Gemini Pro 1.5
              </div>

              {/* Title & Stats */}
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-surface-900 mb-3">{need.category}</h3>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 bg-[#fef2f2] text-[#dc2626] rounded-lg border border-[#fecdd3] flex items-center gap-2">
                    <span className="text-xs font-bold">Urgency Score</span>
                    <span className="text-sm font-black">{need.urgencyScore}/10</span>
                  </div>
                  <div className="px-3 py-1.5 bg-[#f0f9ff] text-[#0369a1] rounded-lg border border-[#bae6fd] flex items-center gap-2">
                    <span className="text-xs font-bold">Confidence</span>
                    <span className="text-sm font-black">{Math.round(need.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Duplicate Warning */}
              {duplicates.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 mb-1">Vector Search: Potential Duplicate Detected</h4>
                    <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                      This report has a {Math.round(duplicates[0].similarity * 100)}% semantic match with an existing task in {need.location.area}.
                      Please verify before deploying additional resources.
                    </p>
                  </div>
                </div>
              )}

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">Affected</label>
                  <p className="text-sm font-bold text-surface-900">{need.affectedCount} people</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">Location</label>
                  <p className="text-sm font-bold text-surface-900">{need.location.area}, {need.location.city}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">Requirements</label>
                  <div className="flex flex-wrap gap-2">
                    {need.requiredSupplies.map(s => (
                      <span key={s} className="max-w-full truncate px-2 py-1 bg-surface-100 text-surface-700 rounded-md text-[11px] font-bold border border-surface-200">{s}</span>
                    ))}
                    {need.requiredSkills.map(s => (
                      <span key={s} className="max-w-full truncate px-2 py-1 bg-surface-100 text-surface-700 rounded-md text-[11px] font-bold border border-surface-200">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Raw Report */}
              <div className="mb-8">
                <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">Raw Input</label>
                <div className="p-3 bg-[#fafafa] border border-surface-200 rounded-lg text-sm text-surface-600 font-medium italic">
                  "{selectedReport.rawText}"
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => handleApprove(selectedReport)} className="flex-1 py-3 bg-[#0f766e] text-white rounded-xl text-sm font-bold hover:bg-[#115e59] transition-all shadow-sm">
                  Approve Extraction
                </button>
                <button onClick={() => handleReject(selectedReport)} className="flex-1 py-3 bg-white border border-surface-200 text-surface-700 rounded-xl text-sm font-bold hover:bg-surface-50 transition-all shadow-sm">
                  Reject / Duplicate
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}
