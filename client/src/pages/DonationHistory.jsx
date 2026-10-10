import { useState } from 'react'
import { Droplet, CalendarDays, Hospital, Clock } from 'lucide-react'
import {
  BloodTag,
  DemoNote,
  EmptyState,
  PageContainer,
  PageHeader,
  Pill,
} from '../components/ui'

const sampleDonations = [
  {
    id: 1,
    date: '2026-09-15',
    bloodGroup: 'O+',
    units: 1,
    hospital: 'Civil Hospital',
    city: 'Ahmedabad',
    status: 'Completed',
  },
  {
    id: 2,
    date: '2026-07-20',
    bloodGroup: 'O+',
    units: 1,
    hospital: 'Sterling Hospital',
    city: 'Ahmedabad',
    status: 'Completed',
  },
  {
    id: 3,
    date: '2026-05-10',
    bloodGroup: 'O+',
    units: 1,
    hospital: 'General Hospital',
    city: 'Gandhinagar',
    status: 'Completed',
  },
]

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function DonationHistory() {
  const [filter, setFilter] = useState('All')

  const filteredDonations =
    filter === 'All'
      ? sampleDonations
      : sampleDonations.filter((donation) => donation.status === filter)

  const totalUnits = sampleDonations.reduce(
    (total, donation) => total + donation.units,
    0
  )

  return (
    <PageContainer>
      <PageHeader
        title="Donation history"
        text="Review your past blood donation activity."
      />

      <dl className="card mt-8 grid grid-cols-2 overflow-hidden">
        <div className="p-5 sm:p-6">
          <dt className="text-sm text-muted">Total donations</dt>
          <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-blood">
            {sampleDonations.length}
          </dd>
        </div>

        <div className="border-l border-line p-5 sm:p-6">
          <dt className="text-sm text-muted">Total units donated</dt>
          <dd className="mt-1 font-display text-3xl font-bold tabular-nums text-blood">
            {totalUnits}
          </dd>
        </div>
      </dl>

      <div className="mb-4 mt-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Past donations</h2>

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
      </div>

      <ul className="space-y-3">
        {filteredDonations.map((donation) => (
          <li
            key={donation.id}
            className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
          >
            <BloodTag group={donation.bloodGroup} size="lg" />

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold">Blood donation</h3>

              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted">
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-blood" />
                  {formatDate(donation.date)}
                </span>

                <span className="flex items-center gap-2">
                  <Hospital size={16} className="text-blood" />
                  {donation.hospital}, {donation.city}
                </span>

                <span className="flex items-center gap-2">
                  <Droplet size={16} className="text-blood" />
                  {donation.units} {donation.units === 1 ? 'unit' : 'units'}
                </span>
              </div>
            </div>

            <Pill tone="ok">{donation.status}</Pill>
          </li>
        ))}
      </ul>

      {filteredDonations.length === 0 && (
        <EmptyState
          icon={Clock}
          title="No donations found"
          text="Donations you complete will appear here."
        />
      )}

      <DemoNote>
        Demo data: all donation records are samples, not actual donation
        history.
      </DemoNote>
    </PageContainer>
  )
}

export default DonationHistory
