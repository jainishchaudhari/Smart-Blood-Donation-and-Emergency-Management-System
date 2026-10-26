import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react'
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
]

function Register() {
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)

    const name = formData.get('name')?.toString().trim()
    const email = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString()
    const role = formData.get('role')?.toString()

    // Validate required fields
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields.')
      return
    }

    // Validate password
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    // Validate role
    const allowedRoles = ['user', 'donor', 'hospital']

    if (!allowedRoles.includes(role)) {
      setError('Please select a valid role.')
      return
    }

    try {
      setLoading(true)

      // Send registration data to backend
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      // Handle backend errors
      if (!response.ok || !data.success) {
        setError(
          data.message || 'Registration failed. Please try again.'
        )
        return
      }

      // Save authentication token
      localStorage.setItem('lifeflowToken', data.token)

      // Save user details without password
      const currentUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }

      localStorage.setItem(
        'lifeflowUser',
        JSON.stringify(currentUser)
      )

      // Redirect according to user role
      const dashboardRoutes = {
        user: '/user-dashboard',
        donor: '/donor-dashboard',
        hospital: '/hospital-dashboard',
      }

      navigate(dashboardRoutes[data.user.role] || '/login', {
        replace: true,
      })
    } catch (err) {
      console.error('Registration error:', err)

      setError(
        'Unable to connect to the server. Please check that the LifeFlow backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      text="Join LifeFlow and help save lives."
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>

          <div className="relative">
            <User
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              required
              className="field pl-10"
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Password */}
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
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={6}
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

          <p className="hint">
            Use at least 6 characters.
          </p>
        </div>

        {/* Role Selection */}
        <RolePicker
          roles={roles}
          legend="Register as"
        />

        {/* Error Message */}
        <FormError message={error} />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus size={18} />
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {/* Login Link */}
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
        Register securely with your LifeFlow account.
      </p>
    </AuthShell>
  )
}

export default Register