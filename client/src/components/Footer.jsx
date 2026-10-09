import { Link } from 'react-router-dom'
import { Droplet, Heart, Home, Search, ClipboardList } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-gray-900 px-6 py-10 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Logo and Description */}
        <div>
          <Link
            to="/"
            className="mb-3 inline-flex items-center gap-2 text-2xl font-bold text-red-400"
          >
            <Droplet size={28} fill="currentColor" />
            LifeFlow
          </Link>

          <p className="max-w-sm text-sm leading-6 text-gray-300">
            Smart Blood Donation and Emergency Management System.
            Connecting donors, patients, and hospitals to support
            timely blood donation.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Quick Links
          </h3>

          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <Link
                to="/"
                className="inline-flex items-center gap-2 transition hover:text-red-400"
              >
                <Home size={16} />
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/find-blood"
                className="inline-flex items-center gap-2 transition hover:text-red-400"
              >
                <Search size={16} />
                Find Blood
              </Link>
            </li>

            <li>
              <Link
                to="/show-requests"
                className="inline-flex items-center gap-2 transition hover:text-red-400"
              >
                <ClipboardList size={16} />
                Blood Requests
              </Link>
            </li>
          </ul>
        </div>

        {/* Mission */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Our Mission
          </h3>

          <p className="text-sm leading-6 text-gray-300">
            Every blood donation can make a difference. LifeFlow
            aims to make finding blood donors and managing
            emergency requests easier.
          </p>

          <p className="mt-4 flex items-center gap-2 text-sm text-red-300">
            Made with <Heart size={16} fill="currentColor" />
            for a life-saving cause
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto mt-8 max-w-7xl border-t border-gray-700 pt-5 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} LifeFlow. All rights reserved.
        </p>

        <p className="mt-2 text-xs text-gray-500">
          Smart Blood Donation and Emergency Management System
        </p>
      </div>
    </footer>
  )
}

export default Footer