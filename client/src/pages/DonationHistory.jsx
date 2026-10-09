
import { useState } from 'react'
import { Droplet, CalendarDays, MapPin, Clock } from 'lucide-react'

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
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Donation History
        </h1>

        <p className="mt-2 text-gray-600">
          Review your past blood donation activity.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              Total Donations
            </p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {sampleDonations.length}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              Total Units Donated
            </p>
            <h2 className="mt-2 text-3xl font-bold text-red-600">
              {totalUnits}
            </h2>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Past Donations
          </h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3"
          >
            <option value="All">All Donations</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="mt-5 space-y-4">
          {filteredDonations.map((donation) => (
            <div
              key={donation.id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-red-100 p-3">
                    <Droplet className="text-red-600" size={28} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Blood Donation
                    </h3>

                    <p className="mt-1 text-gray-600">
                      Blood Group: {donation.bloodGroup}
                    </p>

                    <p className="mt-1 text-gray-600">
                      Units donated: {donation.units}
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  {donation.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 border-t pt-4 text-sm text-gray-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <CalendarDays size={17} className="text-red-600" />
                  {donation.date}
                </p>

                <p className="flex items-center gap-2">
                  <MapPin size={17} className="text-red-600" />
                  {donation.hospital}, {donation.city}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredDonations.length === 0 && (
          <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
            <Clock className="mx-auto text-gray-400" size={36} />
            <p className="mt-3 text-gray-600">
              No donations found.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Demo only: all donation records are sample data, not actual donation history.
        </p>
      </div>
    </section>
  )
}

export default DonationHistory