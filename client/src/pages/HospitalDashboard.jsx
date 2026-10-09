import { Link } from 'react-router-dom'
import {
  Hospital,
  Droplet,
  ClipboardList,
  Search,
  PlusCircle,
  Clock,
  CheckCircle,
} from 'lucide-react'

function HospitalDashboard() {
  const stats = [
    {
      title: 'Blood Requests',
      value: '24',
      icon: ClipboardList,
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Available Units',
      value: '120',
      icon: Droplet,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Pending Requests',
      value: '08',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Completed Requests',
      value: '16',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
  ]

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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-red-600">
              <Hospital size={28} />
              <span className="font-semibold">LifeFlow</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800">
              Hospital Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Manage blood inventory and emergency requests.
            </p>
          </div>

          <Link
            to="/emergency-request"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            <PlusCircle size={20} />
            Create Request
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-gray-800">
                      {stat.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={25} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Blood Inventory */}
        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Blood Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Sample stock for all blood groups
              </p>
            </div>

            <Droplet className="text-red-600" size={28} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {bloodStock.map((blood) => (
              <div
                key={blood.group}
                className="rounded-lg border border-red-100 bg-red-50 p-4 text-center"
              >
                <div className="text-2xl font-bold text-red-600">
                  {blood.group}
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  {blood.units} units
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Link
              to="/find-blood"
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <Search className="mb-4 text-red-600" size={30} />

              <h3 className="font-bold text-gray-800">
                Find Blood Donors
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Search for donors by blood group.
              </p>
            </Link>

            <Link
              to="/show-requests"
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <ClipboardList
                className="mb-4 text-red-600"
                size={30}
              />

              <h3 className="font-bold text-gray-800">
                View Requests
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Review available blood requests.
              </p>
            </Link>

            <Link
              to="/emergency-request"
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <PlusCircle className="mb-4 text-red-600" size={30} />

              <h3 className="font-bold text-gray-800">
                Emergency Request
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create a request for urgent blood needs.
              </p>
            </Link>
          </div>
        </div>

        {/* Notice */}
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <h3 className="font-semibold text-red-700">
            Important Notice
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Please verify blood group, stock availability, and
            compatibility through your hospital's approved
            transfusion procedures before issuing blood.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HospitalDashboard