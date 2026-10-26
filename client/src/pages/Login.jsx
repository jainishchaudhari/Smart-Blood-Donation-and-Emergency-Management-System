import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react'
import { AuthShell, FormError } from '../components/AuthShell'

const API_URL = 'http://localhost:5000/api/auth'

function Login() {
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)

    const email = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString()

    if (!email || !password) {
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
    <AuthShell title="Welcome back" text="Login to your LifeFlow account.">
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="field pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>

          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="field pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-ink"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

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