// ============================================================
// ReliefSetu — Map View
// Real Google Maps integration with @react-google-maps/api
// ============================================================

import { useState, useCallback, useMemo } from 'react'
import { store } from '@/services/store'
import { Urgency } from '@/types/models'
import { UrgencyBadge, StatusChip } from '@/components/ui'
import { Users, X } from 'lucide-react'
import clsx from 'clsx'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api'

// We map city names to coordinates. In a real app, the models would store LatLng.
const CITY_COORDS: Record<string, { lat: number, lng: number }> = {
  'Darbhanga': { lat: 26.1542, lng: 85.8918 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Guwahati': { lat: 26.1445, lng: 91.7362 },
  'Silchar': { lat: 24.8333, lng: 92.7789 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
}

const URGENCY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#10b981',
}

const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

export default function MapView() {
  const tasks = store.getTasks()
  const volunteers = store.getVolunteers()
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [showVolunteers, setShowVolunteers] = useState(true)
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES
  })

  const mapCenter = useMemo(() => ({ lat: 22.5937, lng: 78.9629 }), []) // Center on India
  
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null)
  }, [])

  const filteredTasks = urgencyFilter === 'all' ? tasks : tasks.filter(t => t.extractedNeed.urgency === urgencyFilter)
  const selected = selectedTask ? store.getTask(selectedTask) : null

  // Map Snazzy Map style for the aesthetic
  const mapStyle = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
  ]

  return (
    <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-40px)] flex flex-col">
      {/* Map Controls */}
      <div className="px-4 py-3 bg-white border-b border-surface-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-surface-900">Live Map</h2>
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

      <div className="flex-1 relative bg-surface-100 flex items-center justify-center">
        {loadError && (
          <div className="text-center p-8 bg-red-50 rounded-lg text-red-600 border border-red-200 shadow-sm max-w-md">
            <h3 className="font-bold text-lg mb-2">Map Error</h3>
            <p className="text-sm">Google Maps failed to load. Please verify your VITE_GOOGLE_MAPS_API_KEY and ensure the Maps JavaScript API is enabled in your Google Cloud Console.</p>
          </div>
        )}
        
        {!isLoaded && !loadError && (
          <div className="w-8 h-8 rounded-full border-4 border-surface-200 border-t-brand-600 animate-spin"></div>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={5}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
            }}
          >
            {/* Task Markers */}
            {filteredTasks.map(task => {
              const city = task.extractedNeed.location.city
              const coords = CITY_COORDS[city] || task.extractedNeed.location
              if (!coords || !coords.lat) return null
              
              const color = URGENCY_COLORS[task.extractedNeed.urgency] || '#78716c'
              
              // We create custom SVG icons for markers to keep the aesthetic
              const svgIcon = {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 0.9,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: selectedTask === task.id ? 10 : 7,
              }

              return (
                <MarkerF
                  key={`task-${task.id}`}
                  position={{ lat: coords.lat, lng: coords.lng }}
                  icon={svgIcon}
                  onClick={() => setSelectedTask(isSelected => isSelected === task.id ? null : task.id)}
                />
              )
            })}

            {/* Volunteer Markers */}
            {showVolunteers && volunteers.filter(v => v.isActive).map(vol => {
              const coords = CITY_COORDS[vol.location.city]
              if (!coords || !coords.lat) return null
              
              const svgVolunteer = {
                path: 'M -5,-5 5,-5 5,5 -5,5 z', // Square
                fillColor: '#7c3aed',
                fillOpacity: 0.8,
                strokeWeight: 1.5,
                strokeColor: '#ffffff',
                scale: 1,
              }

              return (
                <MarkerF
                  key={`vol-${vol.id}`}
                  position={{ lat: coords.lat + 0.1, lng: coords.lng + 0.1 }} // Slightly offset to avoid complete overlap
                  icon={svgVolunteer}
                  title={vol.name}
                />
              )
            })}
            
            {/* InfoWindow for Selected Task */}
            {selectedTask && selected && (() => {
              const city = selected.extractedNeed.location.city
              const coords = CITY_COORDS[city] || selected.extractedNeed.location
              if (!coords || !coords.lat) return null
              
              return (
                <InfoWindowF
                  position={{ lat: coords.lat, lng: coords.lng }}
                  onCloseClick={() => setSelectedTask(null)}
                  options={{ pixelOffset: new google.maps.Size(0, -15) }}
                >
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <UrgencyBadge urgency={selected.extractedNeed.urgency} size="sm" />
                      <span className="text-xs font-bold text-surface-900 truncate">{selected.extractedNeed.category}</span>
                    </div>
                    <p className="text-[11px] text-surface-500 mb-2 line-clamp-2">{selected.extractedNeed.summary}</p>
                    <div className="text-[10px] space-y-1 mt-2 border-t pt-2 border-surface-100">
                      <div className="flex justify-between"><span className="text-surface-400">Affected:</span><span className="font-bold">{selected.extractedNeed.affectedCount} people</span></div>
                      <div className="flex justify-between"><span className="text-surface-400">Status:</span><StatusChip status={selected.status} /></div>
                    </div>
                  </div>
                </InfoWindowF>
              )
            })()}
          </GoogleMap>
        )}

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur rounded-xl p-3 text-xs shadow-lg border border-surface-200">
          <p className="font-bold text-surface-800 mb-2 border-b border-surface-100 pb-1">Legend</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-sm"></span> Critical</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm"></span> High</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></span> Medium</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span> Low</div>
            {showVolunteers && <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-violet-600 border border-white shadow-sm"></span> Volunteer</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
