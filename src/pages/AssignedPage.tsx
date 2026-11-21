import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { fmtDate } from '../lib/format'
import type { Assignment } from '../types'
export default function AssignedPage() {
  const { data } = useAsync(() => q<Assignment[]>(supabase.from('assignments').select('*,students(full_name),attempts(score,total,created_at)').order('created_at', { ascending: false })), [])
  return (
    <div className="stack"><h1>Выданные задания</h1>
      {data?.map(a => { const last = a.attempts?.[a.attempts.length - 1]; return (
        <div key={a.id} className="card"><div className="row between"><b>{a.title}</b><span className="muted">{fmtDate(a.created_at)}</span></div>
          <div className="muted">{a.students?.full_name} · {last ? `последний результат ${last.score} из ${last.total}` : 'не проходил'}</div></div>) })}
      {!data?.length && <p className="muted">Пока ничего не выдано.</p>}
    </div>
  )
}
