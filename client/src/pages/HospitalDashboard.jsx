
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Search, ClipboardList, Plus, CalendarCheck } from 'lucide-react'

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

  // Fetch dashboard statistics
  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'hospital') {
      setStatsLoading(false)
      return
    }

    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true)
        setStatsError('')

        const response = await fetch(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load dashboard statistics.'
          )
        }

        const dashboard = data.stats || data.data || data

        setStats([
          {
            label: 'Total requests',
            value: dashboard.totalRequests ?? 0,
          },
          {
            label: 'Pending requests',
            value: dashboard.pendingRequests ?? 0,
          },
          {
            label: 'Accepted requests',
            value: dashboard.acceptedRequests ?? 0,
          },
          {
            label: 'Completed requests',
            value: dashboard.completedRequests ?? 0,
          },
        ])
      } catch (error) {
        setStatsError(
          error.message || 'Unable to load dashboard statistics.'
        )
      } finally {
        setStatsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [token, currentUser?.role])

  // Fetch accepted requests for this hospital
  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'hospital') {
      setRequestsLoading(false)
      return
    }

    const fetchAcceptedRequests = async () => {
      try {
        setRequestsLoading(true)
        setRequestsError('')

        const response = await fetch(`${API_URL}/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Failed to load accepted requests.'
          )
        }

        const result = data.requests || data.data || []

        setRequests(Array.isArray(result) ? result : [])
      } catch (error) {
        setRequestsError(
          error.message || 'Unable to load accepted requests.'
        )
      } finally {
        setRequestsLoading(false)
      }
    }

    fetchAcceptedRequests()
  }, [token, currentUser?.role])

  // Schedule a donation for an accepted request
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
        throw new Error(data.message || 'Unable to schedule donation.')
      }

      setRequestActionMessage('Donation scheduled successfully.')

      // Remove the scheduled request from the accepted list
      setRequests((previous) =>
        previous.filter((request) => request._id !== requestId)
      )

      // Refresh statistics
      const statsResponse = await fetch(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const statsData = await statsResponse.json()

      if (statsResponse.ok && statsData.success) {
        const dashboard =
          statsData.stats || statsData.data || statsData

        setStats([
          {
            label: 'Total requests',
            value: dashboard.totalRequests ?? 0,
          },
          {
            label: 'Pending requests',
            value: dashboard.pendingRequests ?? 0,
          },
          {
            label: 'Accepted requests',
            value: dashboard.acceptedRequests ?? 0,
          },
          {
            label: 'Completed requests',
            value: dashboard.completedRequests ?? 0,
          },
        ])
      }
    } catch (error) {
      setRequestsError(
        error.message || 'Unable to schedule donation.'
      )
    } finally {
      setSchedulingId(null)
    }
  }

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Redirect accounts with a different role
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
        <p className="mb-3 text-sm text-blood" role="alert">
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
          <p className="mt-4 text-sm text-blood" role="alert">
            {requestsError}
          </p>
        )}

        {requestActionMessage && (
          <p className="mt-4 text-sm text-ok" role="status">
            {requestActionMessage}
          </p>
        )}

        {!requestsLoading &&
          !requestsError &&
          requests.length === 0 && (
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
              <article
                key={request._id}
                className="card p-5"
              >
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
                    <Pill>{request.status || 'accepted'}</Pill>
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
                  index % 2 === 1
                    ? 'sm:border-l sm:border-line'
                    : ''
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

                    {isLow && <Pill tone="critical">Low</Pill>}
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
      <SectionTitle>Quick actions</SectionTitle>
      <ActionList items={actions} />

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
        Dashboard statistics and accepted requests are fetched from the
        backend. Blood inventory still uses sample data.
      </DemoNote>
    </DashboardShell>
  )
}

export default HospitalDashboard
