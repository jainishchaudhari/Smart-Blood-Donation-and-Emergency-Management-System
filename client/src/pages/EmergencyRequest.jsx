import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Hospital, Droplet } from 'lucide-react'
import {
  BloodTag,
  PageContainer,
  PageHeader,
} from '../components/ui'
import { BLOOD_GROUPS, formatGroup } from '../lib/blood'

const urgencyLevels = [
  { value: 'Critical', hint: 'Immediate need' },
  { value: 'High', hint: 'Same-day need' },
  { value: 'Normal', hint: 'Planned need' },
]

const emptyForm = {
  patientName: '',
  bloodGroup: '',
  units: '',
  hospital: '',
  city: '',
  contact: '',
  urgency: 'High',
}

function EmergencyRequest() {
  const [formData, setFormData] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
    setSubmitted(true)
    window.scrollTo(0, 0)
  }

  const handleReset = () => {
    setFormData(emptyForm)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <PageContainer narrow>
        <div className="card p-6 sm:p-8">
          <CheckCircle className="text-ok" size={40} />

          <h1 className="mt-4 text-3xl font-bold">Request submitted</h1>
          <p className="mt-2 text-muted">
            Here is what you entered for {formData.patientName}.
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-lg border border-line bg-paper p-4">
            <BloodTag group={formData.bloodGroup} size="lg" />

            <div className="text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <Droplet size={16} className="text-blood" />
                {formData.units} {Number(formData.units) === 1 ? 'unit' : 'units'},{' '}
                {formData.urgency} urgency
              </p>
              <p className="mt-1 flex items-center gap-2 text-muted">
                <Hospital size={16} />
                {formData.hospital}, {formData.city}
              </p>
              <p className="mt-1 text-muted">Contact: {formData.contact}</p>
            </div>
          </div>

          <p className="hint">
            Demo only: this request is not sent to the backend yet.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/show-requests" className="btn btn-primary">
              View all requests
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
            >
              Submit another
            </button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer narrow>
      <PageHeader
        title="Emergency blood request"
        text="Enter the details so donors and hospitals can respond."
      />

      <form onSubmit={handleSubmit} className="card mt-8 space-y-7 p-6 sm:p-8">
        {/* Patient */}
        <fieldset className="space-y-5">
          <legend className="mb-4 text-lg font-semibold">Patient</legend>

          <div>
            <label htmlFor="patientName" className="label">
              Patient name
            </label>
            <input
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              className="field"
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <p className="label" id="group-label">
              Blood group
            </p>

            <div
              role="radiogroup"
              aria-labelledby="group-label"
              className="flex flex-wrap gap-2"
            >
              {BLOOD_GROUPS.map((group, index) => (
                <label key={group} className="cursor-pointer">
                  <input
                    type="radio"
                    name="bloodGroup"
                    value={group}
                    checked={formData.bloodGroup === group}
                    onChange={handleChange}
                    required={index === 0}
                    className="peer sr-only"
                  />
                  <span className="chip px-4 py-2.5 peer-checked:border-blood peer-checked:bg-blood peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blood">
                    {formatGroup(group)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="sm:max-w-xs">
            <label htmlFor="units" className="label">
              Units required
            </label>
            <input
              id="units"
              type="number"
              name="units"
              min="1"
              value={formData.units}
              onChange={handleChange}
              required
              className="field"
              placeholder="Number of units"
            />
          </div>
        </fieldset>

        <hr className="border-line" />

        {/* Location */}
        <fieldset className="space-y-5">
          <legend className="mb-4 text-lg font-semibold">
            Hospital and contact
          </legend>

          <div>
            <label htmlFor="hospital" className="label">
              Hospital name
            </label>
            <input
              id="hospital"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              required
              className="field"
              placeholder="Enter hospital name"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="label">
                City
              </label>
              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="field"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label htmlFor="contact" className="label">
                Contact number
              </label>
              <input
                id="contact"
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                autoComplete="tel"
                className="field"
                placeholder="Enter contact number"
              />
            </div>
          </div>
        </fieldset>

        <hr className="border-line" />

        {/* Urgency */}
        <fieldset>
          <legend className="mb-4 text-lg font-semibold">Urgency</legend>

          <div className="grid gap-3 sm:grid-cols-3">
            {urgencyLevels.map((level) => (
              <label key={level.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="urgency"
                  value={level.value}
                  checked={formData.urgency === level.value}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <span className="block h-full rounded-lg border border-ink/20 bg-white p-3 transition-colors hover:border-ink/40 peer-checked:border-blood peer-checked:bg-plasma peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blood">
                  <span className="block font-semibold">{level.value}</span>
                  <span className="block text-sm text-muted">{level.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn btn-primary w-full py-3.5">
          Submit emergency request
        </button>
      </form>
    </PageContainer>
  )
}

export default EmergencyRequest
