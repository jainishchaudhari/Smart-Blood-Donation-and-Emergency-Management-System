import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Droplet } from 'lucide-react'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Blood', path: '/find-blood' },
    { name: 'Requests', path: '/show-requests' },
    { name: 'Dashboard', path: '/dashboard' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-red-600"
        >
          <Droplet size={28} fill="currentColor" />
          LifeFlow
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="font-medium text-gray-700 transition hover:text-red-600"
            >
              {link.name}
            </Link>
          ))}

          <Link
            to="/login"
            className="font-medium text-gray-700 transition hover:text-red-600"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-700 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-gray-100 bg-white px-6 py-5 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="font-medium text-gray-700 transition hover:text-red-600"
            >
              {link.name}
            </Link>
          ))}

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="font-medium text-gray-700 transition hover:text-red-600"
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="w-fit rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar