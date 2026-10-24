import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { AuthShell, FormError, RolePicker } from '../components/AuthShell'

const API_URL = 'http://localhost:5000/api/auth'

const roles = [
  { value: 'user', label: 'User', hint: 'Find blood and post requests' },
  { value: 'donor', label: 'Donor', hint: 'Respond to requests' },
  {
    value: 'hospital',
    label: 'Hospital / Blood bank',
    hint: 'Manage stock and requests',
  },
  { value: 'admin', label: 'Admin', hint: 'Oversee the platform' },
]

function Login() {
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
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

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Login failed. Please try again.')
        return
      }

      // Verify selected role
      if (data.user.role !== role) {
        setError(
          `This account is registered as ${data.user.role}. Please select the correct role.`
        )
        return
      }

      // Store authentication details
      localStorage.setItem('lifeflowToken', data.token)

      localStorage.setItem(
        'lifeflowUser',
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      )

      // Role-based dashboard navigation
      const dashboardRoutes = {
        user: '/user-dashboard',
        donor: '/donor-dashboard',
        hospital: '/hospital-dashboard',
        admin: '/admin-dashboard',
      }

      navigate(dashboardRoutes[data.user.role] || '/login', {
        replace: true,
      })
    } catch (err) {
      console.error('Login error:', err)

      setError(
        'Unable to connect to the server. Please check that the LifeFlow backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      text="Login to your LifeFlow account."
    >
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

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn size={18} />
          {loading ? 'Logging in...' : 'Login'}
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
        Login securely with your registered LifeFlow account.
      </p>
    </AuthShell>
  )
}

export default Login