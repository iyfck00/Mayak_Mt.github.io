import { Link } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../app/providers/AuthProvider'
import { fmtTime } from '../lib/format'
import type { LessonRow, Assignment } from '../types'
const TILES = [['/students', 'Ученики'], ['/schedule', 'Расписание'], ['/finance', 'Финансы'], ['/library', 'Библиотека'], ['/assigned', 'Выданные'], ['/results', 'Результаты'], ['/stats', 'Статистика']]
export default function DashboardPage() {
  const { role, name } = useAuth(); const t = role === 'teacher'
  const { data } = useAsync(async () => {
    const a = new Date(); a.setHours(0, 0, 0, 0); const b = new Date(a); b.setDate(b.getDate() + 1)
    const lessons = await q<LessonRow[]>((supabase.from(t ? 'lessons' : 'my_lessons') as any).select(t ? '*,students(full_name)' : '*').gte('starts_at', a.toISOString()).lt('starts_at', b.toISOString()).neq('status', 'cancelled').order('starts_at'))
    const recent = await q<Assignment[]>(supabase.from('assignments').select('id,title,created_at,student_id,snapshot,comment,students(full_name)').order('created_at', { ascending: false }).limit(3))
    return { lessons, recent }
  }, [role])
  return (
    <div className="stack">
      <h1>Привет{name ? `, ${name.split(' ')[0]}` : ''}</h1>
      <div className="card"><h2>Сегодня</h2>
        {data?.lessons.length ? data.lessons.map(l => (
          <div key={l.id} className="row between"><span>{fmtTime(l.starts_at)} {t && l.students?.full_name}</span><span className="muted">{l.topic}</span></div>
        )) : <p className="muted">Занятий на сегодня нет.</p>}
      </div>
      {t && <div className="row wrap">
        <Link className="btn" to="/schedule">Новое занятие</Link>
        <Link className="btn ghost" to="/library/task/new">Новое задание</Link>
        <Link className="btn ghost" to="/students">Добавить ученика</Link>
      </div>}
      <div className="tiles">{(t ? TILES : [['/tasks', 'Задания'], ['/results', 'Результаты'], ['/stats', 'Прогресс'], ['/schedule', 'Расписание']]).map(([to, l]) => <Link key={to} to={to} className="card">{l}</Link>)}</div>
      <div className="card"><h2>{t ? 'Недавно выданные' : 'Последние задания'}</h2>
        {data?.recent.length ? data.recent.map(a => <div key={a.id} className="row between"><span>{a.title}</span><span className="muted">{t && a.students?.full_name}</span></div>) : <p className="muted">Пока ничего нет.</p>}
      </div>
    </div>
  )
}
