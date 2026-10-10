import { Navigate } from 'react-router-dom'
import { Search, ClipboardList, HeartPulse } from 'lucide-react'
import { ActionList, DashboardShell, SectionTitle } from '../components/ui'

const actions = [
  {
    to: '/emergency-request',
    icon: HeartPulse,
    title: 'Emergency request',
    text: 'Submit an urgent blood requirement.',
  },
  {
    to: '/find-blood',
    icon: Search,
    title: 'Find blood',
    text: 'Search for donors by blood group and city.',
  },
  {
    to: '/show-requests',
    icon: ClipboardList,
    title: 'Blood requests',
    text: 'View open emergency blood requests.',
  },
]

function UserDashboard() {
  // Check demo login information
  const savedUser = localStorage.getItem('lifeflowUser')

  let currentUser

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  // Redirect if user is not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Only users can access this dashboard
  if (currentUser.role !== 'user') {
    const dashboardRoutes = {
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

  return (
    <DashboardShell
      user={currentUser}
      subtitle="Find blood and manage emergency requests."
    >
      <SectionTitle>What do you need?</SectionTitle>
      <ActionList items={actions} />
    </DashboardShell>
  )
}

export default UserDashboard
