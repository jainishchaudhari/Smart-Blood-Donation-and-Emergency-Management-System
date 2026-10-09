import { Link } from 'react-router-dom'

function Register() {
  const handleSubmit = (e) => {
    e.preventDefault()

    alert(
      'Registration form submitted! Backend integration will be added later.'
    )
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-red-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Join LifeFlow and help save lives
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              Password must contain at least 6 characters.
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Register As
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
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-red-600 hover:text-red-700"
          >
            Login
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-gray-400">
          LifeFlow — Every Drop Counts. Every Life Matters.
        </p>
      </div>
    </div>
  )
}

export default Register