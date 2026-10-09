
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

function EmergencyRequest() {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    units: '',
    hospital: '',
    city: '',
    contact: '',
    urgency: 'High',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Emergency request form submitted!')
    console.log(formData)
  }

  return (
    <section className="min-h-screen bg-red-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <AlertTriangle className="mx-auto mb-3 text-red-600" size={42} />
          <h1 className="text-3xl font-bold text-gray-900">
            Emergency Blood Request
          </h1>
          <p className="mt-2 text-gray-600">
            Enter the details to request blood urgently.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block font-medium">Patient Name</label>
            <input
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="Enter patient name"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="">Select group</option>
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
              <label className="mb-1 block font-medium">Units Required</label>
              <input
                type="number"
                name="units"
                min="1"
                value={formData.units}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Number of units"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium">Hospital Name</label>
            <input
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="Enter hospital name"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="Enter contact number"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium">Urgency Level</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Submit Emergency Request
          </button>
        </form>
      </div>
    </section>
  )
}

export default EmergencyRequest