import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  Hospital,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PageContainer, Pill } from '../components/ui'
import NearbyDonors from '../components/NearbyDonors'
import RequestProgress from '../components/RequestProgress'

const API_URL = 'http://localhost:5000/api/requests'

// Aligned with the app's token palette: blood / warn / ok
const URGENCY_COLORS = {
  critical: '#c8102e',
  high: '#9a5700',
  medium: '#0a7c7a',
  low: '#0a7c7a',
}

const URGENCY_TONE = { critical: 'critical', high: 'warn', medium: 'ok', low: 'ok' }

const STATUS_TONE = {
  pending: 'warn',
  accepted: 'ok',
  in_progress: 'ok',
  completed: 'ok',
  cancelled: 'neutral',
}

// Distinct hospital marker (a "H" pin), coloured by urgency
const hospitalIcon = (urgency) =>
  L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20],
    html: `<div style="
      width:44px;height:44px;border-radius:12px;
      background:${URGENCY_COLORS[urgency] || URGENCY_COLORS.medium};
      color:#fff;border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.45);
      display:flex;align-items:center;justify-content:center;
      font:800 20px/1 system-ui,sans-serif;">H</div>`,
  })

const formatDateTime = (value) => {
  if (!value) return 'Not specified'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not specified'
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={19} className="mt-0.5 shrink-0 text-muted" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <div className="font-medium text-ink">{children}</div>
      </div>
    </div>
  )
}

function RequestDetails() {
  const { id } = useParams()
  const token = localStorage.getItem('lifeflowToken')

  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load the request; silent reloads keep the page fresh without flicker
  const load = useCallback(
    async (silent = false) => {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await response.json()

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Could not load this request.')
        }

        setRequest(data.request)
      } catch (err) {
        if (!silent) setError(err.message || 'Could not load this request.')
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [id, token]
  )

  useEffect(() => {
    load(false)
    const timer = setInterval(() => load(true), 15000)
    return () => clearInterval(timer)
  }, [load])

  const refreshRequest = useCallback(() => load(true), [load])

  if (loading) {
    return (
      <PageContainer narrow>
        <p className="text-muted">Loading request...</p>
      </PageContainer>
    )
  }

  if (error || !request) {
    return (
      <PageContainer narrow>
        <p
          role="alert"
          className="rounded-lg border border-blood/30 bg-plasma p-3 text-sm text-blood-deep"
        >
          {error || 'Request not found.'}
        </p>
        <Link to="/show-requests" className="btn btn-secondary mt-4 inline-flex">
          Back to requests
        </Link>
      </PageContainer>
    )
  }

  const urgency = (request.urgency || 'medium').toLowerCase()
  const status = (request.status || 'pending').toLowerCase()

  // Only the requester, hospitals and admins may search for donors
  let currentUser = null
  try {
    currentUser = JSON.parse(localStorage.getItem('lifeflowUser') || 'null')
  } catch {
    currentUser = null
  }

  const requesterId = request.requestedBy?._id || request.requestedBy
  const canFindDonors =
    currentUser?.id === requesterId || currentUser?.role === 'admin'

  const hasLocation =
    typeof request.latitude === 'number' &&
    typeof request.longitude === 'number'

  return (
    <PageContainer narrow>
      <Link
        to="/show-requests"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to requests
      </Link>

      <div className="card space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{request.patientName}</h1>
            <p className="mt-1 text-sm text-muted">
              {request.patientAge ? `${request.patientAge} yrs` : ''}
              {request.patientAge && request.patientGender ? ', ' : ''}
              {request.patientGender
                ? request.patientGender.charAt(0).toUpperCase() +
                  request.patientGender.slice(1)
                : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill tone={URGENCY_TONE[urgency] || 'ok'}>{urgency}</Pill>
            <Pill tone={STATUS_TONE[status] || 'neutral'}>
              {status.replace('_', ' ')}
            </Pill>
          </div>
        </div>

        <RequestProgress status={request.status} />

        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-plasma px-4 py-3">
            <p className="text-xs text-muted">Blood group</p>
            <p className="mt-1 text-2xl font-bold text-blood">
              {request.bloodGroup}
            </p>
          </div>

          <div className="rounded-xl bg-paper px-4 py-3">
            <p className="text-xs text-muted">Units required</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {request.units}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Row icon={CalendarClock} label="Blood required by">
            {formatDateTime(request.requiredBy)}
          </Row>

          {request.medicalCondition && (
            <Row icon={User} label="Reason / medical condition">
              {request.medicalCondition}
            </Row>
          )}

          <Row icon={Hospital} label="Hospital">
            <p>{request.hospitalName}</p>
            {request.hospitalAddress && (
              <p className="text-sm font-normal text-muted">
                {request.hospitalAddress}
              </p>
            )}
          </Row>

          <Row icon={MapPin} label="Location">
            {[request.area, request.city].filter(Boolean).join(', ')}
          </Row>

          {request.contactNumber && (
            <Row icon={Phone} label="Contact">
              <p>
                {request.attendantName ? `${request.attendantName}: ` : ''}
                <a
                  href={`tel:${request.contactNumber}`}
                  className="text-blood hover:text-blood-deep hover:underline"
                >
                  {request.contactNumber}
                </a>
              </p>
              {request.alternateContact && (
                <p className="text-sm font-normal text-muted">
                  Alternate:{' '}
                  <a
                    href={`tel:${request.alternateContact}`}
                    className="text-blood hover:text-blood-deep hover:underline"
                  >
                    {request.alternateContact}
                  </a>
                </p>
              )}
            </Row>
          )}

          {!request.contactNumber && (
            <Row icon={Phone} label="Contact">
              <span className="text-sm font-normal text-muted">
                Shared with the donor who accepts this request.
              </span>
            </Row>
          )}
        </div>

        {request.notes && (
          <div className="rounded-xl border border-line bg-paper p-3">
            <p className="mb-1 text-xs font-semibold text-muted">Notes</p>
            <p className="text-sm text-ink">{request.notes}</p>
          </div>
        )}

        {/* Emergency location map */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <MapPin size={20} className="text-blood" />
            Emergency location
          </h2>

          {hasLocation ? (
            <>
              <div className="overflow-hidden rounded-xl border border-line">
                <MapContainer
                  center={[request.latitude, request.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: '320px', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />

                  <Marker
                    position={[request.latitude, request.longitude]}
                    icon={hospitalIcon(urgency)}
                  >
                    <Popup>
                      <strong>{request.hospitalName}</strong>
                      <br />
                      {request.bloodGroup} needed
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary mt-3 inline-flex"
              >
                Get directions
              </a>
            </>
          ) : (
            <p className="rounded-lg bg-paper p-3 text-sm text-muted">
              No map location was added to this request.
            </p>
          )}
        </div>
      </div>

      {canFindDonors && hasLocation && (
        <NearbyDonors request={request} onChanged={refreshRequest} />
      )}
    </PageContainer>
  )
}

export default RequestDetails