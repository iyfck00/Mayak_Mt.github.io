export default function ProgressChart({ values }: { values: number[] }) {
  if (values.length < 2) return <p className="muted">Для графика нужно хотя бы два прохождения.</p>
  const w = 300, h = 100, p = 8
  const pts = values.map((v, i) => `${p + (i * (w - 2 * p)) / (values.length - 1)},${h - p - (v / 100) * (h - 2 * p)}`).join(' ')
  return <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Динамика результатов, %"><polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg>
}
