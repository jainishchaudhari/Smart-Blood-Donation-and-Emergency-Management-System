import { Navigate } from 'react-router-dom'
import { Users, HeartPulse, ClipboardList } from 'lucide-react'
import {
  ActionList,
  DashboardShell,
  DemoNote,
  SectionTitle,
  StatStrip,
} from '../components/ui'

const actions = [
  {
    to: '/show-requests',
    icon: ClipboardList,
    title: 'Emergency requests',
    text: 'Review current blood requests.',
  },
  {
    to: '/find-blood',
    icon: HeartPulse,
    title: 'Donor management',
    text: 'Review registered blood donors.',
  },
  {
    icon: Users,
    title: 'User management',
    text: 'Manage registered users and their accounts.',
  },
]

function AdminDashboard() {
  let currentUser

  try {
    const savedUser = localStorage.getItem('lifeflowUser')
    currentUser = savedUser ? JSON.parse(savedUser) : null
  } catch {
    currentUser = null
  }

  // Login vagar dashboard access na male
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Role pramane correct dashboard par redirect
  if (currentUser.role !== 'admin') {
    const dashboardRoutes = {
      user: '/user-dashboard',
      donor: '/donor-dashboard',
      hospital: '/hospital-dashboard',
    }

    return (
      <Navigate
        to={dashboardRoutes[currentUser.role] || '/login'}
        replace
      />
    )
  }

  const stats = [
    { label: 'Total users', value: '120' },
    { label: 'Registered donors', value: '85' },
    { label: 'Blood requests', value: '24' },
    { label: 'Blood groups', value: '8' },
  ]

  return (
    <DashboardShell
      user={currentUser}
      subtitle="Manage LifeFlow users, donors and emergency requests."
    >
      <StatStrip stats={stats} />

      <SectionTitle>Management</SectionTitle>
      <ActionList items={actions} />

      <DemoNote>
        Development mode: statistics are sample values. Real user, donor and
        request data will come from the backend later.
      </DemoNote>
    </DashboardShell>
  )
}

export default AdminDashboard
