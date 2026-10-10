import { Navigate } from 'react-router-dom'
import { UserRound, ClipboardList, Search, HeartPulse } from 'lucide-react'
import { ActionList, DashboardShell, SectionTitle } from '../components/ui'

const actions = [
  {
    to: '/show-requests',
    icon: HeartPulse,
    title: 'Blood requests',
    text: 'See who needs blood and where.',
  },
  {
    to: '/donation-history',
    icon: ClipboardList,
    title: 'Donation history',
    text: 'Review your past blood donations.',
  },
  {
    to: '/find-blood',
    icon: Search,
    title: 'Blood information',
    text: 'Explore blood groups and donor profiles.',
  },
  {
    icon: UserRound,
    title: 'My profile',
    text: 'Manage your donor profile and personal details.',
  },
]

function DonorDashboard() {
  // Get demo login information
  const savedUser = localStorage.getItem('lifeflowUser')

  let currentUser

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Redirect to the correct dashboard based on role
  if (currentUser.role !== 'donor') {
    const dashboardRoutes = {
      user: '/user-dashboard',
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
      subtitle="Your donation can save someone's life. Start with the requests that need help."
    >
      <SectionTitle>Your tools</SectionTitle>
      <ActionList items={actions} />
    </DashboardShell>
  )
}

export default DonorDashboard
