import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BloodTag,
} from '../components/ui'
import { BLOOD_GROUPS, CAN_RECEIVE_FROM, formatGroup } from '../lib/blood'

const steps = [
  {
    title: 'Post a request',
    text: 'Enter the blood group, units needed, hospital and a contact number.',
  },
  {
    title: 'Reach donors',
    text: 'Donors, hospitals and blood banks can view open requests and find compatible donors.',
  },
  {
    title: 'Donate and record',
    text: 'Once blood is donated, it shows up in the donor\u2019s donation history.',
  },
]

const audiences = [
  {
    title: 'Patients and families',
    text: 'Search donors by blood group and city, and post an emergency request with the hospital and contact details.',
  },
  {
    title: 'Donors',
    text: 'Keep your donor profile ready, see open requests and review your past donations.',
  },
  {
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
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Find the right blood group, fast.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-7 text-muted">
              LifeFlow connects patients, donors and hospitals. Check which
              blood groups are compatible, search for donors in your city and
              post an emergency request.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleFindBlood()}
                className="btn btn-primary px-6"
              >
                Find blood
              </button>

              <button
                type="button"
                onClick={handleBecomeDonor}
                className="btn btn-secondary px-6"
              >
                Become a donor
              </button>
            </div>
          </div>

          {/* Compatibility board */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-bold">Who can donate to you?</h2>
            <p className="mt-1 text-sm text-muted">
              Pick the patient&apos;s blood group.
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
              className="btn btn-primary mt-6 w-full"
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
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold">How a request moves through LifeFlow</h2>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t-2 border-ink pt-4">
                <span className="font-display text-sm font-bold text-blood">
                  Step {index + 1}
                </span>
                <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Audiences */}
      <section className="border-y border-line bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold">Built for everyone in the chain</h2>

          <dl className="mt-10 grid gap-8 md:grid-cols-3">
            {audiences.map((item) => (
              <div key={item.title} className="border-l-4 border-blood pl-5">
                <dt className="text-lg font-semibold">{item.title}</dt>
                <dd className="mt-2 text-muted">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="bg-blood py-16 text-white">
        <div className="mx-auto flex max-w-6xl px-4 sm:px-6 flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Be the match someone is looking for.</h2>
            <p className="mt-2 max-w-xl text-white/85">
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
