import { Link } from 'react-router-dom'
import { Logo } from './ui'

function Footer() {
  const linkClass =
    'text-sm text-white/70 transition-colors hover:text-white'

  return (
    <footer className="bg-ink py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link to="/" aria-label="LifeFlow home">
            <Logo light />
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            Smart Blood Donation and Emergency Management System. Connecting
            donors, patients and hospitals so blood reaches the people who
            need it.
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold">Explore</h3>

          <ul className="mt-4 space-y-3">
            <li>
              <Link to="/" className={linkClass}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/find-blood" className={linkClass}>
                Find blood
              </Link>
            </li>
            <li>
              <Link to="/show-requests" className={linkClass}>
                Blood requests
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold">Get involved</h3>

          <ul className="mt-4 space-y-3">
            <li>
              <Link to="/register" className={linkClass}>
                Become a donor
              </Link>
            </li>
            <li>
              <Link to="/emergency-request" className={linkClass}>
                Emergency request
              </Link>
            </li>
            <li>
              <Link to="/login" className={linkClass}>
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        <p className="border-t border-white/15 pt-6 text-sm text-white/60">
          © {new Date().getFullYear()} LifeFlow. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
