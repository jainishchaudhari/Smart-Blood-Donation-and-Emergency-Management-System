import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplet, Hospital, Phone, CalendarDays, Plus, ClipboardList } from 'lucide-react'
import {
  BloodTag,
  DemoNote,
  EmptyState,
  PageContainer,
  PageHeader,
  Pill,
} from '../components/ui'

const sampleRequests = [
  {
    id: 1,
    patientName: 'Rahul Patel',
    bloodGroup: 'O+',
    units: 2,
    hospital: 'Civil Hospital',
    city: 'Ahmedabad',
    contact: '9876543210',
    urgency: 'Critical',
    date: '2026-10-09',
  },
  {
    id: 2,
    patientName: 'Priya Shah',
    bloodGroup: 'B+',
    units: 1,
    hospital: 'Sterling Hospital',
    city: 'Ahmedabad',
    contact: '9876501234',
    urgency: 'High',
    date: '2026-10-08',
  },
  {
    id: 3,
    patientName: 'Amit Desai',
    bloodGroup: 'A-',
    units: 3,
    hospital: 'General Hospital',
    city: 'Gandhinagar',
    contact: '9898012345',
    urgency: 'Normal',
    date: '2026-10-07',
  },
]

const urgencyOrder = { Critical: 0, High: 1, Normal: 2 }

const urgencyStyle = {
  Critical: { tone: 'critical', border: 'border-l-blood' },
  High: { tone: 'warn', border: 'border-l-warn' },
  Normal: { tone: 'ok', border: 'border-l-ok' },
}

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function ShowRequests() {
  const [urgency, setUrgency] = useState('All')

  // Most urgent first, then newest first
  const visibleRequests = sampleRequests
    .filter((request) => urgency === 'All' || request.urgency === urgency)
    .sort(
      (a, b) =>
        urgencyOrder[a.urgency] - urgencyOrder[b.urgency] ||
        b.date.localeCompare(a.date)
    )

  return (
    <PageContainer>
      <PageHeader
        title="Emergency blood requests"
        text="Open requests, with the most urgent shown first."
        action={
          <Link to="/emergency-request" className="btn btn-primary">
            <Plus size={18} />
            Create request
          </Link>
        }
      />

      <div
        role="group"
        aria-label="Filter by urgency"
        className="mt-8 flex flex-wrap gap-2"
      >
        {['All', 'Critical', 'High', 'Normal'].map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={urgency === item}
            onClick={() => setUrgency(item)}
            className="chip"
          >
            {item}
          </button>
        ))}
      </div>

      <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleRequests.map((request) => (
          <li
            key={request.id}
            className={`card flex flex-col border-l-4 p-5 ${
              urgencyStyle[request.urgency].border
            }`}
          >
            <div className="flex items-start gap-4">
              <BloodTag group={request.bloodGroup} size="lg" />

              <div className="min-w-0">
                <h2 className="text-lg font-semibold">{request.patientName}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  Request #{request.id}
                </p>
                <div className="mt-2">
                  <Pill tone={urgencyStyle[request.urgency].tone}>
                    {request.urgency}
                  </Pill>
                </div>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Droplet size={17} className="shrink-0 text-blood" />
                <span>
                  <span className="font-semibold">{request.units}</span>{' '}
                  {request.units === 1 ? 'unit' : 'units'} required
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Hospital size={17} className="mt-0.5 shrink-0 text-blood" />
                <span>
                  {request.hospital}, {request.city}
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-muted">
                <CalendarDays size={17} className="shrink-0 text-blood" />
                {formatDate(request.date)}
              </li>
            </ul>

            <a
              href={`tel:${request.contact}`}
              className="btn btn-secondary mt-5 w-full"
            >
              <Phone size={16} />
              Call {request.contact}
            </a>
          </li>
        ))}
      </ul>

      {visibleRequests.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No requests at this urgency"
          text="Choose another urgency level to see more requests."
        />
      )}

      <DemoNote>
        Demo data: these requests are samples, not real patient requests.
      </DemoNote>
    </PageContainer>
  )
}

export default ShowRequests
