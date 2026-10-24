import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Phone, Users } from 'lucide-react'

const API_URL = 'http://localhost:5000/api/requests'
const RADII = [5, 10, 25, 50]

const hospitalIcon = L.divIcon({
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -20],
  html: `<div style="width:44px;height:44px;border-radius:12px;background:#dc2626;
    color:#fff;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);
    display:flex;align-items:center;justify-content:center;
    font:800 20px/1 system-ui,sans-serif;">H</div>`,
})

const donorIcon = (group) =>
  L.divIcon({
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
    html: `<div style="width:34px;height:34px;border-radius:50%;background:#2563eb;
      color:#fff;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;
      font:700 11px/1 system-ui,sans-serif;">${group}</div>`,
  })

const STATUS_STYLE = {
  accepted: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
  withdrawn: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

const STATUS_LABEL = {
  expired: 'expired (no response)',
}

// Zoom so the whole search circle is visible
function FitCircle({ center, radiusKm }) {
  const map = useMap()

  useEffect(() => {
    map.fitBounds(L.latLng(center).toBounds(radiusKm * 2000), {
      padding: [20, 20],
    })
  }, [map, center, radiusKm])

  return null
}

export default function NearbyDonors({ request, onChanged }) {
  const token = localStorage.getItem('lifeflowToken')

  // The donor search only makes sense while the request still needs a donor
  const needsDonor = request.status === 'pending'

  const [radius, setRadius] = useState(10)
  const [donors, setDonors] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(needsDonor)
  const [error, setError] = useState('')
  const [invitations, setInvitations] = useState([])
  const [acceptedDonor, setAcceptedDonor] = useState(null)
  const [sending, setSending] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const center = [request.latitude, request.longitude]

  // Nearby compatible donors
  useEffect(() => {
    if (!needsDonor) return undefined

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `${API_URL}/${request._id}/nearby-donors?radius=${radius}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const data = await response.json()

        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Could not search for donors.')
        }

        if (!cancelled) {
          setDonors(data.donors)
          setGroups(data.compatibleGroups)
        }
      } catch (err) {
        if (!cancelled) {
          setDonors([])
          setError(err.message || 'Could not search for donors.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [request._id, radius, token, reloadKey, needsDonor])

  // Contacted donors, their answers and the accepted donor (every 15 seconds)
  useEffect(() => {
    let cancelled = false

    const loadInvitations = async () => {
      try {
        const response = await fetch(
          `${API_URL}/${request._id}/invitations`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const data = await response.json()

        if (response.ok && data.success && !cancelled) {
          setInvitations(data.invitations)
          setAcceptedDonor(data.acceptedDonor)

          // The request status changed on the server (e.g. a donor accepted)
          if (data.requestStatus !== request.status && onChanged) {
            onChanged()
          }
        }
      } catch {
        // keep the previous list if the network drops for a moment
      }
    }

    loadInvitations()
    const timer = setInterval(loadInvitations, 15000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [request._id, request.status, token, reloadKey, onChanged])

  const contactDonors = async (count) => {
    setSending(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API_URL}/${request._id}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count, radius }),
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not send the request.')
      }

      setNotice(data.message)
      setReloadKey((key) => key + 1)
    } catch (err) {
      setError(err.message || 'Could not send the request.')
    } finally {
      setSending(false)
    }
  }

  const changeStatus = async (status, confirmText) => {
    if (!window.confirm(confirmText)) return

    setBusy(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API_URL}/${request._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not update the request.')
      }

      setNotice(data.message)
      setReloadKey((key) => key + 1)
      if (onChanged) onChanged()
    } catch (err) {
      setError(err.message || 'Could not update the request.')
    } finally {
      setBusy(false)
    }
  }

  const statusByDonor = Object.fromEntries(
    invitations.map((inv) => [inv.donorId, inv.status])
  )

  const hasPending = invitations.some((inv) => inv.status === 'pending')
  const everyoneAnswered = invitations.length > 0 && !hasPending
  const isActive = ['pending', 'accepted', 'in_progress'].includes(
    request.status
  )

  return (
    <div className="card mt-6 space-y-4 p-6 sm:p-8">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Users size={20} className="text-blood" />
          {needsDonor ? 'Find a donor' : 'Donor and request actions'}
        </h2>

        {needsDonor && (
          <p className="mt-1 text-sm text-muted">
            Available donors who can give blood to a {request.bloodGroup}{' '}
            patient{groups.length > 0 ? ` (${groups.join(', ')})` : ''}, nearest
            first. Donor contact details are shown only after a donor accepts.
          </p>
        )}
      </div>

      {notice && (
        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          {notice}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Accepted donor details */}
      {acceptedDonor && request.status !== 'cancelled' && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-semibold uppercase text-green-700">
            Donor who accepted
          </p>

          <p className="mt-1 text-lg font-bold text-gray-900">
            {acceptedDonor.name}{' '}
            <span className="text-sm font-semibold text-red-600">
              ({acceptedDonor.bloodGroup})
            </span>
          </p>

          <p className="text-sm text-gray-700">
            {[acceptedDonor.area, acceptedDonor.city].filter(Boolean).join(', ')}
            {acceptedDonor.distanceKm != null &&
              ` · about ${acceptedDonor.distanceKm} km from the hospital`}
          </p>

          {acceptedDonor.phone && (
            <a
              href={`tel:${acceptedDonor.phone}`}
              className="mt-2 inline-flex items-center gap-2 font-semibold text-blue-600"
            >
              <Phone size={16} />
              {acceptedDonor.phone}
            </a>
          )}
        </div>
      )}

      {/* Request actions */}
      {isActive && !needsDonor && (
        <div className="flex flex-wrap gap-3">
          {request.status !== 'completed' && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                changeStatus(
                  'completed',
                  'Mark this request as completed? Do this after the donation is done.'
                )
              }
              className="btn btn-primary"
            >
              Mark as completed
            </button>
          )}
        </div>
      )}

      {isActive && (
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            changeStatus(
              'cancelled',
              'Cancel this request? Donors will no longer be able to accept it.'
            )
          }
          className="btn btn-light"
        >
          Cancel request
        </button>
      )}

      {/* Search and contact (only while a donor is needed) */}
      {needsDonor && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Within:</span>

            {RADII.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadius(km)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  radius === km
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>

          {everyoneAnswered && (
            <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
              No donor has accepted yet. Contact the next nearest donor
              {radius < 50 ? ', or choose a larger distance.' : '.'}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => contactDonors(1)}
              disabled={sending}
              className="btn btn-primary"
            >
              {sending
                ? 'Sending...'
                : invitations.length > 0
                ? 'Contact next nearest donor'
                : 'Contact nearest donor'}
            </button>

            <button
              type="button"
              onClick={() => contactDonors(3)}
              disabled={sending}
              className="btn btn-secondary"
            >
              {invitations.length > 0 ? 'Contact next 3' : 'Contact nearest 3'}
            </button>
          </div>

          {hasPending && (
            <p className="text-xs text-gray-500">
              Waiting for a reply. Donors who already received this request
              are skipped automatically.
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <MapContainer
              center={center}
              zoom={12}
              scrollWheelZoom={false}
              style={{ height: '360px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <FitCircle center={center} radiusKm={radius} />

              <Circle
                center={center}
                radius={radius * 1000}
                pathOptions={{ color: '#dc2626', weight: 1, fillOpacity: 0.05 }}
              />

              <Marker position={center} icon={hospitalIcon}>
                <Popup>
                  <strong>{request.hospitalName}</strong>
                  <br />
                  Emergency location
                </Popup>
              </Marker>

              {donors.map((donor) => (
                <Marker
                  key={donor._id}
                  position={[donor.approxLatitude, donor.approxLongitude]}
                  icon={donorIcon(donor.bloodGroup)}
                >
                  <Popup>
                    <strong>{donor.name}</strong>
                    <br />
                    {donor.bloodGroup} · about {donor.distanceKm} km away
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <p className="text-xs text-gray-500">
            Donor markers show an approximate area, not an exact address.
          </p>

          {loading ? (
            <p className="text-sm text-muted">Searching for donors...</p>
          ) : donors.length === 0 && !error ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
              <p className="font-semibold text-gray-800">
                No eligible donors within {radius} km
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {radius < 50
                  ? 'Try a larger distance above.'
                  : 'No available compatible donors have a saved location near this hospital yet.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {donors.map((donor, index) => (
                <li
                  key={donor._id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {donor.bloodGroup}
                    </span>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {index + 1}. {donor.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {[donor.area, donor.city].filter(Boolean).join(', ') ||
                          'Location not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ~{donor.distanceKm} km
                    </p>
                    {statusByDonor[donor._id] ? (
                      <p className="text-xs font-semibold capitalize text-blue-700">
                        {statusByDonor[donor._id]}
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-green-700">Available</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Contacted donors */}
      {invitations.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Contacted donors</h3>

          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {invitations.map((inv) => (
              <li
                key={inv._id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
              >
                <span>
                  <strong>{inv.name}</strong> ({inv.bloodGroup}) · ~
                  {inv.distanceKm} km
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLE[inv.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {STATUS_LABEL[inv.status] || inv.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}