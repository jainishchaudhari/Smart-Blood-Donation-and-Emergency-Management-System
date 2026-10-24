import { Check } from 'lucide-react'

const STEPS = [
  { key: 'pending', label: 'Request created' },
  { key: 'accepted', label: 'Donor accepted' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
]

const ORDER = ['pending', 'accepted', 'in_progress', 'completed']

export default function RequestProgress({ status }) {
  if (status === 'cancelled') {
    return (
      <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
        This request was cancelled.
      </p>
    )
  }

  const current = Math.max(ORDER.indexOf(status), 0)

  return (
    <div>
      <ol className="flex items-start">
        {STEPS.map((step, index) => {
          const done = index < current || status === 'completed'
          const active = index === current && status !== 'completed'

          return (
            <li key={step.key} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <span
                  className={`h-0.5 flex-1 ${index === 0 ? 'invisible' : index <= current ? 'bg-green-500' : 'bg-gray-200'}`}
                />
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? 'bg-green-500 text-white'
                      : active
                      ? 'bg-blood text-white ring-4 ring-red-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {done ? <Check size={16} /> : index + 1}
                </span>
                <span
                  className={`h-0.5 flex-1 ${index === STEPS.length - 1 ? 'invisible' : index < current ? 'bg-green-500' : 'bg-gray-200'}`}
                />
              </div>

              <span
                className={`mt-2 text-xs ${active || done ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>

      {status === 'pending' && (
        <p className="mt-3 text-center text-sm text-gray-600">
          Waiting for a donor to accept.
        </p>
      )}
    </div>
  )
}