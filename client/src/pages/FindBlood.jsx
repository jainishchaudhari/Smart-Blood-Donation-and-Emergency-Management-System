import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, MapPin, Phone, X } from 'lucide-react'
import {
  BloodTag,
  DemoNote,
  EmptyState,
  PageContainer,
  PageHeader,
  Pill,
} from '../components/ui'
import { BLOOD_GROUPS, CAN_RECEIVE_FROM, formatGroup } from '../lib/blood'

const sampleDonors = [
  {
    id: 1,
    name: 'Karan Patel',
    bloodGroup: 'O+',
    city: 'Ahmedabad',
    phone: '9876543210',
    available: true,
  },
  {
    id: 2,
    name: 'Neha Shah',
    bloodGroup: 'B+',
    city: 'Gandhinagar',
    phone: '9876501234',
    available: true,
  },
  {
    id: 3,
    name: 'Aarav Desai',
    bloodGroup: 'A-',
    city: 'Ahmedabad',
    phone: '9898012345',
    available: false,
  },
  {
    id: 4,
    name: 'Diya Mehta',
    bloodGroup: 'AB+',
    city: 'Surat',
    phone: '9876123450',
    available: true,
  },
  {
    id: 5,
    name: 'Rohan Joshi',
    bloodGroup: 'O-',
    city: 'Vadodara',
    phone: '9898123456',
    available: true,
  },
]

function FindBlood() {
  const [params] = useSearchParams()

  const initialGroup = BLOOD_GROUPS.includes(params.get('group'))
    ? params.get('group')
    : ''

  const [bloodGroup, setBloodGroup] = useState(initialGroup)
  const [includeCompatible, setIncludeCompatible] = useState(
    params.get('compatible') === '1'
  )
  const [city, setCity] = useState('')

  const filteredDonors = sampleDonors
    .filter((donor) => {
      const matchesBlood =
        bloodGroup === '' ||
        (includeCompatible
          ? CAN_RECEIVE_FROM[bloodGroup].includes(donor.bloodGroup)
          : donor.bloodGroup === bloodGroup)

      const matchesCity =
        city.trim() === '' ||
        donor.city.toLowerCase().includes(city.trim().toLowerCase())

      return matchesBlood && matchesCity
    })
    // Available donors first
    .sort((a, b) => Number(b.available) - Number(a.available))

  const hasFilters = bloodGroup !== '' || city.trim() !== ''

  const clearFilters = () => {
    setBloodGroup('')
    setIncludeCompatible(false)
    setCity('')
  }

  return (
    <PageContainer>
      <PageHeader
        title="Find blood donors"
        text="Search donor profiles by blood group and city."
      />

      {/* Filters */}
      <div className="card mt-8 p-5 sm:p-6">
        <p className="label" id="group-label">
          Blood group needed
        </p>

        <div
          role="group"
          aria-labelledby="group-label"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            aria-pressed={bloodGroup === ''}
            onClick={() => {
              setBloodGroup('')
              setIncludeCompatible(false)
            }}
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

        {bloodGroup !== '' && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={includeCompatible}
              onChange={(e) => setIncludeCompatible(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-blood"
            />
            <span>
              Include compatible groups for a {formatGroup(bloodGroup)}{' '}
              patient
              <span className="block text-muted">
                {CAN_RECEIVE_FROM[bloodGroup].map(formatGroup).join(', ')}
              </span>
            </span>
          </label>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search by city, e.g. Surat"
                className="field pl-10"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              <X size={16} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <p className="mb-4 mt-8 text-sm text-muted" aria-live="polite">
        <span className="font-semibold text-ink">{filteredDonors.length}</span>{' '}
        {filteredDonors.length === 1 ? 'donor' : 'donors'} found
      </p>

      <ul className="grid gap-4 md:grid-cols-2">
        {filteredDonors.map((donor) => (
          <li
            key={donor.id}
            className={`card flex items-center gap-4 p-5 ${
              donor.available ? '' : 'bg-paper'
            }`}
          >
            <BloodTag group={donor.bloodGroup} size="lg" />

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold">{donor.name}</h2>

              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={15} className="shrink-0" />
                {donor.city}
              </p>

              <div className="mt-2">
                <Pill tone={donor.available ? 'ok' : 'neutral'}>
                  {donor.available ? 'Available' : 'Unavailable'}
                </Pill>
              </div>
            </div>

            {donor.available && (
              <a
                href={`tel:${donor.phone}`}
                className="btn btn-primary btn-sm shrink-0"
                aria-label={`Call ${donor.name}`}
              >
                <Phone size={16} />
                Call
              </a>
            )}
          </li>
        ))}
      </ul>

      {filteredDonors.length === 0 && (
        <EmptyState
          icon={Search}
          title="No donors found"
          text="Try another blood group or city, or include compatible groups."
        />
      )}

      <DemoNote>
        Demo data: donor names and contact numbers are samples, not verified
        donors.
      </DemoNote>
    </PageContainer>
  )
}

export default FindBlood
