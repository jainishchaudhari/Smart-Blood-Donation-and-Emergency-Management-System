import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  MapPin,
  Phone,
  X,
  RefreshCw,
  Droplet,
} from 'lucide-react'

import {
  EmptyState,
  PageContainer,
  PageHeader,
} from '../components/ui'

import { BLOOD_GROUPS, formatGroup } from '../lib/blood'

const API_URL = 'http://localhost:5000/api/donors'

function FindBlood() {
  const [params] = useSearchParams()

  const initialGroup = BLOOD_GROUPS.includes(params.get('group'))
    ? params.get('group')
    : ''

  const [bloodGroup, setBloodGroup] = useState(initialGroup)
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')

  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch registered donors from backend
  const fetchDonors = useCallback(async (filters = {}) => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('lifeflowToken')

      if (!token) {
        setDonors([])
        setError('Please login to search registered donors.')
        return
      }

      const queryParams = new URLSearchParams()

      if (filters.city?.trim()) {
        queryParams.set('city', filters.city.trim())
      }

      if (filters.area?.trim()) {
        queryParams.set('area', filters.area.trim())
      }

      if (filters.bloodGroup) {
        queryParams.set('bloodGroup', filters.bloodGroup)
      }

      const queryString = queryParams.toString()

      const url = queryString
        ? `${API_URL}?${queryString}`
        : API_URL

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch registered donors.'
        )
      }

      setDonors(data.donors || [])
    } catch (err) {
      setDonors([])
      setError(
        err.message ||
          'Unable to connect to the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Load donors when page opens
  useEffect(() => {
    fetchDonors({
      bloodGroup: initialGroup,
    })
  }, [fetchDonors, initialGroup])

  // Search donors
  const handleSearch = (event) => {
    event.preventDefault()

    fetchDonors({
      city,
      area,
      bloodGroup,
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setCity('')
    setArea('')
    setBloodGroup('')

    fetchDonors({})
  }

  return (
    <PageContainer>
      <PageHeader
        title="Find blood donors"
        text="Search registered donors by blood group, city and area."
      />

      {/* Search Filters */}
      <form
        onSubmit={handleSearch}
        className="card mt-8 p-5 sm:p-6"
      >
        <p className="label" id="blood-group-label">
          Select blood group
        </p>

        <div
          role="group"
          aria-labelledby="blood-group-label"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            aria-pressed={bloodGroup === ''}
            onClick={() => setBloodGroup('')}
            className="chip"
          >
            All
          </button>

          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              aria-pressed={bloodGroup === group}
              onClick={() => setBloodGroup(group)}
              className="chip"
            >
              {formatGroup(group)}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* City */}
          <div>
            <label htmlFor="city" className="label">
              City
            </label>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                id="city"
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="e.g. Ahmedabad"
                className="field pl-10"
              />
            </div>
          </div>

          {/* Area */}
          <div>
            <label htmlFor="area" className="label">
              Area / Locality
            </label>

            <div className="relative">
              <MapPin
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                id="area"
                type="text"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="e.g. Maninagar"
                className="field pl-10"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            <Search size={16} />
            {loading ? 'Searching...' : 'Find donors'}
          </button>

          <button
            type="button"
            onClick={clearFilters}
            disabled={loading}
            className="btn btn-secondary"
          >
            <X size={16} />
            Clear filters
          </button>

          <button
            type="button"
            onClick={() =>
              fetchDonors({ city, area, bloodGroup })
            }
            disabled={loading}
            className="btn btn-secondary"
            aria-label="Refresh registered donors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-blood/30 bg-plasma p-4 text-sm text-blood-deep"
        >
          {error}
        </div>
      )}

      {/* Results Count */}
      <p
        className="mb-4 mt-8 text-sm text-muted"
        aria-live="polite"
      >
        {loading
          ? 'Loading donors...'
          : `${donors.length} ${
              donors.length === 1 ? 'donor' : 'donors'
            } found`}
      </p>

      {/* Donor Results */}
      {!loading && !error && donors.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {donors.map((donor) => (
            <li
              key={donor._id}
              className="card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    {donor.name || 'Registered donor'}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <MapPin size={16} className="shrink-0" />

                    <span>
                      {[donor.area, donor.city]
                        .filter(Boolean)
                        .join(', ') || 'Location not provided'}
                    </span>
                  </p>
                </div>

                <span className="shrink-0 rounded-lg bg-plasma px-3 py-2 font-bold text-blood">
                  {donor.bloodGroup || 'Not provided'}
                </span>
              </div>

              {donor.phone ? (
                <a
                  href={`tel:${donor.phone}`}
                  className="btn btn-primary btn-sm mt-5"
                >
                  <Phone size={16} />
                  Contact donor
                </a>
              ) : (
                <p className="mt-5 text-sm text-muted">
                  Contact number not provided
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Empty State */}
      {!loading && !error && donors.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={Droplet}
            title="No donors found"
            text="Try another blood group, city or area."
          />
        </div>
      )}
    </PageContainer>
  )
}

export default FindBlood