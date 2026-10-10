import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell, FormError, RolePicker } from '../components/AuthShell'

const roles = [
  { value: 'user', label: 'User', hint: 'Find blood and post requests' },
  { value: 'donor', label: 'Donor', hint: 'Respond to requests' },
  { value: 'hospital', label: 'Hospital / Blood bank', hint: 'Manage stock and requests' },
]

function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)

    const name = formData.get('name')?.toString().trim()
    const email = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString()
    const role = formData.get('role')?.toString()

    if (!name || !email || !password || !role) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    const dashboardRoutes = {
      user: '/user-dashboard',
      donor: '/donor-dashboard',
      hospital: '/hospital-dashboard',
    }

    if (!dashboardRoutes[role]) {
      setError('Please select a valid role.')
      return
    }

    // Get previously registered accounts
    let registeredUsers

    try {
      registeredUsers = JSON.parse(
        localStorage.getItem('lifeflowRegisteredUsers') || '[]'
      )

      if (!Array.isArray(registeredUsers)) {
        registeredUsers = []
      }
    } catch {
      registeredUsers = []
    }

    // Check if email is already registered
    const existingUser = registeredUsers.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      setError('This email is already registered. Please login instead.')
      return
    }

    // Save the new account for future login
    const newUser = {
      name,
      email,
      password,
      role,
    }

    registeredUsers.push(newUser)

    localStorage.setItem(
      'lifeflowRegisteredUsers',
      JSON.stringify(registeredUsers)
    )

    // Save current login session without password
    const currentUser = {
      name,
      email,
      role,
    }

    localStorage.setItem('lifeflowUser', JSON.stringify(currentUser))

    navigate(dashboardRoutes[role], { replace: true })
  }

  return (
    <AuthShell
      title="Create your account"
      text="Join LifeFlow and help save lives."
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            required
            className="field"
          />
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="field"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={6}
            required
            className="field"
          />
          <p className="hint">Use at least 6 characters.</p>
        </div>

        <RolePicker roles={roles} legend="Register as" />

        <FormError message={error} />

        <button type="submit" className="btn btn-primary w-full">
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-blood hover:text-blood-deep"
        >
          Login
        </Link>
      </p>

      <p className="hint mt-4 text-center">
        Demo registration: accounts are stored in this browser only.
      </p>
    </AuthShell>
  )
}

export default Register
