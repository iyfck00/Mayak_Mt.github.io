import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { getPref, setPref, Pref } from '../lib/theme'
export default function ProfilePage() {
  const { name, role, signOut } = useAuth(); const [p, setP] = useState<Pref>(getPref())
  const pick = (v: Pref) => { setPref(v); setP(v) }
  return (
    <div className="stack"><h1>Профиль</h1>
      <div className="card"><b>{name || 'Без имени'}</b><div className="muted">{role === 'teacher' ? 'Преподаватель' : 'Ученик'}</div></div>
      <div className="card stack"><h2>Тема</h2><div className="row">{(['auto', 'light', 'dark'] as Pref[]).map(v => <button key={v} className={p === v ? 'btn sm' : 'btn sm ghost'} onClick={() => pick(v)}>{v === 'auto' ? 'Авто' : v === 'light' ? 'Светлая' : 'Тёмная'}</button>)}</div></div>
      {role === 'teacher' && <div className="tiles"><Link className="card" to="/finance">Финансы</Link><Link className="card" to="/assigned">Выданные</Link><Link className="card" to="/results">Результаты</Link><Link className="card" to="/stats">Статистика</Link></div>}
      {role === 'student' && <Link className="card" to="/stats">Мой прогресс</Link>}
      <button className="btn ghost" onClick={signOut}>Выйти</button>
    </div>
  )
}
