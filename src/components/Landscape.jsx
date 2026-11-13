// Paisaje ilustrado y determinista (colinas, niebla y árboles). Se genera a partir de `seed`.
function rng(seed) {
  let s = seed * 9301 + 49297
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

const CAPAS = [
  ['#c9dcc0', 0.55, 0.42, 0.5],
  ['#a9cb94', 0.8, 0.55, 0.6],
  ['#86b26b', 1, 0.68, 0.8],
  ['#5f9448', 1, 0.82, 1.0],
]

export default function Landscape({ seed = 1, w = 1200, h = 500, trees = true, className = '' }) {
  const r = rng(seed)
  const id = `l${seed}-${w}`
  const capas = CAPAS.map(([color, op, base, amp], i) => {
    const y0 = h * base
    const ph = r() * 6
    const pts = []
    for (let x = 0; x <= w + 40; x += 40) {
      pts.push([x, y0 + Math.sin(x / (w / (3 + i)) + ph) * h * 0.07 * amp + Math.sin(x / (w / 9) + ph * 2) * h * 0.02])
    }
    const d = `M0 ${h} ` + pts.map(([x, y]) => `L${x} ${y.toFixed(0)}`).join(' ') + ` L${w} ${h} Z`
    const arboles = trees && i >= 2
      ? pts.filter((_, k) => k % 2 === 0).flatMap(([x, y]) => [0, 1].map(() => {
          const rr = r() * 3 + 3 + i
          return [x + (r() - 0.5) * 40, y + 8 + r() * h * 0.12, rr]
        }))
      : []
    return { color, op, d, i, y0, arboles }
  })
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dbeaf0" /><stop offset="1" stopColor="#eef3e4" /></linearGradient>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".55" /></linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}s)`} />
      {capas.map(c => (
        <g key={c.i}>
          <path d={c.d} fill={c.color} opacity={c.op} />
          {(c.i === 1 || c.i === 2) && <rect y={c.y0 - h * 0.05} width={w} height={h * 0.2} fill={`url(#${id}m)`} />}
          {c.arboles.map(([x, y, rr], k) => <ellipse key={k} cx={x} cy={y} rx={rr} ry={rr * 1.3} fill="#2f5a35" opacity=".55" />)}
        </g>
      ))}
    </svg>
  )
}
