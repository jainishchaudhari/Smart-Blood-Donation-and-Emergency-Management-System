import { AlertCircle } from 'lucide-react'
import {
  BloodTag,
} from './ui'
import { BLOOD_GROUPS } from '../lib/blood'

// Split layout shared by the Login and Register pages.
export function AuthShell({ title, text, children }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="card grid overflow-hidden lg:grid-cols-5">
        <aside className="hidden flex-col justify-between bg-ink p-8 text-white lg:col-span-2 lg:flex">
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Connecting patients, donors and hospitals.
            </h2>
            <p className="mt-4 text-white/70">
              One place to find compatible donors, post emergency requests and
              keep track of donations.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-2" aria-hidden="true">
            {BLOOD_GROUPS.map((group) => (
              <BloodTag key={group} group={group} dark />
            ))}
          </div>
        </aside>

        <div className="p-6 sm:p-10 lg:col-span-3">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted">{text}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function FormError({ message }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="mt-6 flex items-start gap-2 rounded-lg border border-blood/30 bg-plasma p-3 text-sm text-blood-deep"
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// Radio cards for choosing an account role.
export function RolePicker({ roles, legend }) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>

      <div className="grid gap-2 sm:grid-cols-2">
        {roles.map((role) => (
          <label key={role.value} className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value={role.value}
              required
              className="peer sr-only"
            />
            <span className="block h-full rounded-lg border border-ink/20 bg-white p-3 transition-colors hover:border-ink/40 peer-checked:border-blood peer-checked:bg-plasma peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blood">
              <span className="block text-sm font-semibold">{role.label}</span>
              <span className="mt-0.5 block text-xs text-muted">
                {role.hint}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
