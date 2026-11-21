import { useState } from 'react'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../app/providers/AuthProvider'
import { fmtDate, fmtTime, toLocalInput } from '../lib/format'
import type { LessonRow, Student } from '../types'
export default function SchedulePage() {
  const { role, userId } = useAuth(); const t = role === 'teacher'
  const { data, reload } = useAsync(async () => ({
    lessons: await q<LessonRow[]>((supabase.from(t ? 'lessons' : 'my_lessons') as any).select(t ? '*,students(full_name)' : '*').order('starts_at')),
    students: t ? await q<Student[]>(supabase.from('students').select('*').order('full_name')) : [],
  }), [role])
  const [f, setF] = useState({ student_id: '', starts_at: '', duration_min: '60', topic: '', price: '' }); const [err, setErr] = useState(''); const [edit, setEdit] = useState<string | null>(null)
  async function add() {
    if (!f.student_id || !f.starts_at) return setErr('Выбери ученика и время')
    try {
      await q(supabase.from('lessons').insert({ teacher_id: userId, student_id: f.student_id, starts_at: new Date(f.starts_at).toISOString(), duration_min: +f.duration_min || 60, topic: f.topic, price: +f.price || 0 }).select())
      setF({ ...f, starts_at: '', topic: '' }); setErr(''); reload()
    } catch (e: any) { setErr(e.message) }
  }
  const upd = async (id: string, patch: object) => { await q(supabase.from('lessons').update(patch).eq('id', id).select()); setEdit(null); reload() }
  const days: Record<string, LessonRow[]> = {}
  ;(data?.lessons ?? []).forEach(l => { (days[new Date(l.starts_at).toDateString()] ||= []).push(l) })
  return (
    <div className="stack">
      <h1>Расписание</h1>
      {Object.entries(days).map(([d, ls]) => (
        <div key={d} className="card"><h2>{fmtDate(ls[0].starts_at)}</h2>
          {ls.map(l => (
            <div key={l.id} className="stack" style={{ padding: '8px 0' }}>
              <div className="row between"><b>{fmtTime(l.starts_at)} · {l.duration_min} мин {t && l.students?.full_name ? `· ${l.students.full_name}` : ''}</b>
                <span>{l.status === 'cancelled' && <span className="chip bad">Отменено</span>} {l.rescheduled && l.status !== 'cancelled' && <span className="chip">Перенесено</span>} {l.status === 'done' && <span className="chip ok">Проведено</span>}</span></div>
              {l.topic && <span className="muted">{l.topic}{t && l.price ? ` · ${l.price}` : ''}</span>}
              {t && l.status === 'planned' && <div className="row wrap">
                <button className="btn sm ghost" onClick={() => upd(l.id, { status: 'done' })}>Проведено</button>
                <button className="btn sm ghost" onClick={() => setEdit(edit === l.id ? null : l.id)}>Перенести</button>
                <button className="btn sm danger" onClick={() => upd(l.id, { status: 'cancelled' })}>Отменить</button>
              </div>}
              {edit === l.id && <input className="input" type="datetime-local" defaultValue={toLocalInput(l.starts_at)} onChange={e => e.target.value && upd(l.id, { starts_at: new Date(e.target.value).toISOString(), rescheduled: true })} />}
            </div>
          ))}
        </div>
      ))}
      {!data?.lessons.length && <p className="muted">Занятий пока нет.</p>}
      {t && <div className="card stack"><h2>Новое занятие</h2>
        <select className="input" value={f.student_id} onChange={e => setF({ ...f, student_id: e.target.value })}><option value="">Ученик</option>{data?.students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select>
        <input className="input" type="datetime-local" value={f.starts_at} onChange={e => setF({ ...f, starts_at: e.target.value })} />
        <div className="row"><input className="input" placeholder="Минут" inputMode="numeric" value={f.duration_min} onChange={e => setF({ ...f, duration_min: e.target.value })} /><input className="input" placeholder="Стоимость" inputMode="decimal" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></div>
        <input className="input" placeholder="Тема" value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })} />
        {err && <p style={{ color: 'var(--bad)' }}>{err}</p>}
        <button className="btn" onClick={add}>Добавить занятие</button>
      </div>}
    </div>
  )
}
