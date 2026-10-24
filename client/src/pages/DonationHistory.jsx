
import { useState, useEffect, useCallback } from 'react'
import {
  Droplet,
  CalendarDays,
  Hospital,
  Clock,
  RefreshCw,
} from 'lucide-react'

import {
  BloodTag,
  EmptyState,
  PageContainer,
  PageHeader,
  Pill,
} from '../components/ui'

const API_URL = 'http://localhost:5000/api/donors/history'

const formatDate = (value) => {
  if (!value) return 'Date not available'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date not available'
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

function DonationHistory() {
  const [filter, setFilter] = useState('All')
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('lifeflowToken')

      if (!token) {
        setDonations([])
        setError('Please login as a donor to view your donation history.')
        return
      }

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch donation history.'
        )
      }

      // Supports common API response formats.
      const records = Array.isArray(data)
        ? data
        : data.donations || data.history || []

      setDonations(records)
    } catch (err) {
      setDonations([])
      setError(
        err.message || 'Unable to connect to the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const filteredDonations =
    filter === 'All'
      ? donations
      : donations.filter(
          (donation) =>
            String(donation.status || '').toLowerCase() ===
            filter.toLowerCase()
        )

  const totalUnits = donations.reduce(
    (total, donation) => total + (Number(donation.units) || 0),
    0
  )

  return (
    <PageContainer>
      <PageHeader
        title="Donation history"
        text="Review your past blood donation activity."
      />

      {/* Summary */}
      <dl className="card mt-8 grid grid-cols-2 overflow-hidden">
        <div className="p-5 sm:p-6">
          <dt className="text-sm text-muted">Total donations</dt>
          <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-blood">
            {donations.length}
          </dd>
        </div>

        <div className="border-l border-line p-5 sm:p-6">
          <dt className="text-sm text-muted">Total units donated</dt>
          <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-blood">
            {totalUnits}
          </dd>
        </div>
      </dl>

      {/* History heading and filters */}
      <div className="mb-4 mt-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Past donations</h2>

        <div className="flex flex-wrap gap-2">
          <div role="group" aria-label="Filter by status" className="flex gap-2">
            {['All', 'Completed'].map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
                className="chip"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="btn btn-secondary"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="py-8 text-center text-sm text-muted" role="status">
          Loading donation history...
        </p>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchHistory}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Donation records */}
      {!loading && !error && filteredDonations.length > 0 && (
        <ul className="space-y-3">
          {filteredDonations.map((donation, index) => {
            const donationId = donation._id || donation.id || index
            const hospitalName =
              donation.hospitalName ||
              donation.hospital?.name ||
              donation.hospital ||
              'Hospital not provided'

            const city =
              donation.city ||
              donation.hospital?.city ||
              ''

            const bloodGroup = donation.bloodGroup || 'Unknown'
            const status = formatStatus(donation.status)

            return (
              <li
                key={donationId}
                className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <BloodTag group={bloodGroup} size="lg" />

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold">
                    Blood donation
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-blood" />
                      {formatDate(
                        donation.date ||
                        donation.donationDate ||
                        donation.createdAt
                      )}
                    </span>

                    <span className="flex items-center gap-2">
                      <Hospital size={16} className="text-blood" />
                      {[hospitalName, city].filter(Boolean).join(', ')}
                    </span>

                    <span className="flex items-center gap-2">
                      <Droplet size={16} className="text-blood" />
                      {Number(donation.units) || 0}{' '}
                      {(Number(donation.units) || 0) === 1 ? 'unit' : 'units'}
                    </span>
                  </div>
                </div>

                <Pill
                  tone={
                    String(donation.status || '').toLowerCase() === 'completed'
                      ? 'ok'
                      : 'default'
                  }
                >
                  {status}
                </Pill>
              </li>
            )
          })}
        </ul>
      )}

      {/* Empty state */}
      {!loading && !error && filteredDonations.length === 0 && (
        <EmptyState
          icon={Clock}
          title="No donations found"
          text={
            filter === 'Completed'
              ? 'You have no completed donations yet.'
              : 'Your recorded donations will appear here when available.'
          }
        />
      )}
    </PageContainer>
  )
}

export default DonationHistory
