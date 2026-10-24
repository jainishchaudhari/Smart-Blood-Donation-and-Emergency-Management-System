import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Hospital, Droplet, MapPin } from 'lucide-react'
import {
  BloodTag,
  PageContainer,
  PageHeader,
} from '../components/ui'
import { BLOOD_GROUPS, formatGroup } from '../lib/blood'
import MapPicker from '../components/MapPicker'

const API_URL = 'http://localhost:5000/api/requests'

// Backend stores urgency in lowercase: low / medium / high / critical
const URGENCY_TO_API = { Critical: 'critical', High: 'high', Normal: 'medium' }

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
  area: '',
  contact: '',
  urgency: 'High',
  patientAge: '',
  patientGender: '',
  medicalCondition: '',
  attendantName: '',
  alternateContact: '',
  hospitalAddress: '',
  requiredBy: '',
  notes: '',
  consent: false,
  latitude: null,
  longitude: null,
}

function EmergencyRequest() {
  const [formData, setFormData] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleLocationSelect = ({ latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (formData.latitude === null || formData.longitude === null) {
      setSubmitError('Please select the hospital location on the map.')
      return
    }

    const token = localStorage.getItem('lifeflowToken')

    if (!token) {
      setSubmitError('Please log in before submitting a request.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientName: formData.patientName,
          bloodGroup: formData.bloodGroup,
          units: Number(formData.units),
          hospitalName: formData.hospital,
          city: formData.city,
          area: formData.area,
          latitude: formData.latitude ?? undefined,
          longitude: formData.longitude ?? undefined,
          contactNumber: formData.contact,
          patientAge: formData.patientAge,
          patientGender: formData.patientGender,
          medicalCondition: formData.medicalCondition,
          hospitalAddress: formData.hospitalAddress,
          attendantName: formData.attendantName,
          alternateContact: formData.alternateContact,
          requiredBy: formData.requiredBy
            ? new Date(formData.requiredBy).toISOString()
            : undefined,
          notes: formData.notes,
          urgency: URGENCY_TO_API[formData.urgency] || 'medium',
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Could not submit the request.')
      }

      setSubmitted(true)
      window.scrollTo(0, 0)
    } catch (err) {
      setSubmitError(err.message || 'Could not submit the request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(emptyForm)
    setSubmitted(false)
    setSubmitError('')
    window.scrollTo(0, 0)
  }

  if (submitted) {
    return (
      <PageContainer narrow>
        <div className="card p-6 sm:p-8">
          <CheckCircle className="text-ok" size={40} />

          <h1 className="mt-4 text-3xl font-bold">
            Request submitted
          </h1>

          <p className="mt-2 text-muted">
            Your request was saved for {formData.patientName}.
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-lg border border-line bg-paper p-4">
            <BloodTag group={formData.bloodGroup} size="lg" />

            <div className="text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <Droplet size={16} className="text-blood" />
                {formData.units}{' '}
                {Number(formData.units) === 1 ? 'unit' : 'units'},{' '}
                {formData.urgency} urgency
              </p>

              <p className="mt-1 flex items-center gap-2 text-muted">
                <Hospital size={16} />
                {formData.hospital}, {formData.area}, {formData.city}
              </p>

              <p className="mt-1 text-muted">
                Contact: {formData.contact}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1 rounded-lg border border-line bg-paper p-4 text-sm text-muted">
            {formData.patientAge && (
              <p>
                Patient: {formData.patientAge} yrs
                {formData.patientGender ? `, ${formData.patientGender}` : ''}
              </p>
            )}
            {formData.medicalCondition && (
              <p>Reason: {formData.medicalCondition}</p>
            )}
            {formData.requiredBy && (
              <p>
                Required by:{' '}
                {new Date(formData.requiredBy).toLocaleString('en-IN')}
              </p>
            )}
            {formData.attendantName && (
              <p>Contact person: {formData.attendantName}</p>
            )}
            {formData.alternateContact && (
              <p>Alternate contact: {formData.alternateContact}</p>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-line bg-paper p-4">
            <p className="flex items-center gap-2 font-semibold">
              <MapPin size={17} className="text-blood" />
              Selected hospital coordinates
            </p>

            {formData.latitude !== null &&
            formData.longitude !== null ? (
              <div className="mt-2 text-sm text-muted">
                <p>Latitude: {formData.latitude.toFixed(6)}</p>
                <p>Longitude: {formData.longitude.toFixed(6)}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No map location selected.
              </p>
            )}
          </div>

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

      <form
        onSubmit={handleSubmit}
        className="card mt-8 space-y-7 p-6 sm:p-8"
      >
        {/* Patient details */}
        <fieldset className="space-y-5">
          <legend className="mb-4 text-lg font-semibold">
            Patient
          </legend>

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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="patientAge" className="label">
                Patient age
              </label>

              <input
                id="patientAge"
                type="number"
                name="patientAge"
                min="0"
                max="120"
                value={formData.patientAge}
                onChange={handleChange}
                className="field"
                placeholder="Age in years"
              />
            </div>

            <div>
              <label htmlFor="patientGender" className="label">
                Gender
              </label>

              <select
                id="patientGender"
                name="patientGender"
                value={formData.patientGender}
                onChange={handleChange}
                className="field"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="medicalCondition" className="label">
              Reason / medical condition
            </label>

            <input
              id="medicalCondition"
              name="medicalCondition"
              value={formData.medicalCondition}
              onChange={handleChange}
              className="field"
              placeholder="e.g. Accident, surgery, dengue, thalassemia"
            />
          </div>

          <div>
            <label htmlFor="requiredBy" className="label">
              Blood required by
            </label>

            <input
              id="requiredBy"
              type="datetime-local"
              name="requiredBy"
              value={formData.requiredBy}
              onChange={handleChange}
              required
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)}
              className="field"
            />
          </div>
        </fieldset>

        <hr className="border-line" />

        {/* Hospital details and map */}
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

          <div>
            <label htmlFor="hospitalAddress" className="label">
              Hospital address
            </label>

            <textarea
              id="hospitalAddress"
              name="hospitalAddress"
              rows={2}
              value={formData.hospitalAddress}
              onChange={handleChange}
              className="field"
              placeholder="Street, landmark, ward / floor"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="attendantName" className="label">
                Contact person name
              </label>

              <input
                id="attendantName"
                name="attendantName"
                value={formData.attendantName}
                onChange={handleChange}
                className="field"
                placeholder="Relative / attendant name"
              />
            </div>

            <div>
              <label htmlFor="alternateContact" className="label">
                Alternate contact number
              </label>

              <input
                id="alternateContact"
                type="tel"
                name="alternateContact"
                value={formData.alternateContact}
                onChange={handleChange}
                className="field"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="sm:max-w-xs">
            <label htmlFor="area" className="label">
              Area
            </label>

            <input
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              className="field"
              placeholder="Enter area / locality"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <MapPin size={20} className="text-blood" />
                Select Hospital Location
              </h2>

              <p className="mt-1 text-sm text-muted">
                Click on the map, drag the marker, or use your current
                location to select the hospital coordinates.
              </p>
            </div>

            <MapPicker
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </fieldset>

        <hr className="border-line" />

        {/* Urgency */}
        <fieldset>
          <legend className="mb-4 text-lg font-semibold">
            Urgency
          </legend>

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
                  <span className="block font-semibold">
                    {level.value}
                  </span>

                  <span className="block text-sm text-muted">
                    {level.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <hr className="border-line" />

        <fieldset className="space-y-5">
          <legend className="mb-4 text-lg font-semibold">
            Additional information
          </legend>

          <div>
            <label htmlFor="notes" className="label">
              Notes for donors
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="field"
              placeholder="Any extra details: ward number, doctor name, whether platelets are needed, etc."
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              required
              className="mt-1"
            />

            <span>
              I confirm that this request is genuine and I agree to share
              these details with donors and hospitals.
            </span>
          </label>
        </fieldset>

        {submitError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full py-3.5"
        >
          {submitting ? 'Submitting...' : 'Submit emergency request'}
        </button>
      </form>
    </PageContainer>
  )
}

export default EmergencyRequest