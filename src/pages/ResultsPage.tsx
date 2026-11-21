import { useAttempts } from '../features/results/useAttempts'
import { useAuth } from '../app/providers/AuthProvider'
import { fmtDate, pct } from '../lib/format'
export default function ResultsPage() {
  const { role } = useAuth(); const { data } = useAttempts()
  return (
    <div className="stack"><h1>Результаты</h1>
      {data?.map(a => (
        <div key={a.id} className="card row between"><div><b>{a.assignments?.title}</b><div className="muted">{role === 'teacher' && `${a.students?.full_name} · `}{fmtDate(a.created_at)} · попытка {a.attempt_no}</div></div>
          <div style={{ textAlign: 'right' }}><b>{a.score} из {a.total}</b><div className="muted">{pct(a.score, a.total)}%</div></div></div>))}
      {!data?.length && <p className="muted">Результатов пока нет.</p>}
    </div>
  )
}
