import { useEffect, useState } from 'react'
import { CheckCircle, MapPin } from 'lucide-react'
import { PageContainer, PageHeader } from '../components/ui'
import { BLOOD_GROUPS, formatGroup } from '../lib/blood'
import MapPicker from '../components/MapPicker'

const API_URL = 'http://localhost:5000/api/donors/profile'

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  bloodGroup: '',
  dateOfBirth: '',
  city: '',
  area: '',
  address: '',
  isAvailable: true,
  latitude: null,
  longitude: null,
}

// Latest allowed birth date = today minus 18 years
const getMaxDob = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().slice(0, 10)
}

function DonorProfile() {
  const token = localStorage.getItem('lifeflowToken')

  const [profile, setProfile] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Could not load your profile.')
        }

        setProfile({ ...emptyProfile, ...data.profile })
      } catch (err) {
        setError(err.message || 'Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [token])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleLocationSelect = ({ latitude, longitude }) => {
    setProfile((prev) => ({ ...prev, latitude, longitude }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (profile.latitude === null || profile.longitude === null) {
      setError('Please select your location on the map.')
      window.scrollTo(0, 0)
      return
    }

    setSaving(true)

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not save your profile.')
      }

      setProfile({ ...emptyProfile, ...data.profile })
      setSuccess('Your donor profile has been saved.')

      // Keep the name shown in the navbar / dashboard up to date
      try {
        const saved = JSON.parse(localStorage.getItem('lifeflowUser') || '{}')
        localStorage.setItem(
          'lifeflowUser',
          JSON.stringify({ ...saved, name: data.profile.name })
        )
      } catch {
        // ignore storage problems
      }
    } catch (err) {
      setError(err.message || 'Could not save your profile.')
    } finally {
      setSaving(false)
      window.scrollTo(0, 0)
    }
  }

  if (loading) {
    return (
      <PageContainer narrow>
        <p className="text-muted">Loading your profile...</p>
      </PageContainer>
    )
  }

  const hasLocation =
    profile.latitude !== null && profile.longitude !== null

  return (
    <PageContainer narrow>
      <PageHeader
        title="My donor profile"
        text="Keep your details and location up to date so nearby patients can find you."
      />

      {success && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
        >
          <CheckCircle size={20} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="card mt-6 space-y-7 p-6 sm:p-8"
      >
        {/* Personal details */}
        <fieldset className="space-y-5">
          <legend className="mb-4 text-lg font-semibold">
            Personal details
          </legend>

          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
              className="field"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                value={profile.email}
                readOnly
                disabled
                className="field opacity-70"
              />
              <p className="hint mt-1">Email is your login and cannot be changed here.</p>
            </div>

            <div>
              <label htmlFor="phone" className="label">Phone number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
                className="field"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div className="sm:max-w-xs">
            <label htmlFor="dateOfBirth" className="label">Date of birth</label>
            <input
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              value={profile.dateOfBirth}
              onChange={handleChange}
              required
              max={getMaxDob()}
              className="field"
            />
            <p className="hint mt-1">Donors must be between 18 and 65 years old.</p>
          </div>

          <div>
            <p className="label" id="group-label">Blood group</p>

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
                    checked={profile.bloodGroup === group}
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
        </fieldset>

        <hr className="border-line" />

        {/* Address */}
        <fieldset className="space-y-5">
          <legend className="mb-4 text-lg font-semibold">Address</legend>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="label">City</label>
              <input
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                required
                className="field"
              />
            </div>

            <div>
              <label htmlFor="area" className="label">Area</label>
              <input
                id="area"
                name="area"
                value={profile.area}
                onChange={handleChange}
                className="field"
                placeholder="Locality (optional)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="label">Full address</label>
            <textarea
              id="address"
              name="address"
              rows={2}
              value={profile.address}
              onChange={handleChange}
              required
              className="field"
              placeholder="House / street / landmark"
            />
          </div>
        </fieldset>

        <hr className="border-line" />

        {/* Location */}
        <fieldset className="space-y-3">
          <legend className="mb-1 flex items-center gap-2 text-lg font-semibold">
            <MapPin size={20} className="text-blood" />
            My location
          </legend>

          <p className="text-sm text-muted">
            Used only to find emergencies near you. Other users will see an
            approximate distance, not your exact point on the map.
          </p>

          <MapPicker
            initialPosition={
              hasLocation ? [profile.latitude, profile.longitude] : null
            }
            onLocationSelect={handleLocationSelect}
          />
        </fieldset>

        <hr className="border-line" />

        {/* Availability */}
        <fieldset>
          <legend className="mb-4 text-lg font-semibold">Availability</legend>

          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="isAvailable"
              checked={profile.isAvailable}
              onChange={handleChange}
              className="mt-1"
            />
            <span>
              I am available to donate blood right now. Untick this when you
              cannot donate (travelling, unwell, donated recently).
            </span>
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary w-full py-3.5"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </PageContainer>
  )
}

export default DonorProfile