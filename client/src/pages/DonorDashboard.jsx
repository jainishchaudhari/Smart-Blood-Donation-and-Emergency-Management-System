import { Navigate } from 'react-router-dom'
import { ClipboardList, Search, HeartPulse } from 'lucide-react'
import { ActionList, DashboardShell, SectionTitle } from '../components/ui'

const actions = [
  {
    to: '/donor-invitations',
    icon: HeartPulse,
    title: 'Requests for you',
    text: 'Emergency requests sent to you because you are nearby.',
  },
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
]

function DonorDashboard() {
  const savedUser = localStorage.getItem('lifeflowUser')

  let currentUser

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

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