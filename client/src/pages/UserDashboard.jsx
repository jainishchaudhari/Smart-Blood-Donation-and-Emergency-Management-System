import { Link, Navigate } from 'react-router-dom'
import { Search, ClipboardList, HeartPulse } from 'lucide-react'

function UserDashboard() {
  // Check demo login information
  const savedUser = localStorage.getItem('lifeflowUser')

  let currentUser = null

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  // Redirect if user is not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Only users can access this dashboard
  if (currentUser.role !== 'user') {
    const dashboardRoutes = {
      donor: '/donor-dashboard',
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

        {/* Welcome Banner */}
        <div className="rounded-2xl bg-red-600 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome to LifeFlow 🩸
          </h1>

          <p className="mt-3 text-red-100">
            Your dashboard to find blood and manage emergency requests.
          </p>

          <p className="mt-2 text-sm text-red-100">
            Logged in as: {currentUser.email}
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* Find Blood */}
          <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <Search size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Find Blood
            </h2>

            <p className="mt-2 text-gray-600">
              Search for donors by blood group and city.
            </p>

            <Link
              to="/find-blood"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Find Donors
            </Link>
          </div>

          {/* Emergency Request */}
          <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <HeartPulse size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Emergency Request
            </h2>

            <p className="mt-2 text-gray-600">
              Submit an urgent blood requirement.
            </p>

            <Link
              to="/emergency-request"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Create Request
            </Link>
          </div>

          {/* Blood Requests */}
          <div className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
            <ClipboardList size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Blood Requests
            </h2>

            <p className="mt-2 text-gray-600">
              View available emergency blood requests.
            </p>

            <Link
              to="/show-requests"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              View Requests
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default UserDashboard