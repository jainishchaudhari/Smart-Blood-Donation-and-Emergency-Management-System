import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Hospital, Users } from 'lucide-react'
import { BloodTag } from '../components/ui'
import Rings from '../components/Rings'
import { BLOOD_GROUPS, CAN_RECEIVE_FROM, formatGroup } from '../lib/blood'

const steps = [
  {
    title: 'Post the request',
    text: 'Add the patient details and pick the hospital on the map.',
  },
  {
    title: 'Nearby donors are found',
    text: 'LifeFlow lists available donors with a compatible blood group, closest first.',
  },
  {
    title: 'Donors reply',
    text: 'Each donor accepts or declines. If nobody accepts, contact the next nearest donor.',
  },
  {
    title: 'The donation is completed',
    text: 'Mark the request as completed once the blood has been donated.',
  },
]

const audiences = [
  {
    icon: Users,
    title: 'Patients and families',
    text: 'Post an emergency request with the hospital location and see which donors are close by.',
  },
  {
    icon: HeartPulse,
    title: 'Donors',
    text: 'Save your location and availability, and get requests from hospitals near you.',
  },
  {
    icon: Hospital,
    title: 'Hospitals and blood banks',
    text: 'Track blood stock for every group and spot low levels early.',
  },
]

function Home() {
  const navigate = useNavigate()
  const [group, setGroup] = useState('O+')

  const handleFindBlood = (target = '/find-blood') => {
    const savedUser = localStorage.getItem('lifeflowUser')

    if (!savedUser) {
      navigate('/login')
      return
    }

    try {
      const currentUser = JSON.parse(savedUser)

      if (currentUser?.role) {
        navigate(target)
      } else {
        localStorage.removeItem('lifeflowUser')
        navigate('/login')
      }
    } catch {
      localStorage.removeItem('lifeflowUser')
      navigate('/login')
    }
  }

  const handleBecomeDonor = () => {
    const savedUser = localStorage.getItem('lifeflowUser')

    if (!savedUser) {
      navigate('/login')
      return
    }

    try {
      const currentUser = JSON.parse(savedUser)

      if (currentUser?.role === 'donor') {
        navigate('/donor-dashboard')
      } else if (currentUser?.role) {
        navigate('/register')
      } else {
        localStorage.removeItem('lifeflowUser')
        navigate('/login')
      }
    } catch {
      localStorage.removeItem('lifeflowUser')
      navigate('/login')
    }
  }

  const compatibleTarget = `/find-blood?group=${encodeURIComponent(
    group
  )}&compatible=1`

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl">
              Need blood urgently? We reach the nearest donors first.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-7 text-muted">
              Post a request with the hospital&apos;s location. LifeFlow finds
              compatible, available donors around it and lets you contact
              them one by one, nearest first.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleFindBlood('/emergency-request')}
                className="btn btn-primary px-7 py-3.5 text-base"
              >
                Request blood now
              </button>

              <button
                type="button"
                onClick={handleBecomeDonor}
                className="btn btn-secondary px-7 py-3.5 text-base"
              >
                Become a donor
              </button>
            </div>

            <p className="mt-5 text-sm text-muted">
              Just looking for donors?{' '}
              <button
                type="button"
                onClick={() => handleFindBlood()}
                className="font-semibold text-ink underline underline-offset-4 hover:text-blood"
              >
                Search by blood group
              </button>
            </p>
          </div>

          <Rings className="mx-auto w-full max-w-md" />
        </div>
      </section>

      {/* Compatibility */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Check who can donate to your blood group
            </h2>

            <p className="mt-4 max-w-md text-muted">
              Not every donor is a match. Pick the patient&apos;s group to see
              which red blood cell types are safe, then search for donors in
              your city.
            </p>
          </div>

          <div className="card p-6 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold">Patient&apos;s blood group</h3>
            <p className="mt-1 text-sm text-muted">
              Choose one to see which groups can donate.
            </p>

            <div
              role="radiogroup"
              aria-label="Patient blood group"
              className="mt-5 grid grid-cols-4 gap-2"
            >
              {BLOOD_GROUPS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={group === item}
                  onClick={() => setGroup(item)}
                  className="chip py-3 text-base"
                >
                  {formatGroup(item)}
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-line pt-6" aria-live="polite">
              <p className="text-sm text-muted">
                {formatGroup(group)} can receive red blood cells from
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {CAN_RECEIVE_FROM[group].map((item) => (
                  <BloodTag key={item} group={item} size="lg" />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleFindBlood(compatibleTarget)}
              className="btn btn-primary mt-6 w-full py-3.5"
            >
              Find donors for {formatGroup(group)}
            </button>

            <p className="hint">
              Red cell compatibility only. Hospitals confirm every match
              before a transfusion.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">
            How a request moves through LifeFlow
          </h2>

          <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-12 right-0 top-[18px] hidden h-px bg-line md:block"
                  />
                )}

                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-white">
                  {index + 1}
                </span>

                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Audiences */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Built for everyone in the chain
          </h2>

          <dl className="mt-10 grid gap-10 md:grid-cols-3">
            {audiences.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-plasma text-blood">
                  <Icon size={22} />
                </span>

                <dt className="mt-4 text-lg font-bold">{title}</dt>
                <dd className="mt-2 text-muted">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-2xl bg-ink px-6 py-10 text-white sm:px-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">
              Be the match someone is looking for.
            </h2>
            <p className="mt-2 max-w-xl text-white/80">
              Create an account as a donor, a patient or a hospital and get
              started in a minute.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="btn btn-light px-6">
              Create account
            </Link>
            <Link
              to="/login"
              className="btn border border-white/60 px-6 text-white hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home