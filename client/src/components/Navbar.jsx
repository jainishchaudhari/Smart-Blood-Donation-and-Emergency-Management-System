import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, LogOut, Plus } from 'lucide-react'
import { Logo } from './ui'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  let currentUser

  try {
    const savedUser = localStorage.getItem('lifeflowUser')
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  const dashboardRoutes = {
    user: '/user-dashboard',
    donor: '/donor-dashboard',
    hospital: '/hospital-dashboard',
    admin: '/admin-dashboard',
  }

  const dashboardPath = currentUser
    ? dashboardRoutes[currentUser.role] || '/login'
    : '/login'

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(currentUser
      ? [
          { name: 'Find blood', path: '/find-blood' },
          { name: 'Requests', path: '/show-requests' },
          { name: 'Dashboard', path: dashboardPath },
        ]
      : []),
  ]

  const handleLogout = () => {
    localStorage.removeItem('lifeflowUser')
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const closeMenu = () => setMenuOpen(false)

  const desktopLink = ({ isActive }) =>
    `border-b-2 py-1 text-sm font-medium transition-colors ${
      isActive
        ? 'border-blood text-ink'
        : 'border-transparent text-muted hover:text-ink'
    }`

  const mobileLink = ({ isActive }) =>
    `rounded-lg px-3 py-3 font-medium transition-colors ${
      isActive ? 'bg-plasma text-blood' : 'text-ink hover:bg-paper'
    }`

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMenu} aria-label="LifeFlow home">
          <Logo />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/'}
              className={desktopLink}
            >
              {link.name}
            </NavLink>
          ))}

          {currentUser ? (
            <>
              <Link to="/emergency-request" className="btn btn-primary btn-sm">
                <Plus size={16} />
                Emergency request
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={desktopLink}>
                Login
              </NavLink>

              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="-mr-2 rounded-lg p-2 text-ink md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-line bg-white px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/'}
              onClick={closeMenu}
              className={mobileLink}
            >
              {link.name}
            </NavLink>
          ))}

          {currentUser ? (
            <>
              <Link
                to="/emergency-request"
                onClick={closeMenu}
                className="btn btn-primary mt-2"
              >
                <Plus size={16} />
                Emergency request
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary mt-1"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu} className={mobileLink}>
                Login
              </NavLink>

              <Link
                to="/register"
                onClick={closeMenu}
                className="btn btn-primary mt-2"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
