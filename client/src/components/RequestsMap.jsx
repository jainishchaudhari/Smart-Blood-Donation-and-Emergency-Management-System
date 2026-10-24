import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [23.0225, 72.5714] // Ahmedabad

const URGENCY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#16a34a',
  low: '#16a34a',
}

// Round colored pin with the blood group written inside (no image files needed)
const makeIcon = (urgency, bloodGroup) =>
  L.divIcon({
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
    html: `<div style="
      width:38px;height:38px;border-radius:50%;
      background:${URGENCY_COLORS[urgency] || URGENCY_COLORS.medium};
      color:#fff;border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;
      font:700 12px/1 system-ui,sans-serif;">${bloodGroup || '?'}</div>`,
  })

// Zoom the map so every request is visible
function FitBounds({ points }) {
  const map = useMap()
  const key = points.map((p) => p.join(',')).join('|')

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }
    map.fitBounds(points, { padding: [40, 40], maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key])

  return null
}

const hasCoords = (r) =>
  typeof r.latitude === 'number' && typeof r.longitude === 'number'

export default function RequestsMap({ requests }) {
  const located = requests.filter(hasCoords)
  const points = located.map((r) => [r.latitude, r.longitude])

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <h2 className="font-semibold text-gray-900">Requests on map</h2>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ background: URGENCY_COLORS.critical }} />
            Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ background: URGENCY_COLORS.high }} />
            High
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full" style={{ background: URGENCY_COLORS.medium }} />
            Normal
          </span>
        </div>
      </div>

      <MapContainer
        center={points[0] || DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '380px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <FitBounds points={points} />

        {located.map((r) => {
          const urgency = (r.urgency || 'medium').toLowerCase()

          return (
            <Marker
              key={r._id}
              position={[r.latitude, r.longitude]}
              icon={makeIcon(urgency, r.bloodGroup)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">
                    {r.bloodGroup} · {r.units} unit{r.units === 1 ? '' : 's'}
                  </p>
                  <p>{r.patientName}</p>
                  <p>{r.hospitalName}</p>
                  <p className="capitalize">Urgency: {urgency}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', fontWeight: 600 }}
                  >
                    Get directions
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {located.length < requests.length && (
        <p className="px-4 py-2 text-xs text-gray-500">
          {requests.length - located.length} request
          {requests.length - located.length === 1 ? ' has' : 's have'} no map
          location and {requests.length - located.length === 1 ? 'is' : 'are'} not shown.
        </p>
      )}
    </div>
  )
}