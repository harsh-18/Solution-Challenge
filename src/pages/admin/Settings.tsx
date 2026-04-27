// ============================================================
// ReliefSetu — Admin Settings
// Volunteer management + audit log viewer
// ============================================================

import { useState } from 'react'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { SectionHeader, TimeAgo, EmptyState } from '@/components/ui'
import {
  Settings, Users, ClipboardList, MapPin, Wrench, Globe,
  Truck, Star, Activity, Zap, CheckCircle2, XCircle,
  ChevronDown, Search, Shield
} from 'lucide-react'
import clsx from 'clsx'

export default function AdminSettings() {
  const dataStore = useStore()
  const [tab, setTab] = useState<'volunteers' | 'audit'>('volunteers')
  const [search, setSearch] = useState('')

  const volunteers = store.getVolunteers()
  const auditLogs = store.getAuditLogs()

  const filteredVolunteers = search
    ? volunteers.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
    : volunteers

  const filteredLogs = search
    ? auditLogs.filter(l => l.details.toLowerCase().includes(search.toLowerCase()) || l.userName.toLowerCase().includes(search.toLowerCase()))
    : auditLogs

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <SectionHeader title="Settings & Management" subtitle="Manage volunteers, view system logs" />

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-100 rounded-xl p-1 max-w-xs">
        <button onClick={() => setTab('volunteers')} className={clsx('flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5', tab === 'volunteers' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500')}>
          <Users className="w-4 h-4" /> Volunteers
        </button>
        <button onClick={() => setTab('audit')} className={clsx('flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5', tab === 'audit' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500')}>
          <ClipboardList className="w-4 h-4" /> Audit Log
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === 'volunteers' ? 'Search by name or skill...' : 'Search logs...'}
          className="input pl-9"
        />
      </div>

      {tab === 'volunteers' ? (
        /* ---- VOLUNTEERS TABLE ---- */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Volunteer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden sm:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden md:table-cell">Skills</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden lg:table-cell">Languages</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Load</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden sm:table-cell">Reliability</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden md:table-cell">Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredVolunteers.map((vol, i) => (
                  <tr key={vol.id} className="hover:bg-surface-50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-surface-800">{vol.name}</p>
                        <p className="text-xs text-surface-400 flex items-center gap-1"><Truck className="w-3 h-3" />{vol.transportMode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-surface-600 flex items-center gap-1"><MapPin className="w-3 h-3" />{vol.location.city}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {vol.skills.slice(0, 3).map(s => (
                          <span key={s} className="badge bg-surface-100 text-surface-600 text-[10px]">{s}</span>
                        ))}
                        {vol.skills.length > 3 && <span className="badge bg-surface-100 text-surface-400 text-[10px]">+{vol.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {vol.languages.map(l => (
                          <span key={l} className="badge bg-violet-50 text-violet-600 text-[10px]">{l}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={clsx(
                        'badge text-[10px]',
                        vol.availability === 'available' ? 'bg-emerald-50 text-emerald-600' :
                        vol.availability === 'busy' ? 'bg-amber-50 text-amber-600' :
                        'bg-surface-100 text-surface-500'
                      )}>
                        {vol.availability}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-medium">{vol.currentLoad}/{vol.maxWorkload}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-semibold">{vol.reliabilityScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-medium hidden md:table-cell">{vol.completedTasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ---- AUDIT LOG ---- */
        <div className="card divide-y divide-surface-100 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <EmptyState icon={<ClipboardList className="w-8 h-8" />} title="No logs found" description="No audit logs match your search." />
          ) : (
            filteredLogs.slice(0, 20).map((log, i) => (
              <div key={log.id} className="p-3 hover:bg-surface-50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    log.aiGenerated ? 'bg-brand-50 text-brand-600' : 'bg-surface-100 text-surface-500'
                  )}>
                    {log.aiGenerated ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-surface-800">{log.userName}</span>
                      {log.aiGenerated && <span className="badge bg-brand-50 text-brand-600 text-[10px]">AI</span>}
                      <span className="badge bg-surface-100 text-surface-500 text-[10px]">{log.action.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-xs text-surface-500">{log.details}</p>
                    <TimeAgo timestamp={log.timestamp} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
