
import { useState } from 'react'
import { Search, MapPin, Droplet, Phone } from 'lucide-react'

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
  const [bloodGroup, setBloodGroup] = useState('')
  const [city, setCity] = useState('')

  const filteredDonors = sampleDonors.filter((donor) => {
    const matchesBlood =
      bloodGroup === '' || donor.bloodGroup === bloodGroup

    const matchesCity =
      city.trim() === '' ||
      donor.city.toLowerCase().includes(city.trim().toLowerCase())

    return matchesBlood && matchesCity
  })

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Find Blood Donors
          </h1>

          <p className="mt-3 text-gray-600">
            Search sample donor profiles by blood group and city.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Blood Group
              </label>

              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              >
                <option value="">All Blood Groups</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                  (group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                City
              </label>

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setBloodGroup('')
              setCity('')
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            <Search size={18} />
            Clear Filters
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Donor Profiles
          </h2>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            {filteredDonors.length} found
          </span>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDonors.map((donor) => (
            <div
              key={donor.id}
              className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {donor.name}
                </h3>

                <span className="rounded-lg bg-red-100 px-3 py-2 text-lg font-bold text-red-700">
                  {donor.bloodGroup}
                </span>
              </div>

              <p className="mt-5 flex items-center gap-2 text-gray-600">
                <MapPin size={18} className="text-red-600" />
                {donor.city}
              </p>

              <p className="mt-3 flex items-center gap-2 text-gray-600">
                <Phone size={18} className="text-red-600" />
                {donor.phone}
              </p>

              <div className="mt-5 border-t pt-4">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
                    donor.available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Droplet size={16} />
                  {donor.available ? 'Available (Sample)' : 'Unavailable (Sample)'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredDonors.length === 0 && (
          <div className="mt-8 rounded-xl bg-white p-10 text-center shadow">
            <Search className="mx-auto text-gray-400" size={40} />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              No donors found
            </h3>
            <p className="mt-2 text-gray-500">
              Try another blood group or city.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Demo only: all donor names and contact details are sample data,
          not verified real donors.
        </p>
      </div>
    </section>
  )
}

export default FindBlood