import { Link, Navigate } from 'react-router-dom'
import {
  HeartPulse,
  UserRound,
  Droplet,
  ClipboardList,
  Search,
} from 'lucide-react'

function DonorDashboard() {
  // Get demo login information
  const savedUser = localStorage.getItem('lifeflowUser')

  let currentUser = null

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Redirect to the correct dashboard based on role
  if (currentUser.role !== 'donor') {
    const dashboardRoutes = {
      user: '/user-dashboard',
      hospital: '/hospital-dashboard',
      admin: '/admin-dashboard',
    }

    return (
      <Navigate
        to={dashboardRoutes[currentUser.role] || '/login'}
        replace
      />
    )
  }

  return (
    <div className="min-h-[70vh] bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Welcome Section */}
        <div className="rounded-2xl bg-red-600 p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <HeartPulse size={44} />

            <div>
              <h1 className="text-3xl font-bold">
                Donor Dashboard
              </h1>

              <p className="mt-2 text-red-100">
                Your donation can save someone's life.
              </p>

              <p className="mt-2 text-sm text-red-100">
                Logged in as: {currentUser.email}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* Donor Profile */}
          <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <UserRound size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              My Profile
            </h2>

            <p className="mt-2 text-gray-600">
              Manage your donor profile and personal details.
            </p>

            <button
              type="button"
              onClick={() =>
                alert('Donor profile feature will be added later.')
              }
              className="mt-5 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              View Profile
            </button>
          </div>

          {/* Blood Requests */}
          <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <Search size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Blood Requests
            </h2>

            <p className="mt-2 text-gray-600">
              View emergency blood requests and find people who need help.
            </p>

            <Link
              to="/show-requests"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              View Requests
            </Link>
          </div>

          {/* Donation History */}
          <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <ClipboardList size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Donation History
            </h2>

            <p className="mt-2 text-gray-600">
              Review your blood donation records.
            </p>

            <Link
              to="/donation-history"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              View History
            </Link>
          </div>

          {/* Blood Information */}
          <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <Droplet size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Blood Information
            </h2>

            <p className="mt-2 text-gray-600">
              Explore blood groups and donor information.
            </p>

            <Link
              to="/find-blood"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Explore
            </Link>
          </div>

        </div>

        {/* Donation Reminder */}
        <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-700">
            Be Someone's Hero ❤️
          </h2>

          <p className="mt-2 text-gray-700">
            Your willingness to donate blood can make a meaningful
            difference in someone's life.
          </p>
        </div>

      </div>
    </div>
  )
}

export default DonorDashboard