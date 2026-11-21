import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../app/providers/AuthProvider'
import type { Student } from '../types'
export default function StudentsPage() {
  const { userId } = useAuth()
  const [s, setS] = useState(''); const [f, setF] = useState({ full_name: '', grade: '', tg_id: '' }); const [err, setErr] = useState('')
  const { data, reload } = useAsync(() => q<Student[]>(supabase.from('students').select('*').order('full_name')), [])
  async function add() {
    if (!f.full_name.trim()) return setErr('Введи имя ученика')
    try {
      await q(supabase.from('students').insert({ teacher_id: userId, full_name: f.full_name.trim(), grade: f.grade ? +f.grade : null, tg_id: f.tg_id ? +f.tg_id : null }).select())
      setF({ full_name: '', grade: '', tg_id: '' }); setErr(''); reload()
    } catch (e: any) { setErr(e.message) }
  }
  const list = (data ?? []).filter(x => x.full_name.toLowerCase().includes(s.toLowerCase()))
  return (
    <div className="stack">
      <h1>Ученики</h1>
      <input className="input" placeholder="Поиск" value={s} onChange={e => setS(e.target.value)} />
      {list.map(x => <Link key={x.id} to={`/students/${x.id}`} className="card row between"><b>{x.full_name}</b><span className="muted">{x.grade ? `${x.grade} класс` : ''}</span></Link>)}
      {!list.length && <p className="muted">Учеников пока нет. Добавь первого ниже.</p>}
      <div className="card stack"><h2>Новый ученик</h2>
        <input className="input" placeholder="Имя и фамилия" value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} />
        <input className="input" placeholder="Класс" inputMode="numeric" value={f.grade} onChange={e => setF({ ...f, grade: e.target.value })} />
        <input className="input" placeholder="Telegram ID ученика (для входа)" inputMode="numeric" value={f.tg_id} onChange={e => setF({ ...f, tg_id: e.target.value })} />
        {err && <p style={{ color: 'var(--bad)' }}>{err}</p>}
        <button className="btn" onClick={add}>Добавить ученика</button>
      </div>
    </div>
  )
}
