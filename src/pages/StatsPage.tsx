import { useAttempts } from '../features/results/useAttempts'
import ProgressChart from '../features/results/ProgressChart'
import { useAuth } from '../app/providers/AuthProvider'
import { pct } from '../lib/format'
export default function StatsPage() {
  const { role } = useAuth(); const { data } = useAttempts(); const all = data ?? []
  const avg = pct(all.reduce((s, a) => s + a.score, 0), all.reduce((s, a) => s + a.total, 0))
  const series = [...all].reverse().slice(-20).map(a => pct(a.score, a.total))
  const per: Record<string, { n: number; s: number; t: number }> = {}
  all.forEach(a => { const k = a.students?.full_name ?? '—'; const r = (per[k] ||= { n: 0, s: 0, t: 0 }); r.n++; r.s += a.score; r.t += a.total })
  return (
    <div className="stack"><h1>{role === 'teacher' ? 'Статистика' : 'Мой прогресс'}</h1>
      <div className="tiles"><div className="card"><span className="muted">Прохождений</span><h1>{all.length}</h1></div><div className="card"><span className="muted">Правильных ответов</span><h1>{avg}%</h1></div></div>
      <div className="card"><h2>Динамика</h2><ProgressChart values={series} /></div>
      {role === 'teacher' && <div className="card"><h2>По ученикам</h2>{Object.entries(per).map(([k, v]) => <div key={k} className="row between"><span>{k}</span><b>{v.n} · {pct(v.s, v.t)}%</b></div>)}{!all.length && <p className="muted">Данных пока нет.</p>}</div>}
    </div>
  )
}
