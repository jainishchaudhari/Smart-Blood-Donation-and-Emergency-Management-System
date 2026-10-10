import { Link } from 'react-router-dom'
import { Droplet, ChevronRight, Info } from 'lucide-react'

/* ---------- Small building blocks ---------- */

export function Logo({ light = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight ${
        light ? 'text-white' : 'text-ink'
      }`}
    >
      <Droplet
        size={24}
        fill="currentColor"
        className={light ? 'text-white' : 'text-blood'}
      />
      LifeFlow
    </span>
  )
}

// The blood group, styled like the label on a blood bag.
export function BloodTag({ group, size = 'md', dark = false }) {
  const letters = group.slice(0, -1)
  const rh = group.endsWith('-') ? '\u2212' : '+'

  const sizes = {
    sm: 'h-9 min-w-9 px-2 text-base',
    md: 'h-12 min-w-12 px-2.5 text-xl',
    lg: 'h-16 min-w-16 px-3 text-3xl',
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border-2 font-display font-extrabold leading-none ${
        sizes[size]
      } ${
        dark
          ? 'border-white/40 bg-transparent text-white'
          : 'border-blood bg-white text-blood'
      }`}
    >
      {letters}
      <span className="relative -top-[0.3em] ml-px text-[0.6em]">{rh}</span>
    </span>
  )
}

const pillTones = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  critical: 'bg-blood text-white',
  neutral: 'border border-line bg-paper text-muted',
}

export function Pill({ tone = 'neutral', children }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${pillTones[tone]}`}
    >
      {children}
    </span>
  )
}

export function PageContainer({ children, narrow = false }) {
  return (
    <div
      className={`mx-auto w-full px-4 py-10 sm:px-6 sm:py-12 ${
        narrow ? 'max-w-2xl' : 'max-w-6xl'
      }`}
    >
      {children}
    </div>
  )
}

export function PageHeader({ title, text, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {text && <p className="mt-2 max-w-prose text-muted">{text}</p>}
      </div>
      {action}
    </div>
  )
}

export function DemoNote({ children }) {
  return (
    <p className="mt-8 flex items-start gap-2 text-sm text-muted">
      <Info size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="card mt-6 px-6 py-12 text-center">
      <Icon className="mx-auto text-muted" size={36} />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-muted">{text}</p>
    </div>
  )
}

/* ---------- Dashboard pieces ---------- */

export function DashboardShell({ user, subtitle, children }) {
  const firstName = (user.name || user.email || '').split(' ')[0]

  return (
    <PageContainer>
      <header className="border-b border-line pb-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Hello, {firstName}</h1>
        <p className="mt-2 max-w-prose text-muted">{subtitle}</p>
        <p className="mt-1 text-sm text-muted">Signed in as {user.email}</p>
      </header>
      {children}
    </PageContainer>
  )
}

export function SectionTitle({ children }) {
  return <h2 className="mb-4 mt-10 text-xl font-semibold">{children}</h2>
}

// A list of tappable rows. Items without `to` are shown as "coming soon".
export function ActionList({ items }) {
  return (
    <ul className="card divide-y divide-line overflow-hidden">
      {items.map(({ to, icon: Icon, title, text }) => {
        const content = (
          <>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-plasma text-blood">
              <Icon size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{title}</span>
              <span className="block text-sm text-muted">{text}</span>
            </span>
            {to ? (
              <ChevronRight size={20} className="shrink-0 text-muted" />
            ) : (
              <Pill>Coming soon</Pill>
            )}
          </>
        )

        return (
          <li key={title}>
            {to ? (
              <Link
                to={to}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-paper sm:p-5"
              >
                {content}
              </Link>
            ) : (
              <div className="flex items-center gap-4 p-4 opacity-70 sm:p-5">
                {content}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// A single row of headline numbers, divided by hairlines.
export function StatStrip({ stats }) {
  return (
    <dl className="card mt-8 grid grid-cols-2 divide-line overflow-hidden lg:grid-cols-4 lg:divide-x">
      {stats.map(({ label, value }, index) => (
        <div
          key={label}
          className={`p-5 sm:p-6 ${
            index % 2 === 1 ? 'border-l border-line lg:border-l-0' : ''
          } ${index > 1 ? 'border-t border-line lg:border-t-0' : ''}`}
        >
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="mt-1 font-display text-3xl font-bold tabular-nums">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
