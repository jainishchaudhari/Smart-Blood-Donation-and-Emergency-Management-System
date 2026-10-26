import { useEffect, useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import {
  Search,
  ClipboardList,
  Plus,
  CalendarCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'

import {
  ActionList,
  BloodTag,
  DashboardShell,
  DemoNote,
  Pill,
  SectionTitle,
  StatStrip,
} from '../components/ui'

import { formatGroup } from '../lib/blood'

const API_URL = 'http://localhost:5000/api/hospitals'
const LOW_STOCK_LIMIT = 10
const STOCK_SCALE = 40

// Tones for the shared Pill component, kept consistent with the rest of the app
const STATUS_TONE = {
  pending: 'warn',
  accepted: 'ok',
  in_progress: 'ok',
  completed: 'ok',
  cancelled: 'neutral',
  scheduled: 'warn',
}

const getStatusTone = (status) =>
  STATUS_TONE[(status || '').toLowerCase()] || 'neutral'

const actions = [
  {
    to: '/emergency-request',
    icon: Plus,
    title: 'Emergency request',
    text: 'Create a request for urgent blood needs.',
  },
  {
    to: '/show-requests',
    icon: ClipboardList,
    title: 'View requests',
    text: 'Review open blood requests.',
  },
  {
    to: '/find-blood',
    icon: Search,
    title: 'Find blood donors',
    text: 'Search for donors by blood group.',
  },
]

function getErrorMessage(data, fallback) {
  return data?.message || fallback
}

function HospitalDashboard() {
  const savedUser = localStorage.getItem('lifeflowUser')
  const token = localStorage.getItem('lifeflowToken')

  let currentUser

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  const [stats, setStats] = useState([
    { label: 'Total requests', value: '—' },
    { label: 'Pending requests', value: '—' },
    { label: 'Accepted requests', value: '—' },
    { label: 'Completed requests', value: '—' },
  ])

  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')

  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState('')
  const [schedulingId, setSchedulingId] = useState(null)
  const [requestActionMessage, setRequestActionMessage] = useState('')

  const [donations, setDonations] = useState([])
  const [donationsLoading, setDonationsLoading] = useState(true)
  const [donationsError, setDonationsError] = useState('')
  const [updatingDonationId, setUpdatingDonationId] = useState(null)
  const [donationActionMessage, setDonationActionMessage] = useState('')

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    if (!token) return

    try {
      setStatsError('')

      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, 'Failed to load dashboard statistics.')
        )
      }

      const dashboard = data.stats || data.data || data

      setStats([
        { label: 'Total requests', value: dashboard.totalRequests ?? 0 },
        { label: 'Pending requests', value: dashboard.pendingRequests ?? 0 },
        { label: 'Accepted requests', value: dashboard.acceptedRequests ?? 0 },
        { label: 'Completed requests', value: dashboard.completedRequests ?? 0 },
      ])
    } catch (error) {
      setStatsError(error.message || 'Unable to load dashboard statistics.')
    }
  }, [token])

  useEffect(() => {
    if (!token || currentUser?.role !== 'hospital') {
      setStatsLoading(false)
      return
    }

    const loadStats = async () => {
      setStatsLoading(true)
      await fetchDashboardStats()
      setStatsLoading(false)
    }

    loadStats()
  }, [token, currentUser?.role, fetchDashboardStats])

  // Fetch accepted requests
  const fetchAcceptedRequests = useCallback(async () => {
    if (!token) return

    try {
      setRequestsError('')

      const response = await fetch(`${API_URL}/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, 'Failed to load accepted requests.')
        )
      }

      const result = data.requests || data.data || []
      setRequests(Array.isArray(result) ? result : [])
    } catch (error) {
      setRequestsError(error.message || 'Unable to load accepted requests.')
    }
  }, [token])

  useEffect(() => {
    if (!token || currentUser?.role !== 'hospital') {
      setRequestsLoading(false)
      return
    }

    const loadRequests = async () => {
      setRequestsLoading(true)
      await fetchAcceptedRequests()
      setRequestsLoading(false)
    }

    loadRequests()
  }, [token, currentUser?.role, fetchAcceptedRequests])

  // Fetch donations
  const fetchDonations = useCallback(async () => {
    if (!token) return

    try {
      setDonationsError('')

      const response = await fetch(`${API_URL}/donations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, 'Failed to load donations.')
        )
      }

      const result = data.donations || data.data || []
      setDonations(Array.isArray(result) ? result : [])
    } catch (error) {
      setDonationsError(error.message || 'Unable to load donations.')
    }
  }, [token])

  useEffect(() => {
    if (!token || currentUser?.role !== 'hospital') {
      setDonationsLoading(false)
      return
    }

    const loadDonations = async () => {
      setDonationsLoading(true)
      await fetchDonations()
      setDonationsLoading(false)
    }

    loadDonations()
  }, [token, currentUser?.role, fetchDonations])

  // Schedule donation
  const handleScheduleDonation = async (requestId) => {
    if (!token || !requestId) return

    const confirmed = window.confirm(
      'Schedule a donation for this accepted blood request?'
    )

    if (!confirmed) return

    try {
      setSchedulingId(requestId)
      setRequestActionMessage('')
      setRequestsError('')

      const response = await fetch(
        `${API_URL}/requests/${requestId}/donations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(getErrorMessage(data, 'Unable to schedule donation.'))
      }

      setRequestActionMessage('Donation scheduled successfully.')

      setRequests((previous) =>
        previous.filter((request) => request._id !== requestId)
      )

      await Promise.all([fetchDashboardStats(), fetchDonations()])
    } catch (error) {
      setRequestsError(error.message || 'Unable to schedule donation.')
    } finally {
      setSchedulingId(null)
    }
  }

  // Update donation status
  const handleDonationStatus = async (donation, nextStatus) => {
    if (!token || !donation?._id) return

    const actionLabel =
      nextStatus === 'completed' ? 'mark this donation as completed' : 'cancel this donation'

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel}?`
    )

    if (!confirmed) return

    try {
      setUpdatingDonationId(donation._id)
      setDonationActionMessage('')
      setDonationsError('')

      const response = await fetch(
        `${API_URL}/donations/${donation._id}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, 'Unable to update donation status.')
        )
      }

      setDonationActionMessage(
        `Donation status updated to ${nextStatus}.`
      )

      await Promise.all([fetchDonations(), fetchDashboardStats()])
    } catch (error) {
      setDonationsError(
        error.message || 'Unable to update donation status.'
      )
    } finally {
      setUpdatingDonationId(null)
    }
  }

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Redirect if the account has a different role
  if (currentUser.role !== 'hospital') {
    const dashboardRoutes = {
      user: '/user-dashboard',
      donor: '/donor-dashboard',
      admin: '/admin-dashboard',
    }

    return (
      <Navigate
        to={dashboardRoutes[currentUser.role] || '/login'}
        replace
      />
    )
  }

  // Demo inventory: not connected to the database yet
  const bloodStock = [
    { group: 'A+', units: 20 },
    { group: 'A-', units: 8 },
    { group: 'B+', units: 25 },
    { group: 'B-', units: 6 },
    { group: 'AB+', units: 12 },
    { group: 'AB-', units: 5 },
    { group: 'O+', units: 30 },
    { group: 'O-', units: 14 },
  ]

  const lowStock = bloodStock.filter(
    (item) => item.units < LOW_STOCK_LIMIT
  )

  return (
    <DashboardShell
      user={currentUser}
      subtitle="Manage blood inventory and emergency requests."
    >
      {/* Dashboard statistics */}
      {statsLoading && (
        <p className="mb-3 text-sm text-muted">
          Loading dashboard statistics...
        </p>
      )}

      {statsError && (
        <p className="mb-3 text-sm text-blood-deep" role="alert">
          {statsError}
        </p>
      )}

      <StatStrip stats={stats} />

      {/* Accepted blood requests */}
      <section className="mt-10">
        <SectionTitle>Accepted blood requests</SectionTitle>

        {requestsLoading && (
          <p className="mt-4 text-sm text-muted">
            Loading accepted requests...
          </p>
        )}

        {requestsError && (
          <p className="mt-4 text-sm text-blood-deep" role="alert">
            {requestsError}
          </p>
        )}

        {requestActionMessage && (
          <p className="mt-4 text-sm text-ok" role="status">
            {requestActionMessage}
          </p>
        )}

        {!requestsLoading && !requestsError && requests.length === 0 && (
          <div className="card mt-4 p-5">
            <p className="font-medium">No accepted requests found.</p>
            <p className="mt-1 text-sm text-muted">
              Accepted requests for this hospital will appear here.
            </p>
          </div>
        )}

        {requests.length > 0 && (
          <div className="mt-4 grid gap-4">
            {requests.map((request) => (
              <article key={request._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {request.patientName || 'Patient'}
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      {request.hospitalName || 'Hospital'}
                      {request.city ? ` · ${request.city}` : ''}
                    </p>
                  </div>

                  <BloodTag group={request.bloodGroup} />
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-muted">Units required: </span>
                    <strong>{request.units ?? '—'}</strong>
                  </p>

                  <p>
                    <span className="text-muted">Urgency: </span>
                    <strong>{request.urgency || 'Not specified'}</strong>
                  </p>

                  <p>
                    <span className="text-muted">Contact: </span>
                    <strong>{request.contactNumber || 'Not provided'}</strong>
                  </p>

                  <p>
                    <span className="text-muted">Status: </span>
                    <Pill tone={getStatusTone(request.status || 'accepted')}>
                      {request.status || 'accepted'}
                    </Pill>
                  </p>
                </div>

                {request.notes && (
                  <p className="mt-3 text-sm text-muted">
                    Notes: {request.notes}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleScheduleDonation(request._id)}
                  disabled={schedulingId === request._id}
                  className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CalendarCheck size={18} />
                  {schedulingId === request._id
                    ? 'Scheduling...'
                    : 'Schedule donation'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Donation history and status */}
      <section className="mt-10">
        <SectionTitle>Donation history &amp; status</SectionTitle>

        {donationsLoading && (
          <p className="mt-4 text-sm text-muted">
            Loading donations...
          </p>
        )}

        {donationsError && (
          <p className="mt-4 text-sm text-blood-deep" role="alert">
            {donationsError}
          </p>
        )}

        {donationActionMessage && (
          <p className="mt-4 text-sm text-ok" role="status">
            {donationActionMessage}
          </p>
        )}

        {!donationsLoading &&
          !donationsError &&
          donations.length === 0 && (
            <div className="card mt-4 p-5">
              <p className="font-medium">No donations found.</p>
              <p className="mt-1 text-sm text-muted">
                Scheduled donations will appear here.
              </p>
            </div>
          )}

        {donations.length > 0 && (
          <div className="mt-4 grid gap-4">
            {donations.map((donation) => {
              const status = (
                donation.status || 'scheduled'
              ).toLowerCase()

              return (
                <article key={donation._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {donation.donor?.name || 'Donor details unavailable'}
                      </h3>

                      <p className="mt-1 text-sm text-muted">
                        {donation.hospitalName || currentUser.name}
                        {donation.city ? ` · ${donation.city}` : ''}
                      </p>
                    </div>

                    <BloodTag group={donation.bloodGroup} />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <p>
                      <span className="text-muted">Patient: </span>
                      <strong>
                        {donation.bloodRequest?.patientName || 'No linked request'}
                      </strong>
                    </p>

                    <p>
                      <span className="text-muted">Units: </span>
                      <strong>{donation.units ?? '—'}</strong>
                    </p>

                    <p>
                      <span className="text-muted">Donor email: </span>
                      <strong>{donation.donor?.email || 'Not available'}</strong>
                    </p>

                    <p>
                      <span className="text-muted">Donation date: </span>
                      <strong>
                        {donation.donationDate
                          ? new Date(donation.donationDate).toLocaleString()
                          : 'Not scheduled'}
                      </strong>
                    </p>

                    <p>
                      <span className="text-muted">Request status: </span>
                      <Pill tone={getStatusTone(donation.bloodRequest?.status)}>
                        {donation.bloodRequest?.status || 'Not linked'}
                      </Pill>
                    </p>

                    <p>
                      <span className="text-muted">Donation status: </span>
                      <Pill tone={getStatusTone(status)}>{status}</Pill>
                    </p>
                  </div>

                  {donation.notes && (
                    <p className="mt-3 text-sm text-muted">
                      Notes: {donation.notes}
                    </p>
                  )}

                  {status === 'scheduled' && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleDonationStatus(donation, 'completed')
                        }
                        disabled={updatingDonationId === donation._id}
                        className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle size={18} />
                        {updatingDonationId === donation._id
                          ? 'Updating...'
                          : 'Mark completed'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDonationStatus(donation, 'cancelled')
                        }
                        disabled={updatingDonationId === donation._id}
                        className="btn border border-blood/30 bg-white text-blood hover:bg-plasma disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle size={18} />
                        Cancel donation
                      </button>
                    </div>
                  )}

                  {status !== 'scheduled' && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                      {status === 'completed' ? (
                        <CheckCircle size={17} />
                      ) : (
                        <XCircle size={17} />
                      )}
                      This donation is {status}; status changes are disabled.
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            Promise.all([fetchDonations(), fetchDashboardStats()])
          }
          disabled={donationsLoading}
          className="btn btn-secondary mt-5 disabled:opacity-60"
        >
          <RefreshCw size={17} />
          Refresh donations
        </button>
      </section>

      {/* Blood inventory */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Blood inventory</h2>

        <p className="mt-1 text-sm text-muted">
          {lowStock.length > 0
            ? `${lowStock.length} groups are below ${LOW_STOCK_LIMIT} units: ${lowStock
                .map((item) => formatGroup(item.group))
                .join(', ')}.`
            : 'All blood groups are well stocked.'}
        </p>

        <ul className="card mt-4 grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
          {bloodStock.map((item, index) => {
            const isLow = item.units < LOW_STOCK_LIMIT
            const width = Math.min(
              (item.units / STOCK_SCALE) * 100,
              100
            )

            return (
              <li
                key={item.group}
                className={`flex items-center gap-4 p-4 sm:p-5 ${
                  index >= 2 ? 'sm:border-t sm:border-line' : ''
                } ${
                  index % 2 === 1 ? 'sm:border-l sm:border-line' : ''
                }`}
              >
                <span className="flex w-[4.5rem] shrink-0">
                  <BloodTag group={item.group} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold tabular-nums">
                      {item.units} units
                    </span>

                    {isLow && <Pill tone="critical">Low stock</Pill>}
                  </div>

                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-paper"
                    aria-hidden="true"
                  >
                    <div
                      className={`h-full rounded-full ${
                        isLow ? 'bg-blood' : 'bg-ok'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Quick actions */}
      <section className="mt-10">
        <SectionTitle>Quick actions</SectionTitle>
        <ActionList items={actions} />
      </section>

      {/* Safety reminder */}
      <div className="mt-10 rounded-xl border border-blood/20 bg-plasma p-5">
        <h2 className="font-semibold text-blood-deep">
          Before issuing blood
        </h2>

        <p className="mt-1 text-sm leading-6 text-ink/80">
          Verify blood group, stock availability and compatibility through
          your hospital&apos;s approved transfusion procedures.
        </p>
      </div>

      <DemoNote>
        Dashboard statistics, accepted requests and donation history are
        fetched from the backend. Blood inventory still uses sample data.
      </DemoNote>
    </DashboardShell>
  )
}

export default HospitalDashboard