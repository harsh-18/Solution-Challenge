// ============================================================
// ReliefSetu — Field Worker Report Intake
// Mobile-first form for submitting ground reports
// ============================================================

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { store } from '@/services/store'
import { extractNeedFromReport } from '@/services/gemini'
import { Report, ReportStatus, GeoLocation } from '@/types/models'
import { AIProcessingCard } from '@/components/ui'
import {
  Send, ChevronDown, CheckCircle2, MapPin
} from 'lucide-react'
import clsx from 'clsx'

const PRESET_LOCATIONS: GeoLocation[] = [
  { lat: 26.1542, lng: 85.8918, address: 'Laheriasarai, Darbhanga', area: 'Laheriasarai', city: 'Darbhanga', state: 'Bihar' },
  { lat: 28.6280, lng: 77.2950, address: 'Sector 8, Rohini, Delhi', area: 'Rohini Sector 8', city: 'Delhi', state: 'Delhi' },
  { lat: 19.0760, lng: 72.8777, address: 'Dharavi, Mumbai', area: 'Dharavi', city: 'Mumbai', state: 'Maharashtra' }
]

const SOURCES = ['Direct Observation', 'Local Resident', 'Social Media', 'News/Media']

const SAMPLE_REPORTS = [
  "Sector 8 ke paas 3 elderly logon ko diabetes medicine chahiye by tonight, flood water ki wajah se transport nahi hai, ek person sirf Hindi bolta hai."
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
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  
  const [source, setSource] = useState(SOURCES[0])
  const [showSourcePicker, setShowSourcePicker] = useState(false)
  const [photoUploaded, setPhotoUploaded] = useState(false)

  // AI Processing states
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiStep, setAiStep] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleDetectLocation = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          const address = data.display_name || 'Detected Location';
          const city = data.address?.city || data.address?.town || data.address?.county || 'Unknown City';
          const state = data.address?.state || 'Unknown State';
          const area = data.address?.suburb || data.address?.neighbourhood || 'Unknown Area';

          setSelectedLocation({
            lat: latitude,
            lng: longitude,
            address: address,
            area: area,
            city: city,
            state: state
          });
        } catch (err) {
          setSelectedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location',
            area: 'Unknown',
            city: 'Unknown',
            state: 'Unknown'
          });
        }
        setIsLocating(false)
        setShowLocationPicker(false)
      }, (error) => {
        console.error(error);
        setIsLocating(false);
        alert('Could not fetch location. Please ensure location permissions are granted.');
      });
    } else {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false)
    }
  }

  const canSubmit = rawText.trim().length > 0 && selectedLocation !== null

  const handleSubmit = async () => {
    if (!canSubmit || !user || !selectedLocation) return

    setIsProcessing(true)
    setAiStep(0)

    // Simulate AI processing steps
    for (let i = 0; i < AI_STEPS.length; i++) {
      setAiStep(i)
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300))
    }

    try {
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
    } catch (error: any) {
      console.error('Failed to extract report:', error)
      alert(`AI Extraction Failed: ${error.message || 'Please check your Gemini API key and try again.'}`)
      setIsProcessing(false)
    }
  }

  const handleUseSample = () => {
    setRawText(SAMPLE_REPORTS[0])
    setSelectedLocation(PRESET_LOCATIONS[1])
    textareaRef.current?.focus()
  }

  const handleReset = () => {
    setRawText('')
    setSelectedLocation(null)
    setIsSubmitted(false)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Mobile App Interface */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Field Worker Mobile</p>
              <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight leading-none">Submit ground report</h1>
            </div>
            <span className="px-3 py-1 bg-[#fff1f2] text-[#be123c] rounded-full text-[10px] font-bold border border-[#fecdd3]">
              Hinglish Ready
            </span>
          </div>

          <div className="bg-white border border-surface-200 rounded-[2rem] p-6 shadow-sm max-w-md mx-auto relative overflow-hidden">
            {/* Fake notch/dynamic island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-surface-100 rounded-b-xl border border-surface-200 border-t-0 z-10"></div>
            
            <div className="pt-4">
              {isSubmitted ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 mb-2">Report Processed!</h3>
                  <p className="text-sm text-surface-500 mb-8 px-4">
                    Gemini AI has successfully extracted the core needs from your report and sent structured data to the Coordinator Inbox for approval.
                  </p>
                  
                  <div className="w-full space-y-3">
                    <button
                      onClick={() => navigate('/coordinator/review')}
                      className="w-full py-3.5 bg-[#0f766e] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#115e59] transition-all"
                    >
                      View in Coordinator Inbox
                    </button>
                    <button
                      onClick={handleReset}
                      className="w-full py-3.5 bg-white border border-surface-200 text-surface-700 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-50 transition-all"
                    >
                      Submit Another Report
                    </button>
                  </div>
                </div>
              ) : (
                <>
              <div className="mb-5">
                <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-2 ml-1">Report Text</label>
                <textarea
                  ref={textareaRef}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="Type in Hindi or English..."
                  className="w-full h-32 px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                  disabled={isProcessing}
                />
              </div>

              <div className="mb-5">
                <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-2 ml-1">Location</label>
                <div className="relative">
                  <button
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className={clsx(
                      'w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-left flex items-center justify-between transition-all',
                      selectedLocation ? 'text-surface-900 font-semibold' : 'text-surface-400'
                    )}
                    disabled={isProcessing}
                  >
                    <span className="truncate">{selectedLocation ? selectedLocation.address : 'Select location...'}</span>
                    <ChevronDown className={clsx('w-4 h-4 transition-transform', showLocationPicker && 'rotate-180')} />
                  </button>
                  {showLocationPicker && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-surface-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                      <button
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-brand-50 transition-colors border-b border-surface-200 text-brand-600 font-bold flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        {isLocating ? 'Detecting...' : 'Detect My Location'}
                      </button>
                      {PRESET_LOCATIONS.map((loc, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedLocation(loc); setShowLocationPicker(false) }}
                          className={clsx(
                            'w-full text-left px-4 py-3 text-sm hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-0',
                            selectedLocation?.address === loc.address && 'bg-brand-50 text-brand-700 font-bold'
                          )}
                        >
                          {loc.area}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-2 ml-1">Source</label>
                  <button
                    onClick={() => setShowSourcePicker(!showSourcePicker)}
                    className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-semibold text-surface-700 flex items-center justify-between transition-all hover:bg-surface-100"
                    disabled={isProcessing}
                  >
                    <span className="truncate">{source}</span>
                    <ChevronDown className={clsx('w-3 h-3 transition-transform text-surface-400', showSourcePicker && 'rotate-180')} />
                  </button>
                  {showSourcePicker && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden z-20">
                      {SOURCES.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSource(s); setShowSourcePicker(false) }}
                          className={clsx(
                            'w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-0',
                            source === s && 'bg-brand-50 text-brand-700 font-bold'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-2 ml-1">Photo (Optional)</label>
                  <button 
                    onClick={() => {
                      setPhotoUploaded(true);
                      setTimeout(() => setPhotoUploaded(false), 2000);
                    }}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-xl text-sm font-semibold text-center transition-colors",
                      photoUploaded 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                        : "bg-surface-50 border-surface-200 text-brand-600 hover:bg-brand-50"
                    )}
                    disabled={isProcessing}
                  >
                    {photoUploaded ? <span className="flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4"/> Attached</span> : '+ Upload'}
                  </button>
                </div>
              </div>

              {isProcessing ? (
                <div className="mb-4">
                  <AIProcessingCard step={aiStep} steps={AI_STEPS} />
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full py-3.5 bg-[#0f766e] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#115e59] transition-all shadow-sm disabled:opacity-50"
                  >
                    Run Gemini extraction <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleUseSample}
                    className="w-full py-3.5 bg-white border border-surface-200 text-surface-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-surface-50 transition-all shadow-sm"
                  >
                    Load flood sample
                  </button>
                </div>
              )}
              </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Product Contract */}
        <div>
          <div className="mb-8">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-0.5">Live Product Contract</p>
            <h2 className="text-xl font-extrabold text-surface-900 tracking-tight leading-none">Messy report to approved task</h2>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-200 before:to-transparent">
            
            <div className="relative flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-surface-100 border-4 border-white flex items-center justify-center text-sm font-extrabold text-surface-600 shrink-0 shadow-sm">1</div>
              <div className="pt-2">
                <h3 className="text-sm font-extrabold text-surface-900 mb-1">Report arrives from field</h3>
                <p className="text-xs font-semibold text-surface-500 leading-relaxed">Worker types in Hinglish or regional language via app/WhatsApp.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-brand-100 border-4 border-white flex items-center justify-center text-sm font-extrabold text-brand-700 shrink-0 shadow-sm">2</div>
              <div className="pt-2">
                <h3 className="text-sm font-extrabold text-surface-900 mb-1">Gemini extracts structured data</h3>
                <p className="text-xs font-semibold text-surface-500 leading-relaxed">AI determines category, urgency score (0-10), and spots vulnerabilities.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-surface-100 border-4 border-white flex items-center justify-center text-sm font-extrabold text-surface-600 shrink-0 shadow-sm">3</div>
              <div className="pt-2">
                <h3 className="text-sm font-extrabold text-surface-900 mb-1">Vector search (planned)</h3>
                <p className="text-xs font-semibold text-surface-500 leading-relaxed">Finds similar recent reports to prevent duplicate deployment.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-surface-100 border-4 border-white flex items-center justify-center text-sm font-extrabold text-surface-600 shrink-0 shadow-sm">4</div>
              <div className="pt-2">
                <h3 className="text-sm font-extrabold text-surface-900 mb-1">Coordinator inbox</h3>
                <p className="text-xs font-semibold text-surface-500 leading-relaxed">Human-in-the-loop approves the extracted AI need.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-surface-100 border-4 border-white flex items-center justify-center text-sm font-extrabold text-surface-600 shrink-0 shadow-sm">5</div>
              <div className="pt-2">
                <h3 className="text-sm font-extrabold text-surface-900 mb-1">Task creation</h3>
                <p className="text-xs font-semibold text-surface-500 leading-relaxed">A standardized task is created, ready for volunteer matching.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
