
import { Link } from 'react-router-dom'

function Dashboard() {
  return (
    <div className="min-h-[70vh] bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to LifeFlow 🩸
        </h1>

        <p className="mt-2 text-gray-600">
          Smart Blood Donation and Emergency Management System
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Find Blood */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-red-600">
              Find Blood
            </h2>

            <p className="mt-2 text-gray-600">
              Search for potential blood donors by blood group and city.
            </p>

            <Link
              to="/find-blood"
              className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Find Donors
            </Link>
          </div>

          {/* Emergency Request */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-red-600">
              Emergency Request
            </h2>

            <p className="mt-2 text-gray-600">
              Create an urgent blood request or view sample requests.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/emergency-request"
                className="inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
              >
                Create Request
              </Link>

              <Link
                to="/show-requests"
                className="inline-block rounded-lg border border-red-600 px-5 py-3 font-semibold text-red-600 hover:bg-red-50"
              >
                Show All Requests
              </Link>
            </div>
          </div>

          {/* Donation History */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-red-600">
              Donation History
            </h2>

            <p className="mt-2 text-gray-600">
              View sample donation records and donation activity.
            </p>

            <Link
              to="/donation-history"
              className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard