import { Link } from 'react-router-dom'
import { Droplet, Search, ClipboardList, HeartPulse } from 'lucide-react'

function UserDashboard() {
  return (
    <div className="min-h-[70vh] bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="rounded-2xl bg-red-600 p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome to LifeFlow 🩸
          </h1>

          <p className="mt-3 text-red-100">
            Your dashboard to find blood and manage emergency requests.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow">
            <Search size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Find Blood
            </h2>

            <p className="mt-2 text-gray-600">
              Search for donors by blood group and city.
            </p>

            <Link
              to="/find-blood"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Find Donors
            </Link>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <HeartPulse size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Emergency Request
            </h2>

            <p className="mt-2 text-gray-600">
              Submit an urgent blood requirement.
            </p>

            <Link
              to="/emergency-request"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Create Request
            </Link>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <ClipboardList size={32} className="text-red-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Blood Requests
            </h2>

            <p className="mt-2 text-gray-600">
              View available sample emergency requests.
            </p>

            <Link
              to="/show-requests"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
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