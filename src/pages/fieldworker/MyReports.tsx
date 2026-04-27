// ============================================================
// ReliefSetu — Field Worker: My Reports
// ============================================================

import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { useAuth } from '@/contexts/AuthContext'
import { UrgencyBadge, StatusChip, TimeAgo, EmptyState } from '@/components/ui'
import { FileText, MapPin, ArrowRight, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MyReports() {
  const dataStore = useStore()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const reports = store.getReports()

  if (reports.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-surface-900 mb-4">My Reports</h1>
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No reports yet"
          description="You haven't submitted any field reports yet."
          action={<button onClick={() => navigate('/field/report')} className="btn-primary"><Send className="w-4 h-4" /> Submit Report</button>}
        />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900">My Reports</h1>
          <p className="text-sm text-surface-500">{reports.length} reports submitted</p>
        </div>
        <button onClick={() => navigate('/field/report')} className="btn-primary btn-sm">
          <Send className="w-3.5 h-3.5" /> New
        </button>
      </div>

      <div className="space-y-3">
        {reports.map((report, i) => (
          <div key={report.id} className="card p-4 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <StatusChip status={report.status} />
              {report.extractedNeed && <UrgencyBadge urgency={report.extractedNeed.urgency} size="sm" />}
            </div>
            {report.extractedNeed ? (
              <h3 className="text-sm font-semibold text-surface-800 mb-1">{report.extractedNeed.category}</h3>
            ) : (
              <h3 className="text-sm font-semibold text-surface-800 mb-1">Processing...</h3>
            )}
            <p className="text-xs text-surface-500 line-clamp-2 mb-2">{report.rawText}</p>
            <div className="flex items-center justify-between text-xs text-surface-400">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {report.location.area}, {report.location.city}</span>
              <TimeAgo timestamp={report.timestamp} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
