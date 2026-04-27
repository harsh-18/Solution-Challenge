// ============================================================
// ReliefSetu — Field Worker Report Intake
// Mobile-first form for submitting ground reports
// ============================================================

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { store } from '@/services/store'
import { extractNeedFromReport } from '@/services/mockAi'
import { Report, ReportStatus, Urgency, GeoLocation } from '@/types/models'
import { UrgencyBadge, AIProcessingCard } from '@/components/ui'
import {
  Send, MapPin, Camera, AlertTriangle, CheckCircle2, FileText,
  ChevronDown, Mic, Globe, ArrowLeft
} from 'lucide-react'
import clsx from 'clsx'

const PRESET_LOCATIONS: GeoLocation[] = [
  { lat: 26.1542, lng: 85.8918, address: 'Laheriasarai, Darbhanga', area: 'Laheriasarai', city: 'Darbhanga', state: 'Bihar' },
  { lat: 28.6280, lng: 77.2950, address: 'Sector 8, Rohini, Delhi', area: 'Rohini Sector 8', city: 'Delhi', state: 'Delhi' },
  { lat: 26.1445, lng: 91.7362, address: 'Panbazar, Guwahati', area: 'Panbazar', city: 'Guwahati', state: 'Assam' },
  { lat: 28.5245, lng: 77.2066, address: 'Saket, New Delhi', area: 'Saket', city: 'Delhi', state: 'Delhi' },
  { lat: 19.0760, lng: 72.8777, address: 'Dharavi, Mumbai', area: 'Dharavi', city: 'Mumbai', state: 'Maharashtra' },
  { lat: 26.8467, lng: 80.9462, address: 'Aminabad, Lucknow', area: 'Aminabad', city: 'Lucknow', state: 'Uttar Pradesh' },
  { lat: 24.8333, lng: 92.7789, address: 'Tarapur, Silchar', area: 'Tarapur', city: 'Silchar', state: 'Assam' },
  { lat: 25.6117, lng: 85.1439, address: 'Rajendra Nagar, Patna', area: 'Rajendra Nagar', city: 'Patna', state: 'Bihar' },
]

const SAMPLE_REPORTS = [
  "Sector 8 ke paas 3 elderly logon ko diabetes medicine chahiye by tonight, flood water ki wajah se transport nahi hai, ek person sirf Hindi bolta hai.",
  "Darbhanga mein baadh se 15 parivaar phaṁse hain. Bachche aur pregnant women hain. ORS aur peene ka paani chahiye urgently.",
  "Dharavi mein ek wheelchair user hai jinko hospital jaana hai, dialysis appointment hai aaj 2 bje.",
  "Panbazar relief camp mein 200 log hain. Khana packets khatam. Sanitary napkins aur diapers chahiye.",
]

const AI_STEPS = [
  'Analyzing language (Hindi/English/Hinglish)...',
  'Extracting need category and urgency...',
  'Identifying vulnerable groups...',
  'Detecting required supplies and skills...',
  'Computing urgency score...',
  'Generating structured report...',
]

export default function ReportIntake() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [rawText, setRawText] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null)
  const [urgencyHint, setUrgencyHint] = useState<Urgency | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // AI Processing states
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiStep, setAiStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null)

  const canSubmit = rawText.trim().length > 10 && selectedLocation

  const handleSubmit = async () => {
    if (!canSubmit || !user || !selectedLocation) return

    setIsProcessing(true)
    setAiStep(0)

    // Simulate AI processing steps
    for (let i = 0; i < AI_STEPS.length; i++) {
      setAiStep(i)
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300))
    }

    // Run AI extraction
    const extractedNeed = await extractNeedFromReport(rawText, selectedLocation)

    const reportId = `r_${Date.now()}`
    const newReport: Report = {
      id: reportId,
      rawText,
      location: selectedLocation,
      submittedBy: user.id,
      submittedByName: user.name,
      timestamp: new Date().toISOString(),
      status: ReportStatus.EXTRACTED,
      urgencyHint: urgencyHint || undefined,
      language: 'hinglish',
      extractedNeed,
    }

    store.addReport(newReport)
    store.addAuditLog({
      id: `al_${Date.now()}`,
      action: 'report_submitted',
      userId: user.id,
      userName: user.name,
      entityType: 'report',
      entityId: reportId,
      timestamp: new Date().toISOString(),
      details: `Field report submitted: ${extractedNeed.category}`,
      aiGenerated: false,
    })

    setAiStep(AI_STEPS.length)
    setIsProcessing(false)
    setIsSubmitted(true)
    setSubmittedReportId(reportId)
  }

  const handleUseSample = (sample: string) => {
    setRawText(sample)
    textareaRef.current?.focus()
  }

  const handleNewReport = () => {
    setRawText('')
    setSelectedLocation(null)
    setUrgencyHint(null)
    setIsSubmitted(false)
    setSubmittedReportId(null)
    setIsProcessing(false)
    setAiStep(0)
  }

  // Success state
  if (isSubmitted && submittedReportId) {
    const report = store.getReport(submittedReportId)
    const need = report?.extractedNeed
    return (
      <div className="p-4 sm:p-6 max-w-xl mx-auto">
        <div className="text-center mb-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-1">Report Submitted Successfully</h2>
          <p className="text-sm text-surface-500">Gemini AI has extracted the following need</p>
        </div>

        {need && (
          <div className="card p-5 mb-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-surface-700">{need.category}</span>
              <UrgencyBadge urgency={need.urgency} />
            </div>
            <p className="text-sm text-surface-600 mb-3">{need.summary}</p>
            {need.summaryHindi && (
              <p className="text-sm text-surface-500 italic mb-3 border-l-2 border-brand-200 pl-3">{need.summaryHindi}</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-surface-400">Affected</span>
                <p className="font-semibold text-surface-700">{need.affectedCount} people</p>
              </div>
              <div>
                <span className="text-surface-400">Urgency Score</span>
                <p className="font-semibold text-surface-700">{need.urgencyScore}/10</p>
              </div>
              <div>
                <span className="text-surface-400">Confidence</span>
                <p className="font-semibold text-surface-700">{Math.round(need.confidence * 100)}%</p>
              </div>
              <div>
                <span className="text-surface-400">Location</span>
                <p className="font-semibold text-surface-700">{need.location.area}</p>
              </div>
            </div>
            {need.vulnerableGroups.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {need.vulnerableGroups.map(g => (
                  <span key={g} className="badge bg-red-50 text-red-600 border border-red-200">{g}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center text-xs text-surface-400 mb-4">
          The coordinator will review this report and create an actionable task.
        </div>

        <div className="flex gap-3">
          <button onClick={handleNewReport} className="btn-primary flex-1">
            <Send className="w-4 h-4" /> Submit Another
          </button>
          <button onClick={() => navigate('/field/my-reports')} className="btn-secondary flex-1">
            <FileText className="w-4 h-4" /> My Reports
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-surface-900">Submit Ground Report</h1>
        <p className="text-sm text-surface-500 mt-1">Describe the need in Hindi, English, or Hinglish. Gemini AI will extract structured data.</p>
      </div>

      {/* Sample quick-fill */}
      {!rawText && (
        <div className="mb-4 animate-fade-in">
          <p className="text-xs text-surface-400 font-medium mb-2">📋 Try a sample report:</p>
          <div className="flex flex-col gap-2">
            {SAMPLE_REPORTS.map((sample, i) => (
              <button
                key={i}
                onClick={() => handleUseSample(sample)}
                className="text-left text-xs p-3 rounded-lg bg-brand-50/50 border border-brand-100 hover:bg-brand-50 text-surface-600 transition-colors line-clamp-2"
              >
                "{sample.slice(0, 90)}..."
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Text */}
      <div className="mb-4">
        <label className="label flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          Field Report
          <span className="badge bg-blue-50 text-blue-600 text-[10px] ml-1">Hindi/English/Hinglish</span>
        </label>
        <textarea
          ref={textareaRef}
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder="क्या मदद चाहिए? कहाँ? कितने लोग? कोई खास ज़रूरत?&#10;&#10;Example: Sector 8 ke paas 3 elderly logon ko diabetes medicine chahiye by tonight..."
          className="textarea h-32 sm:h-40"
          disabled={isProcessing}
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className={clsx('text-xs', rawText.length > 10 ? 'text-surface-400' : 'text-amber-500')}>
            {rawText.length > 10 ? `${rawText.length} characters` : 'Minimum 10 characters'}
          </span>
          <div className="flex gap-1.5">
            <button className="btn-ghost btn-sm" title="Voice input (coming soon)" disabled>
              <Mic className="w-3.5 h-3.5" /> Voice
            </button>
          </div>
        </div>
      </div>

      {/* Location Picker */}
      <div className="mb-4">
        <label className="label flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          Location
        </label>
        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className={clsx(
            'input text-left flex items-center justify-between',
            selectedLocation ? 'text-surface-900' : 'text-surface-400'
          )}
          disabled={isProcessing}
        >
          <span className="truncate">{selectedLocation ? selectedLocation.address : 'Select location...'}</span>
          <ChevronDown className={clsx('w-4 h-4 transition-transform', showLocationPicker && 'rotate-180')} />
        </button>
        {showLocationPicker && (
          <div className="mt-1 bg-white border border-surface-200 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-slide-up">
            {PRESET_LOCATIONS.map((loc, i) => (
              <button
                key={i}
                onClick={() => { setSelectedLocation(loc); setShowLocationPicker(false) }}
                className={clsx(
                  'w-full text-left px-3 py-2.5 text-sm hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-0',
                  selectedLocation?.address === loc.address && 'bg-brand-50 text-brand-700'
                )}
              >
                <span className="font-medium">{loc.area}</span>
                <span className="text-xs text-surface-400 ml-1">• {loc.city}, {loc.state}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Urgency Hint */}
      <div className="mb-4">
        <label className="label flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Urgency Hint <span className="text-surface-400 font-normal">(optional)</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {Object.values(Urgency).map(u => (
            <button
              key={u}
              onClick={() => setUrgencyHint(urgencyHint === u ? null : u)}
              className={clsx('transition-all', urgencyHint === u ? 'scale-105 ring-2 ring-offset-1 ring-surface-300 rounded-full' : 'opacity-70 hover:opacity-100')}
              disabled={isProcessing}
            >
              <UrgencyBadge urgency={u} />
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload (placeholder) */}
      <div className="mb-6">
        <label className="label flex items-center gap-1">
          <Camera className="w-3.5 h-3.5" />
          Photo <span className="text-surface-400 font-normal">(optional)</span>
        </label>
        <button className="w-full border-2 border-dashed border-surface-200 rounded-xl p-6 text-center hover:border-brand-300 hover:bg-brand-50/20 transition-colors" disabled={isProcessing}>
          <Camera className="w-6 h-6 text-surface-300 mx-auto mb-2" />
          <p className="text-xs text-surface-400">Tap to add field photo</p>
        </button>
      </div>

      {/* AI Processing */}
      {isProcessing && (
        <div className="mb-4">
          <AIProcessingCard step={aiStep} steps={AI_STEPS} />
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isProcessing}
        className="btn-primary w-full btn-lg"
      >
        {isProcessing ? (
          <>Processing with Gemini AI...</>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Report
          </>
        )}
      </button>

      <p className="text-[10px] text-surface-400 text-center mt-3">
        ⚠️ AI recommendations will be reviewed by a coordinator before action.
      </p>
    </div>
  )
}
