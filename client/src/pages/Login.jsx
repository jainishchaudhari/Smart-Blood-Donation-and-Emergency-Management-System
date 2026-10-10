import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, LogIn, UserPlus } from 'lucide-react'

function Login() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const email = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString()
    const role = formData.get('role')?.toString()

    if (!email || !password || !role) {
      alert('Please fill in all fields.')
      return
    }

    let registeredUsers = []

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
      alert(
        'Invalid email, password, or role. Please register first or check your details.'
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
    <div className="flex min-h-[80vh] items-center justify-center bg-red-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <HeartPulse size={36} className="text-red-600" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-gray-900">
          Welcome Back!
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Login to your LifeFlow account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Login As
            </label>

            <select
              id="role"
              name="role"
              defaultValue=""
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
              <option value="" disabled>
                Select your role
              </option>

              <option value="user">User</option>
              <option value="donor">Donor</option>
              <option value="hospital">
                Hospital / Blood Bank
              </option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            <LogIn size={20} />
            Login
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?
        </p>

        <Link
          to="/register"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-red-600 py-3 font-semibold text-red-600 transition hover:bg-red-50"
        >
          <UserPlus size={20} />
          Create New Account / Register
        </Link>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-gray-500 transition hover:text-red-600"
          >
            ← Back to Home
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Demo Login — Accounts are stored in this browser only.
        </p>
      </div>
    </div>
  )
}

export default Login