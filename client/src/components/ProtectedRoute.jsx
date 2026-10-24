import { Navigate, Outlet, useLocation } from 'react-router-dom'

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation()

  let token = null
  let currentUser = null

  try {
    token = localStorage.getItem('lifeflowToken')

    const savedUser = localStorage.getItem('lifeflowUser')
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    token = null
    currentUser = null
  }

  // Redirect to login if user is not authenticated
  if (!token || !currentUser || !currentUser.role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // Check user role
  if (
    allowedRoles &&
    !allowedRoles.includes(currentUser.role)
  ) {
    const dashboardRoutes = {
      user: '/user-dashboard',
      donor: '/donor-dashboard',
      hospital: '/hospital-dashboard',
      admin: '/admin-dashboard',
    }

    return (
      <Navigate
        to={dashboardRoutes[currentUser.role] || '/login'}
        replace
      />
    )
  }

  // Allow access to the requested route
  return <Outlet />
}

export default ProtectedRoute