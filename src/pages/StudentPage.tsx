import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { fmtDate, fmtTime, pct } from '../lib/format'
import type { Student, LessonRow, Assignment, AttemptRow } from '../types'
export default function StudentPage() {
  const { id } = useParams()
  const { data, reload } = useAsync(async () => ({
    st: await q<Student>(supabase.from('students').select('*').eq('id', id!).single()),
    lessons: await q<LessonRow[]>(supabase.from('lessons').select('*').eq('student_id', id!).order('starts_at', { ascending: false }).limit(20)),
    asg: await q<Assignment[]>(supabase.from('assignments').select('*').eq('student_id', id!).order('created_at', { ascending: false })),
    att: await q<AttemptRow[]>(supabase.from('attempts').select('*,assignments(title)').eq('student_id', id!).order('created_at', { ascending: false })),
  }), [id])
  const [name, setName] = useState(''); const [grade, setGrade] = useState('')
  useEffect(() => { if (data) { setName(data.st.full_name); setGrade(data.st.grade?.toString() ?? '') } }, [data?.st.id])
  if (!data) return <p className="muted">Загрузка…</p>
  const save = async () => { await q(supabase.from('students').update({ full_name: name.trim(), grade: grade ? +grade : null }).eq('id', id!).select()); reload() }
  return (
    <div className="stack">
      <h1>{data.st.full_name}</h1>
      <div className="card stack"><h2>Профиль</h2>
        <input className="input" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Класс" value={grade} onChange={e => setGrade(e.target.value)} />
        <button className="btn" onClick={save}>Сохранить</button>
        <p className="muted">{data.st.user_id ? 'Ученик уже входил в приложение.' : 'Ученик ещё не входил в приложение.'}</p>
      </div>
      <div className="card"><h2>Занятия</h2>{data.lessons.map(l => <div key={l.id} className="row between"><span>{fmtDate(l.starts_at)}, {fmtTime(l.starts_at)}</span><span className="chip">{l.status === 'cancelled' ? 'Отменено' : l.status === 'done' ? 'Проведено' : 'Запланировано'}</span></div>)}{!data.lessons.length && <p className="muted">Занятий нет.</p>}</div>
      <div className="card"><h2>История заданий</h2>{data.asg.map(a => <div key={a.id}>{a.title} <span className="muted">· {fmtDate(a.created_at)}</span></div>)}{!data.asg.length && <p className="muted">Заданий не выдавали.</p>}</div>
      <div className="card"><h2>Результаты</h2>{data.att.map(a => <div key={a.id} className="row between"><span>{a.assignments?.title}</span><b>{a.score} из {a.total} · {pct(a.score, a.total)}%</b></div>)}{!data.att.length && <p className="muted">Результатов пока нет.</p>}</div>
    </div>
  )
}
