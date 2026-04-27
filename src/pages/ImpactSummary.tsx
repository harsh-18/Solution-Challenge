// ============================================================
// ReliefSetu — Impact Summary
// Gemini-generated narrative + metrics
// ============================================================

import { useState } from 'react'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { MetricCard, SectionHeader } from '@/components/ui'
import {
  BarChart3, Users, CheckCircle2, AlertTriangle, Clock, Globe,
  TrendingUp, FileText, Copy, Zap, Heart, MapPin, ArrowRight, Brain
} from 'lucide-react'
import clsx from 'clsx'

export default function ImpactSummary() {
  const dataStore = useStore()
  const impact = store.getImpactSummary()
  const [language, setLanguage] = useState<'en' | 'hi'>('en')

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-surface-900">Impact Summary</h1>
          <p className="text-sm text-surface-500">AI-generated daily operations report — {impact.date}</p>
        </div>
        <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="btn-ghost btn-sm border border-surface-200">
          <Globe className="w-3.5 h-3.5" /> {language === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Reports Received" value={impact.totalReports} icon={<FileText className="w-5 h-5" />} color="blue" />
        <MetricCard label="Tasks Completed" value={impact.tasksCompleted} icon={<CheckCircle2 className="w-5 h-5" />} color="emerald" />
        <MetricCard label="People Helped" value={impact.peopleHelped} icon={<Heart className="w-5 h-5" />} color="red" />
        <MetricCard label="Volunteers Active" value={impact.volunteersDeployed} icon={<Users className="w-5 h-5" />} color="violet" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Duplicates Detected" value={impact.duplicatesMerged} icon={<Copy className="w-5 h-5" />} color="amber" />
        <MetricCard label="Critical Resolved" value={impact.criticalResolved} icon={<AlertTriangle className="w-5 h-5" />} color="emerald" />
        <MetricCard label="Unresolved Critical" value={impact.unresolvedCritical} icon={<AlertTriangle className="w-5 h-5" />} color="red" />
        <MetricCard label="Avg Response Time" value={impact.avgResponseTime} icon={<Clock className="w-5 h-5" />} color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* AI Narrative - 2/3 */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-teal-400 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-700">Gemini AI Daily Summary</h3>
                <p className="text-[10px] text-surface-400">Auto-generated from today's operations data</p>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-surface-700 leading-relaxed whitespace-pre-line">
                {language === 'en' ? impact.narrative : impact.narrativeHindi}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card p-5 mt-4">
            <SectionHeader title="🎯 AI Recommendations" subtitle="Next priority actions" />
            <div className="space-y-2">
              {impact.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-brand-50/30 rounded-lg border border-brand-100 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                  <p className="text-sm text-surface-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          {/* Top Categories */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">Top Categories</h3>
            <div className="space-y-2.5">
              {impact.topCategories.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-surface-600">{cat.category}</span>
                    <span className="font-semibold text-surface-800">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-teal-400 transition-all duration-700"
                      style={{ width: `${(cat.count / Math.max(...impact.topCategories.map(c => c.count))) * 100}%`, animationDelay: `${i * 100}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Areas */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">Top Areas</h3>
            <div className="space-y-2.5">
              {impact.topAreas.map((area, i) => (
                <div key={area.area} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-surface-600">
                    <MapPin className="w-3.5 h-3.5" /> {area.area}
                  </span>
                  <span className="badge bg-surface-100 text-surface-700">{area.count} reports</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
            <p className="font-medium mb-1">⚠️ Disclaimer</p>
            <p>This summary is AI-generated and should be reviewed by coordinators. Do not rely solely on AI for medical, legal, or rescue decisions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
