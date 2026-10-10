import { Navigate } from 'react-router-dom'
import { Search, ClipboardList, Plus } from 'lucide-react'
import {
  ActionList,
  BloodTag,
  DashboardShell,
  DemoNote,
  Pill,
  SectionTitle,
  StatStrip,
} from '../components/ui'
import { formatGroup } from '../lib/blood'

const LOW_STOCK_LIMIT = 10
const STOCK_SCALE = 40

const actions = [
  {
    to: '/emergency-request',
    icon: Plus,
    title: 'Emergency request',
    text: 'Create a request for urgent blood needs.',
  },
  {
    to: '/show-requests',
    icon: ClipboardList,
    title: 'View requests',
    text: 'Review open blood requests.',
  },
  {
    to: '/find-blood',
    icon: Search,
    title: 'Find blood donors',
    text: 'Search for donors by blood group.',
  },
]

function HospitalDashboard() {
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

  // Redirect users with the wrong role
  if (currentUser.role !== 'hospital') {
    const dashboardRoutes = {
      user: '/user-dashboard',
      donor: '/donor-dashboard',
      admin: '/admin-dashboard',
    }

    return (
      <Navigate
        to={dashboardRoutes[currentUser.role] || '/login'}
        replace
      />
    )
  }

  const stats = [
    { label: 'Blood requests', value: '24' },
    { label: 'Available units', value: '120' },
    { label: 'Pending requests', value: '08' },
    { label: 'Completed requests', value: '16' },
  ]

  const bloodStock = [
    { group: 'A+', units: 20 },
    { group: 'A-', units: 8 },
    { group: 'B+', units: 25 },
    { group: 'B-', units: 6 },
    { group: 'AB+', units: 12 },
    { group: 'AB-', units: 5 },
    { group: 'O+', units: 30 },
    { group: 'O-', units: 14 },
  ]

  const lowStock = bloodStock.filter((item) => item.units < LOW_STOCK_LIMIT)

  return (
    <DashboardShell
      user={currentUser}
      subtitle="Manage blood inventory and emergency requests."
    >
      <StatStrip stats={stats} />

      {/* Blood inventory */}
      <div className="mb-2 mt-10">
        <div>
          <h2 className="text-xl font-semibold">Blood inventory</h2>
          <p className="mt-1 text-sm text-muted">
            {lowStock.length > 0
              ? `${lowStock.length} groups are below ${LOW_STOCK_LIMIT} units: ${lowStock
                  .map((item) => formatGroup(item.group))
                  .join(', ')}.`
              : 'All blood groups are well stocked.'}
          </p>
        </div>

      </div>

      <ul className="card mt-4 grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
        {bloodStock.map((item, index) => {
          const isLow = item.units < LOW_STOCK_LIMIT
          const width = Math.min((item.units / STOCK_SCALE) * 100, 100)

          return (
            <li
              key={item.group}
              className={`flex items-center gap-4 p-4 sm:p-5 ${
                index >= 2 ? 'sm:border-t sm:border-line' : ''
              } ${index % 2 === 1 ? 'sm:border-l sm:border-line' : ''}`}
            >
              <span className="flex w-[4.5rem] shrink-0">
                <BloodTag group={item.group} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold tabular-nums">
                    {item.units} units
                  </span>
                  {isLow && <Pill tone="critical">Low</Pill>}
                </div>

                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-paper"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded-full ${
                      isLow ? 'bg-blood' : 'bg-ok'
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <SectionTitle>Quick actions</SectionTitle>
      <ActionList items={actions} />

      <div className="mt-10 rounded-xl border border-blood/20 bg-plasma p-5">
        <h2 className="font-semibold text-blood-deep">Before issuing blood</h2>

        <p className="mt-1 text-sm leading-6 text-ink/80">
          Verify blood group, stock availability and compatibility through your
          hospital&apos;s approved transfusion procedures.
        </p>
      </div>

      <DemoNote>Demo data: stock levels and statistics are sample values.</DemoNote>
    </DashboardShell>
  )
}

export default HospitalDashboard
