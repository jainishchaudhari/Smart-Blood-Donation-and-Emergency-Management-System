import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Users,
  HeartPulse,
  ClipboardList,
  Droplet,
} from 'lucide-react'

function AdminDashboard() {
  const stats = [
    {
      title: 'Total Users',
      count: '120',
      icon: Users,
    },
    {
      title: 'Registered Donors',
      count: '85',
      icon: HeartPulse,
    },
    {
      title: 'Blood Requests',
      count: '24',
      icon: ClipboardList,
    },
    {
      title: 'Blood Groups',
      count: '8',
      icon: Droplet,
    },
  ]

  return (
    <div className="min-h-[70vh] bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Welcome Section */}
        <div className="rounded-2xl bg-gray-900 p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <ShieldCheck size={44} className="text-red-400" />

            <div>
              <h1 className="text-3xl font-bold">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-gray-300">
                Manage LifeFlow users, donors and emergency requests.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.title}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <Icon size={28} className="text-red-600" />
                </div>

                <h2 className="mt-3 text-3xl font-bold text-gray-900">
                  {stat.count}
                </h2>
              </div>
            )
          })}
        </div>

        {/* Management Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* User Management */}
          <div className="rounded-xl bg-white p-6 shadow">
            <Users size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold">
              User Management
            </h2>

            <p className="mt-2 text-gray-600">
              Manage registered users and their accounts.
            </p>

            <button
              type="button"
              onClick={() =>
                alert('User management will be added later.')
              }
              className="mt-5 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Manage Users
            </button>
          </div>

          {/* Donor Management */}
          <div className="rounded-xl bg-white p-6 shadow">
            <HeartPulse size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Donor Management
            </h2>

            <p className="mt-2 text-gray-600">
              Review registered blood donors.
            </p>

            <Link
              to="/find-blood"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              View Donors
            </Link>
          </div>

          {/* Request Management */}
          <div className="rounded-xl bg-white p-6 shadow">
            <ClipboardList size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Emergency Requests
            </h2>

            <p className="mt-2 text-gray-600">
              Review current sample blood requests.
            </p>

            <Link
              to="/show-requests"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              View Requests
            </Link>
          </div>

        </div>

        {/* Admin Notice */}
        <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="font-bold text-yellow-800">
            Development Mode
          </h2>

          <p className="mt-2 text-sm text-yellow-700">
            Statistics are sample values. Actual user, donor and request
            data will be connected through the backend later.
          </p>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard