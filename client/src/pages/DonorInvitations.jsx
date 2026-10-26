import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Clock, Hospital, MapPin, Phone } from 'lucide-react'
import { PageContainer, PageHeader, Pill } from '../components/ui'

const API_URL = 'http://localhost:5000/api/invitations'

const URGENCY_TONE = { critical: 'critical', high: 'warn', medium: 'ok', low: 'ok' }

const getUrgencyTone = (urgency) =>
  URGENCY_TONE[(urgency || 'medium').toLowerCase()] || 'ok'

const timeLeft = (expiresAt) => {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'expired'
  const minutes = Math.ceil(ms / 60000)
  return minutes >= 60
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m left`
    : `${minutes} min left`
}

function DonorInvitations() {
  const token = localStorage.getItem('lifeflowToken')

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not load your requests.')
      }

      setItems(data.invitations)
    } catch (err) {
      setError(err.message || 'Could not load your requests.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
    const timer = setInterval(load, 20000)
    return () => clearInterval(timer)
  }, [load])

  const respond = async (id, action) => {
    if (
      action === 'accept' &&
      !window.confirm('Do you confirm that you can donate blood for this patient?')
    ) {
      return
    }

    setBusyId(id)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not send your answer.')
      }

      setSuccess(data.message)
    } catch (err) {
      setError(err.message || 'Could not send your answer.')
    } finally {
      setBusyId(null)
      load()
    }
  }

  // Donor marks progress or withdraws after accepting
  const donorAction = async (inv, action) => {
    const confirmText =
      action === 'withdraw'
        ? 'Withdraw? The requester will be told to contact another donor.'
        : 'Mark that you are on the way / donating now?'

    if (!window.confirm(confirmText)) return

    setBusyId(inv._id)
    setError('')
    setSuccess('')

    try {
      const response =
        action === 'withdraw'
          ? await fetch(`${API_URL}/${inv._id}/withdraw`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
            })
          : await fetch(
              `http://localhost:5000/api/requests/${inv.request._id}/status`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'in_progress' }),
              }
            )

      const data = await response.json()

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Could not update.')
      }

      setSuccess(data.message)
    } catch (err) {
      setError(err.message || 'Could not update.')
    } finally {
      setBusyId(null)
      load()
    }
  }

  const pending = items.filter((i) => i.status === 'pending')
  const accepted = items.filter((i) => i.status === 'accepted')

  return (
    <PageContainer narrow>
      <PageHeader
        title="Requests for you"
        text="These emergencies were sent to you because you are a compatible donor nearby."
      />

      {success && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-lg border border-ok/30 bg-ok-soft p-3 text-sm text-ok">
          <CheckCircle size={18} />
          {success}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-blood/30 bg-plasma p-3 text-sm text-blood-deep">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-muted">Loading...</p>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Waiting for the donor's answer */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Waiting for your reply ({pending.length})
            </h2>

            {pending.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line bg-white p-6 text-center text-muted">
                No requests need your reply right now.
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((inv) => {
                  const r = inv.request
                  const urgency = (r.urgency || 'medium').toLowerCase()

                  return (
                    <div key={inv._id} className="card space-y-4 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-plasma text-lg font-bold text-blood">
                            {r.bloodGroup}
                          </span>
                          <div>
                            <p className="font-bold">
                              {r.units} unit{r.units === 1 ? '' : 's'} needed
                            </p>
                            <p className="text-sm text-muted">for {r.patientName}</p>
                          </div>
                        </div>

                        <Pill tone={getUrgencyTone(urgency)}>{urgency}</Pill>
                      </div>

                      <div className="space-y-1 text-sm text-ink">
                        <p className="flex items-center gap-2">
                          <Hospital size={16} className="text-muted" />
                          {r.hospitalName}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-muted" />
                          {[r.area, r.city].filter(Boolean).join(', ')}
                          {inv.distanceKm != null && ` · about ${inv.distanceKm} km from you`}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock size={16} className="text-muted" />
                          Reply: {timeLeft(inv.expiresAt)}
                        </p>
                      </div>

                      {r.medicalCondition && (
                        <p className="text-sm text-muted">Reason: {r.medicalCondition}</p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={busyId === inv._id}
                          onClick={() => respond(inv._id, 'accept')}
                          className="btn btn-primary"
                        >
                          {busyId === inv._id ? 'Please wait...' : 'Accept'}
                        </button>

                        <button
                          type="button"
                          disabled={busyId === inv._id}
                          onClick={() => respond(inv._id, 'reject')}
                          className="btn btn-secondary"
                        >
                          Decline
                        </button>

                        <Link to={`/requests/${r._id}`} className="btn btn-light">
                          View map
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Accepted by this donor */}
          {accepted.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">
                Accepted by you ({accepted.length})
              </h2>

              <div className="space-y-4">
                {accepted.map((inv) => {
                  const r = inv.request

                  return (
                    <div key={inv._id} className="card space-y-2 border-ok/25 p-5">
                      <p className="font-bold">
                        {r.bloodGroup} · {r.units} unit{r.units === 1 ? '' : 's'} for {r.patientName}
                      </p>
                      <p className="text-sm text-ink">
                        {r.hospitalName}, {[r.area, r.city].filter(Boolean).join(', ')}
                      </p>

                      {r.contactNumber && (
                        <p className="flex items-center gap-2 text-sm">
                          <Phone size={16} className="text-muted" />
                          {r.attendantName ? `${r.attendantName}: ` : ''}
                          <a href={`tel:${r.contactNumber}`} className="font-semibold text-blood hover:text-blood-deep">
                            {r.contactNumber}
                          </a>
                        </p>
                      )}

                      <p className="text-sm font-semibold capitalize text-ok">
                        Status: {r.status.replace('_', ' ')}
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <Link to={`/requests/${r._id}`} className="btn btn-secondary">
                          View map and directions
                        </Link>

                        {r.status === 'accepted' && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === inv._id}
                              onClick={() => donorAction(inv, 'progress')}
                              className="btn btn-primary"
                            >
                              I am on the way
                            </button>

                            <button
                              type="button"
                              disabled={busyId === inv._id}
                              onClick={() => donorAction(inv, 'withdraw')}
                              className="btn btn-light"
                            >
                              I can't come
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  )
}

export default DonorInvitations