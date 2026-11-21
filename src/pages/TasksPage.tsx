import { Link } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { fmtDate } from '../lib/format'
import type { Assignment } from '../types'
export default function TasksPage() {
  const { data } = useAsync(() => q<Assignment[]>(supabase.from('assignments').select('*,attempts(score,total,created_at)').order('created_at', { ascending: false })), [])
  return (
    <div className="stack"><h1>Задания</h1>
      {data?.map(a => { const last = a.attempts?.[a.attempts.length - 1]; return (
        <Link key={a.id} to={`/play/${a.id}`} className="card"><div className="row between"><b>{a.title}</b>{last ? <span className="chip ok">{last.score} из {last.total}</span> : <span className="chip">Новое</span>}</div>
          <div className="muted">{fmtDate(a.created_at)}{a.comment ? ` · ${a.comment}` : ''}</div></Link>) })}
      {!data?.length && <p className="muted">Преподаватель ещё не выдал тебе заданий.</p>}
    </div>
  )
}
