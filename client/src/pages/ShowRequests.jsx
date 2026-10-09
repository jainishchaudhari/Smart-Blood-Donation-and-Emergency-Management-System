
import { Link } from 'react-router-dom'
import { AlertCircle, MapPin, Droplet, Phone } from 'lucide-react'

const sampleRequests = [
  {
    id: 1,
    patientName: 'Rahul Patel',
    bloodGroup: 'O+',
    units: 2,
    hospital: 'Civil Hospital',
    city: 'Ahmedabad',
    contact: '9876543210',
    urgency: 'Critical',
    date: '2026-10-09',
  },
  {
    id: 2,
    patientName: 'Priya Shah',
    bloodGroup: 'B+',
    units: 1,
    hospital: 'Sterling Hospital',
    city: 'Ahmedabad',
    contact: '9876501234',
    urgency: 'High',
    date: '2026-10-08',
  },
  {
    id: 3,
    patientName: 'Amit Desai',
    bloodGroup: 'A-',
    units: 3,
    hospital: 'General Hospital',
    city: 'Gandhinagar',
    contact: '9898012345',
    urgency: 'Normal',
    date: '2026-10-07',
  },
]

function ShowRequests() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Emergency Blood Requests
            </h1>
            <p className="mt-2 text-gray-600">
              View blood requests that need attention.
            </p>
          </div>

          <Link
            to="/emergency-request"
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            + Create Request
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Demo data: these requests are sample entries, not real patient requests.
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {request.patientName}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Request #{request.id}
                  </p>
                </div>

                <span className="rounded-lg bg-red-100 px-3 py-2 text-lg font-bold text-red-700">
                  {request.bloodGroup}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-gray-600">
                <p className="flex items-center gap-2">
                  <Droplet size={18} className="text-red-600" />
                  {request.units} unit(s) required
                </p>

                <p className="flex items-start gap-2">
                  <MapPin size={18} className="mt-1 shrink-0 text-red-600" />
                  <span>
                    {request.hospital}
                    <br />
                    {request.city}
                  </span>
                </p>

                <p className="flex items-center gap-2">
                  <Phone size={18} className="text-red-600" />
                  {request.contact}
                </p>

                <p className="text-sm">Date: {request.date}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    request.urgency === 'Critical'
                      ? 'bg-red-100 text-red-700'
                      : request.urgency === 'High'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {request.urgency}
                </span>

                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <AlertCircle size={16} />
                  Demo
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ShowRequests