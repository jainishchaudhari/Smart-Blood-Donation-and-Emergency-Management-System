
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Droplet,
  Hospital,
  Phone,
  CalendarDays,
  Plus,
  ClipboardList,
  MapPin,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'

import {
  BloodTag,
  EmptyState,
  PageContainer,
  PageHeader,
  Pill,
} from '../components/ui'

const API_URL = 'http://localhost:5000/api/requests'

const urgencyFilters = ['All', 'Critical', 'High', 'Normal']

const urgencyStyle = {
  critical: { tone: 'critical', border: 'border-l-blood', label: 'Critical' },
  high: { tone: 'warn', border: 'border-l-warn', label: 'High' },
  medium: { tone: 'ok', border: 'border-l-ok', label: 'Normal' },
  low: { tone: 'ok', border: 'border-l-ok', label: 'Low' },
  normal: { tone: 'ok', border: 'border-l-ok', label: 'Normal' },
}

const formatDate = (value) => {
  if (!value) return 'Date unavailable'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function ShowRequests() {
  const [urgency, setUrgency] = useState('All')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acceptingId, setAcceptingId] = useState(null)
  const [message, setMessage] = useState('')

  const savedUser = localStorage.getItem('lifeflowUser')

  let currentUser = null

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  const isDonor = currentUser?.role === 'donor'

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('lifeflowToken')

      if (!token) {
        setError('Please log in to view blood requests.')
        setRequests([])
        return
      }

      const response = await fetch(`${API_URL}?status=pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not load blood requests.')
      }

      setRequests(Array.isArray(data.requests) ? data.requests : [])
    } catch (err) {
      setError(
        err.message ||
          'Unable to connect to the server. Please check your backend.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleAcceptRequest = async (requestId) => {
    const token = localStorage.getItem('lifeflowToken')

    if (!token) {
      setError('Your session has expired. Please log in again.')
      return
    }

    const confirmed = window.confirm(
      'Do you want to accept this blood request?'
    )

    if (!confirmed) return

    setAcceptingId(requestId)
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/${requestId}/accept`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not accept this request.')
      }

      setMessage('Request accepted successfully!')

      // Remove it from the pending requests list
      setRequests((previous) =>
        previous.filter((request) => request._id !== requestId)
      )

      // Refresh pending requests from the backend
      await fetchRequests()
    } catch (err) {
      setError(err.message || 'Unable to accept this request.')
    } finally {
      setAcceptingId(null)
    }
  }

  const visibleRequests = requests
    .filter((request) => {
      if (urgency === 'All') return true

      const level = String(request.urgency || '').toLowerCase()

      if (urgency === 'Normal') {
        return ['normal', 'medium', 'low'].includes(level)
      }

      return level === urgency.toLowerCase()
    })
    .sort((a, b) => {
      const order = {
        critical: 0,
        high: 1,
        medium: 2,
        normal: 2,
        low: 3,
      }

      const urgencyDifference =
        (order[String(a.urgency || '').toLowerCase()] ?? 4) -
        (order[String(b.urgency || '').toLowerCase()] ?? 4)

      if (urgencyDifference !== 0) return urgencyDifference

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  return (
    <PageContainer>
      <PageHeader
        title="Emergency blood requests"
        text="Open blood requests from the LifeFlow database."
        action={
          <Link to="/emergency-request" className="btn btn-primary">
            <Plus size={18} />
            Create request
          </Link>
        }
      />

      <div className="mt-5">
        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? 'Refreshing...' : 'Refresh requests'}
        </button>
      </div>

      <div
        role="group"
        aria-label="Filter by urgency"
        className="mt-6 flex flex-wrap gap-2"
      >
        {urgencyFilters.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={urgency === item}
            onClick={() => setUrgency(item)}
            className="chip"
          >
            {item}
          </button>
        ))}
      </div>

      {message && (
        <p className="mt-5 text-sm text-ok" role="status">
          {message}
        </p>
      )}

      {loading && (
        <p className="mt-8 text-muted" role="status">
          Loading blood requests...
        </p>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchRequests}
            className="mt-3 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && visibleRequests.length > 0 && (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleRequests.map((request) => {
            const level = String(request.urgency || 'medium').toLowerCase()
            const style = urgencyStyle[level] || urgencyStyle.medium

            const mapUrl =
              request.latitude != null &&
              request.longitude != null &&
              Number.isFinite(Number(request.latitude)) &&
              Number.isFinite(Number(request.longitude))
                ? `https://www.google.com/maps?q=${request.latitude},${request.longitude}`
                : null

            return (
              <li
                key={request._id}
                className={`card flex flex-col border-l-4 p-5 ${style.border}`}
              >
                <div className="flex items-start gap-4">
                  <BloodTag group={request.bloodGroup} size="lg" />

                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold">
                      {request.patientName}
                    </h2>

                    <p className="mt-0.5 break-all text-sm text-muted">
                      Request #{request._id}
                    </p>

                    <div className="mt-2">
                      <Pill tone={style.tone}>{style.label}</Pill>
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5 text-sm">
                  <li className="flex items-center gap-2.5">
                    <Droplet size={17} className="shrink-0 text-blood" />
                    <span>
                      <span className="font-semibold">{request.units}</span>{' '}
                      {Number(request.units) === 1 ? 'unit' : 'units'} required
                    </span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <Hospital size={17} className="mt-0.5 shrink-0 text-blood" />
                    <span>
                      {request.hospitalName}
                      {request.area ? `, ${request.area}` : ''}
                      {request.city ? `, ${request.city}` : ''}
                    </span>
                  </li>

                  <li className="flex items-center gap-2.5 text-muted">
                    <CalendarDays size={17} className="shrink-0 text-blood" />
                    {formatDate(request.createdAt)}
                  </li>

                  {mapUrl && (
                    <li>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-blood underline"
                      >
                        <MapPin size={17} />
                        View selected location
                        <ExternalLink size={14} />
                      </a>
                    </li>
                  )}

                  {request.notes && (
                    <li className="rounded-lg bg-paper p-3 text-muted">
                      <span className="font-semibold">Notes: </span>
                      {request.notes}
                    </li>
                  )}
                </ul>

                {request.contactNumber && (
                  <a
                    href={`tel:${request.contactNumber}`}
                    className="btn btn-secondary mt-5 w-full"
                  >
                    <Phone size={16} />
                    Call {request.contactNumber}
                  </a>
                )}

                {isDonor && (
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(request._id)}
                    disabled={acceptingId === request._id}
                    className="btn btn-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle size={18} />
                    {acceptingId === request._id
                      ? 'Accepting...'
                      : 'Accept Request'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {!loading && !error && visibleRequests.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={ClipboardList}
            title={
              requests.length === 0
                ? 'No open requests yet'
                : 'No requests at this urgency'
            }
            text={
              requests.length === 0
                ? 'There are currently no pending requests to display.'
                : 'Choose another urgency level to see more requests.'
            }
          />
        </div>
      )}
    </PageContainer>
  )
}

export default ShowRequests
