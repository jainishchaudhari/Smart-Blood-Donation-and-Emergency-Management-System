import { useEffect, useState } from 'react'
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
import { PageContainer } from '../components/ui'

const API_URL = 'http://localhost:5000/api/requests'

const URGENCY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#16a34a',
  low: '#16a34a',
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
      <Icon size={19} className="mt-0.5 shrink-0 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <div className="font-medium text-gray-800">{children}</div>
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

  useEffect(() => {
    const load = async () => {
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
        setError(err.message || 'Could not load this request.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, token])

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
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error || 'Request not found.'}
        </p>
        <Link to="/show-requests" className="btn btn-secondary mt-4 inline-flex">
          Back to requests
        </Link>
      </PageContainer>
    )
  }

  const urgency = (request.urgency || 'medium').toLowerCase()
  const hasLocation =
    typeof request.latitude === 'number' &&
    typeof request.longitude === 'number'

  return (
    <PageContainer narrow>
      <Link
        to="/show-requests"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
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
            <span
              className="rounded-full px-3 py-1 text-sm font-semibold capitalize text-white"
              style={{ background: URGENCY_COLORS[urgency] }}
            >
              {urgency}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold capitalize text-gray-700">
              {request.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-red-50 px-4 py-3">
            <p className="text-xs text-gray-500">Blood group</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {request.bloodGroup}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500">Units required</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
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
              <p className="text-sm font-normal text-gray-600">
                {request.hospitalAddress}
              </p>
            )}
          </Row>

          <Row icon={MapPin} label="Location">
            {[request.area, request.city].filter(Boolean).join(', ')}
          </Row>

          <Row icon={Phone} label="Contact">
            <p>
              {request.attendantName ? `${request.attendantName}: ` : ''}
              <a
                href={`tel:${request.contactNumber}`}
                className="text-blue-600 hover:underline"
              >
                {request.contactNumber}
              </a>
            </p>
            {request.alternateContact && (
              <p className="text-sm font-normal text-gray-600">
                Alternate:{' '}
                <a
                  href={`tel:${request.alternateContact}`}
                  className="text-blue-600 hover:underline"
                >
                  {request.alternateContact}
                </a>
              </p>
            )}
          </Row>
        </div>

        {request.notes && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="mb-1 text-xs font-semibold text-gray-500">
              Notes
            </p>
            <p className="text-sm text-gray-700">{request.notes}</p>
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
              <div className="overflow-hidden rounded-xl border border-gray-200">
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
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              No map location was added to this request.
            </p>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default RequestDetails