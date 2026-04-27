// ============================================================
// ReliefSetu — Map View
// Custom SVG-based India map with task/volunteer markers
// ============================================================

import { useState } from 'react'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { Urgency, TaskStatus } from '@/types/models'
import { UrgencyBadge, StatusChip } from '@/components/ui'
import { MapPin, Users, X, Layers, Filter, Activity } from 'lucide-react'
import clsx from 'clsx'

// Simple projected coordinates for Indian cities (scaled to viewport)
const CITY_COORDS: Record<string, { x: number, y: number }> = {
  'Darbhanga': { x: 670, y: 240 },
  'Patna': { x: 640, y: 260 },
  'Delhi': { x: 460, y: 200 },
  'Guwahati': { x: 750, y: 240 },
  'Silchar': { x: 770, y: 280 },
  'Mumbai': { x: 380, y: 420 },
  'Lucknow': { x: 530, y: 250 },
  'Kolkata': { x: 680, y: 340 },
  'Chennai': { x: 530, y: 540 },
  'Jaipur': { x: 420, y: 250 },
  'Bhopal': { x: 470, y: 320 },
}

const URGENCY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#10b981',
}

export default function MapView() {
  const tasks = store.getTasks()
  const volunteers = store.getVolunteers()
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [showVolunteers, setShowVolunteers] = useState(true)
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')

  const filteredTasks = urgencyFilter === 'all' ? tasks : tasks.filter(t => t.extractedNeed.urgency === urgencyFilter)
  const selected = selectedTask ? store.getTask(selectedTask) : null

  return (
    <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-40px)] flex flex-col">
      {/* Map Controls */}
      <div className="px-4 py-3 bg-white border-b border-surface-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-surface-900">Map View</h2>
          <span className="badge bg-surface-100 text-surface-500 text-[10px]">{filteredTasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowVolunteers(!showVolunteers)} className={clsx('btn-ghost btn-sm', showVolunteers && 'bg-violet-50 text-violet-700')}>
            <Users className="w-3.5 h-3.5" /> Volunteers
          </button>
          <div className="flex gap-1">
            <button onClick={() => setUrgencyFilter('all')} className={clsx('badge text-[10px] cursor-pointer', urgencyFilter === 'all' ? 'bg-surface-800 text-white' : 'bg-surface-100 text-surface-500')}>All</button>
            {Object.values(Urgency).map(u => (
              <button key={u} onClick={() => setUrgencyFilter(u === urgencyFilter ? 'all' : u)} className="cursor-pointer">
                <UrgencyBadge urgency={u} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50/30 to-emerald-50">
        {/* SVG Map */}
        <svg viewBox="200 100 700 550" className="w-full h-full" style={{ minHeight: 400 }}>
          {/* India outline (simplified) */}
          <path
            d="M380,130 L450,128 L480,135 L520,140 L560,138 L600,150 L650,155 L700,160 L740,165 L770,185 L790,210 L800,250 L790,280 L780,310 L760,340 L740,350 L720,370 L700,350 L680,355 L670,380 L660,400 L640,410 L620,400 L600,420 L580,440 L560,460 L540,490 L530,520 L520,550 L510,580 L500,600 L490,610 L480,600 L485,580 L490,550 L480,520 L470,500 L460,480 L440,460 L420,450 L400,440 L380,430 L360,445 L350,460 L340,480 L330,500 L320,520 L310,540 L310,560 L300,540 L305,510 L310,480 L340,430 L350,400 L360,370 L350,340 L340,310 L330,280 L340,250 L350,220 L360,190 L370,160 Z"
            fill="none"
            stroke="#d6d3d1"
            strokeWidth="2"
            opacity="0.6"
          />
          
          {/* Subtle grid */}
          {[200, 300, 400, 500, 600, 700, 800].map(x => (
            <line key={`gx${x}`} x1={x} y1={100} x2={x} y2={650} stroke="#e7e5e4" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}
          {[150, 250, 350, 450, 550, 650].map(y => (
            <line key={`gy${y}`} x1={200} y1={y} x2={900} y2={y} stroke="#e7e5e4" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}

          {/* Task markers */}
          {filteredTasks.map(task => {
            const city = task.extractedNeed.location.city
            const coords = CITY_COORDS[city]
            if (!coords) return null
            const color = URGENCY_COLORS[task.extractedNeed.urgency] || '#78716c'
            const isSelected = selectedTask === task.id

            return (
              <g key={task.id} onClick={() => setSelectedTask(isSelected ? null : task.id)} className="cursor-pointer">
                {/* Pulse animation for critical */}
                {task.extractedNeed.urgency === Urgency.CRITICAL && (
                  <circle cx={coords.x} cy={coords.y} r="16" fill={color} opacity="0.2">
                    <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                
                {/* Marker */}
                <circle cx={coords.x} cy={coords.y} r={isSelected ? 10 : 7} fill={color} stroke="white" strokeWidth="2.5"
                  className="transition-all duration-200" opacity="0.9" />
                
                {/* Label */}
                <text x={coords.x} y={coords.y - 14} textAnchor="middle" fontSize="9" fill="#44403c" fontWeight="600" fontFamily="Inter, sans-serif">
                  {city}
                </text>

                {/* Count badge */}
                {task.extractedNeed.affectedCount > 1 && (
                  <>
                    <circle cx={coords.x + 10} cy={coords.y - 8} r="7" fill="#1c1917" />
                    <text x={coords.x + 10} y={coords.y - 5} textAnchor="middle" fontSize="7" fill="white" fontWeight="700" fontFamily="Inter, sans-serif">
                      {task.extractedNeed.affectedCount}
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {/* Volunteer markers */}
          {showVolunteers && volunteers.filter(v => v.isActive).map(vol => {
            const coords = CITY_COORDS[vol.location.city]
            if (!coords) return null
            return (
              <g key={vol.id}>
                <rect x={coords.x - 5 + 15} y={coords.y - 5 + 8} width="10" height="10" rx="2" fill="#7c3aed" stroke="white" strokeWidth="1.5" opacity="0.8" />
                <text x={coords.x + 20 + 3} y={coords.y + 8 + 6} fontSize="7" fill="#7c3aed" fontWeight="500" fontFamily="Inter, sans-serif">
                  {vol.name.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Task Detail Panel */}
        {selected && (
          <div className="absolute top-4 right-4 w-80 card p-4 shadow-xl animate-slide-in-right z-10">
            <div className="flex items-center justify-between mb-3">
              <UrgencyBadge urgency={selected.extractedNeed.urgency} />
              <button onClick={() => setSelectedTask(null)} className="btn-ghost btn-sm p-1"><X className="w-4 h-4" /></button>
            </div>
            <h3 className="text-sm font-bold text-surface-800 mb-1">{selected.extractedNeed.category}</h3>
            <p className="text-xs text-surface-500 mb-3">{selected.extractedNeed.summary}</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-surface-400">Location</span><span className="font-medium">{selected.extractedNeed.location.area}, {selected.extractedNeed.location.city}</span></div>
              <div className="flex justify-between"><span className="text-surface-400">Affected</span><span className="font-medium">{selected.extractedNeed.affectedCount} people</span></div>
              <div className="flex justify-between"><span className="text-surface-400">Status</span><StatusChip status={selected.status} /></div>
              {selected.assignedVolunteerName && (
                <div className="flex justify-between"><span className="text-surface-400">Volunteer</span><span className="font-medium text-violet-600">{selected.assignedVolunteerName}</span></div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 card p-3 text-xs">
          <p className="font-semibold text-surface-600 mb-2">Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span> Critical</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> High</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Medium</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Low</div>
            {showVolunteers && <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-violet-600"></span> Volunteer</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
