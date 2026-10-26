
import { useEffect, useState } from 'react'
import {
  CheckCircle,
  Droplet,
  Home,
  MapPin,
  User,
  Pencil,
  Phone,
  Mail,
  Calendar,
  X,
  Save,
  ShieldCheck,
} from 'lucide-react'

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

const getMaxDob = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().slice(0, 10)
}

function SectionLegend({ icon: Icon, children }) {
  return (
    <legend className="mb-4 flex items-center gap-2 text-lg font-semibold">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-plasma text-blood">
        <Icon size={17} />
      </span>
      {children}
    </legend>
  )
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-plasma text-blood">
        <Icon size={17} />
      </span>

      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="break-words font-medium">
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  )
}

function DonorProfile() {
  const token = localStorage.getItem('lifeflowToken')

  const [profile, setProfile] = useState(emptyProfile)
  const [originalProfile, setOriginalProfile] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Could not load your profile.')
        }

        const loadedProfile = {
          ...emptyProfile,
          ...data.profile,
        }

        setProfile(loadedProfile)
        setOriginalProfile(loadedProfile)

        // Only show the profile view when a profile has been completed.
        setIsEditing(!data.profile?.profileCompleted)
      } catch (err) {
        setError(err.message || 'Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }

    if (!token) {
      setError('Please log in to view your donor profile.')
      setLoading(false)
      return
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
    setProfile((prev) => ({
      ...prev,
      latitude,
      longitude,
    }))
  }

  const handleEdit = () => {
    setError('')
    setSuccess('')
    setOriginalProfile({ ...profile })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setProfile({ ...originalProfile })
    setError('')
    setSuccess('')
    setIsEditing(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (profile.latitude == null || profile.longitude == null) {
      setError('Please select your location on the map.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
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

      const savedProfile = {
        ...emptyProfile,
        ...data.profile,
      }

      setProfile(savedProfile)
      setOriginalProfile(savedProfile)
      setIsEditing(false)
      setSuccess('Your donor profile has been saved successfully.')

      // Keep the name in the navbar/dashboard up to date.
      try {
        const savedUser = JSON.parse(
          localStorage.getItem('lifeflowUser') || '{}'
        )

        localStorage.setItem(
          'lifeflowUser',
          JSON.stringify({
            ...savedUser,
            name: savedProfile.name,
          })
        )
      } catch {
        // Ignore local storage parsing errors.
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Could not save your profile.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
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
    profile.latitude != null && profile.longitude != null

  const hasCompletedProfile = Boolean(
    profile.profileCompleted ||
    (
      profile.name &&
      profile.phone &&
      profile.bloodGroup &&
      profile.dateOfBirth &&
      profile.city &&
      profile.address &&
      hasLocation
    )
  )

  return (
    <PageContainer narrow>
      <PageHeader
        title="My donor profile"
        text="Manage your personal details, location and donation availability."
      />

      {success && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-lg border border-ok/30 bg-ok-soft p-4 text-ok"
        >
          <CheckCircle size={20} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-blood/30 bg-plasma p-3 text-sm text-blood-deep"
        >
          {error}
        </p>
      )}

      {!isEditing && hasCompletedProfile ? (
        <div className="mt-6 space-y-6">
          {/* Profile header */}
          <section className="card overflow-hidden">
            <div className="bg-plasma p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-blood shadow-sm">
                  <User size={38} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {profile.name}
                    </h2>

                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ok">
                      <ShieldCheck size={14} />
                      Donor
                    </span>
                  </div>

                  <p className="mt-1 break-words text-sm text-muted">
                    {profile.city}
                    {profile.area ? `, ${profile.area}` : ''}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blood px-4 py-2 font-bold text-white">
                      <Droplet size={17} />
                      {formatGroup(profile.bloodGroup)}
                    </span>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        profile.isAvailable
                          ? 'bg-ok-soft text-ok'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {profile.isAvailable
                        ? 'Available to donate'
                        : 'Currently unavailable'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEdit}
                  className="btn btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
              <Detail
                icon={Mail}
                label="Email address"
                value={profile.email}
              />

              <Detail
                icon={Phone}
                label="Phone number"
                value={profile.phone}
              />

              <Detail
                icon={Calendar}
                label="Date of birth"
                value={
                  profile.dateOfBirth
                    ? profile.dateOfBirth.slice(0, 10)
                    : ''
                }
              />

              <Detail
                icon={Home}
                label="City"
                value={profile.city}
              />

              <Detail
                icon={MapPin}
                label="Area"
                value={profile.area}
              />

              <Detail
                icon={Home}
                label="Full address"
                value={profile.address}
              />
            </div>
          </section>

          {/* Location card */}
          <section className="card space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-plasma text-blood">
                <MapPin size={20} />
              </span>

              <div>
                <h3 className="text-lg font-semibold">My saved location</h3>
                <p className="text-sm text-muted">
                  Used to find compatible nearby blood requests.
                </p>
              </div>
            </div>

            {hasLocation ? (
              <MapPicker
                initialPosition={[profile.latitude, profile.longitude]}
                onLocationSelect={() => {}}
                readOnly
              />
            ) : (
              <p className="text-sm text-muted">
                No location has been saved yet.
              </p>
            )}

            <p className="text-sm text-muted">
              Other users see an approximate location or distance, not your
              exact home address through nearby donor search.
            </p>
          </section>

          <button
            type="button"
            onClick={handleEdit}
            className="btn btn-primary inline-flex w-full items-center justify-center gap-2 py-3"
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="card mt-6 space-y-7 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              {hasCompletedProfile ? 'Edit your profile' : 'Complete your profile'}
            </h2>

            {hasCompletedProfile && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          <fieldset className="space-y-5">
            <SectionLegend icon={User}>Personal details</SectionLegend>

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
                <p className="hint mt-1">
                  Email is your login and cannot be changed here.
                </p>
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
              <label htmlFor="dateOfBirth" className="label">
                Date of birth
              </label>
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
              <p className="hint mt-1">
                Donors must be between 18 and 65 years old.
              </p>
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

          <fieldset className="space-y-5">
            <SectionLegend icon={Home}>Address</SectionLegend>

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

          <fieldset className="space-y-3">
            <SectionLegend icon={MapPin}>My location</SectionLegend>

            <p className="text-sm text-muted">
              Used to find emergencies near you. Other users see an approximate
              distance, not your exact point on the map.
            </p>

            <MapPicker
              initialPosition={
                hasLocation
                  ? [profile.latitude, profile.longitude]
                  : null
              }
              onLocationSelect={handleLocationSelect}
            />
          </fieldset>

          <hr className="border-line" />

          <fieldset>
            <SectionLegend icon={Droplet}>Availability</SectionLegend>

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

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary inline-flex flex-1 items-center justify-center gap-2 py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? 'Saving...' : 'Save profile'}
            </button>

            {hasCompletedProfile && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="btn btn-secondary inline-flex items-center justify-center gap-2 py-3.5"
              >
                <X size={17} />
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </PageContainer>
  )
}

export default DonorProfile
