// Decorative diagram: a hospital in the middle, distance rings around it
// and donors appearing nearest first. It mirrors how LifeFlow contacts donors.

const RINGS = [
  { r: 58, label: '5 km' },
  { r: 104, label: '10 km' },
  { r: 150, label: '25 km' },
  { r: 196, label: '50 km' },
]

// d = distance from the hospital, a = angle in degrees
const DONORS = [
  { d: 52, a: -38, group: 'O−' },
  { d: 92, a: 205, group: 'A+' },
  { d: 132, a: 28, group: 'O+' },
  { d: 170, a: -128, group: 'B+' },
  { d: 184, a: 118, group: 'O−' },
]

const CENTER = 200

const polar = (d, angle) => {
  const rad = (angle * Math.PI) / 180
  return [CENTER + d * Math.cos(rad), CENTER + d * Math.sin(rad)]
}

export default function Rings({ className = '' }) {
  const [firstX, firstY] = polar(DONORS[0].d, DONORS[0].a)

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {RINGS.map((ring, index) => (
        <g key={ring.label}>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={ring.r}
            fill="none"
            stroke="#0f172a"
            strokeOpacity="0.16"
            strokeWidth="1.5"
            className="ring-draw"
            style={{ animationDelay: `${index * 0.12}s` }}
          />
          <text
            x={CENTER}
            y={CENTER - ring.r + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#5b6676"
            stroke="#fff"
            strokeWidth="5"
            paintOrder="stroke"
            className="dot-in"
            style={{ animationDelay: `${0.5 + index * 0.12}s` }}
          >
            {ring.label}
          </text>
        </g>
      ))}

      {/* The first donor that gets contacted */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={firstX}
        y2={firstY}
        stroke="#c8102e"
        strokeWidth="2"
        strokeDasharray="5 5"
        className="dot-in"
        style={{ animationDelay: '1.3s' }}
      />

      {DONORS.map((donor, index) => {
        const [x, y] = polar(donor.d, donor.a)

        return (
          <g
            key={`${donor.group}-${index}`}
            className="dot-in"
            style={{ animationDelay: `${0.8 + index * 0.25}s` }}
          >
            <circle
              cx={x}
              cy={y}
              r="18"
              fill="#fff"
              stroke="#0f172a"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#c8102e"
            >
              {donor.group}
            </text>
          </g>
        )
      })}

      {/* Hospital */}
      <circle cx={CENTER} cy={CENTER} r="32" fill="#c8102e" fillOpacity="0.1" />
      <rect
        x={CENTER - 22}
        y={CENTER - 22}
        width="44"
        height="44"
        rx="10"
        fill="#c8102e"
      />
      <text
        x={CENTER}
        y={CENTER + 9}
        textAnchor="middle"
        fontSize="26"
        fontWeight="700"
        fill="#fff"
      >
        H
      </text>
    </svg>
  )
}