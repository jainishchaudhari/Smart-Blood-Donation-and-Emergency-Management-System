import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { AuthShell, FormError, RolePicker } from '../components/AuthShell'

const roles = [
  { value: 'user', label: 'User', hint: 'Find blood and post requests' },
  { value: 'donor', label: 'Donor', hint: 'Respond to requests' },
  { value: 'hospital', label: 'Hospital / Blood bank', hint: 'Manage stock and requests' },
  { value: 'admin', label: 'Admin', hint: 'Oversee the platform' },
]

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)

    const email = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString()
    const role = formData.get('role')?.toString()

    if (!email || !password || !role) {
      setError('Please fill in all fields.')
      return
    }

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

    const matchedUser = registeredUsers.find(
      (user) =>
        user.email?.toLowerCase() === email.toLowerCase() &&
        user.password === password &&
        user.role === role
    )

    if (!matchedUser) {
      setError(
        'Invalid email, password or role. Check your details, or register first.'
      )
      return
    }

    const currentUser = {
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    }

    localStorage.setItem(
      'lifeflowUser',
      JSON.stringify(currentUser)
    )

    const dashboardRoutes = {
      user: '/user-dashboard',
      donor: '/donor-dashboard',
      hospital: '/hospital-dashboard',
      admin: '/admin-dashboard',
    }

    navigate(dashboardRoutes[matchedUser.role] || '/login', {
      replace: true,
    })
  }

  return (
    <AuthShell title="Welcome back" text="Login to your LifeFlow account.">
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="field"
          />
        </div>

        <RolePicker roles={roles} legend="Login as" />

        <FormError message={error} />

        <button type="submit" className="btn btn-primary w-full">
          <LogIn size={18} />
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to LifeFlow?{' '}
        <Link
          to="/register"
          className="font-semibold text-blood hover:text-blood-deep"
        >
          Create an account
        </Link>
      </p>

      <p className="hint mt-4 text-center">
        Demo login: accounts are stored in this browser only.
      </p>
    </AuthShell>
  )
}

export default Login
