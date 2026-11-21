import { useState } from 'react'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { fmtDate, fmtTime, money } from '../lib/format'
import type { LessonRow } from '../types'
export default function FinancePage() {
  const [m, setM] = useState(new Date().toISOString().slice(0, 7))
  const { data, reload } = useAsync(() => {
    const a = new Date(m + '-01'), b = new Date(a); b.setMonth(b.getMonth() + 1)
    return q<LessonRow[]>(supabase.from('lessons').select('*,students(full_name)').neq('status', 'cancelled').gte('starts_at', a.toISOString()).lt('starts_at', b.toISOString()).order('starts_at'))
  }, [m])
  const toggle = async (l: LessonRow) => { await q(supabase.from('lessons').update({ paid: !l.paid, paid_at: l.paid ? null : new Date().toISOString() }).eq('id', l.id).select()); reload() }
  const income = (data ?? []).filter(l => l.paid).reduce((s, l) => s + Number(l.price), 0)
  const debt = (data ?? []).filter(l => !l.paid && l.status === 'done').reduce((s, l) => s + Number(l.price), 0)
  return (
    <div className="stack">
      <h1>Финансы</h1>
      <input className="input" type="month" value={m} onChange={e => setM(e.target.value)} />
      <div className="tiles"><div className="card"><span className="muted">Доход</span><h1>{money(income)}</h1></div><div className="card"><span className="muted">Не оплачено</span><h1>{money(debt)}</h1></div></div>
      <div className="card"><h2>Операции</h2>
        {data?.map(l => (
          <div key={l.id} className="row between" style={{ padding: '6px 0' }}>
            <div className="grow"><b>{l.students?.full_name}</b><div className="muted">{fmtDate(l.starts_at)}, {fmtTime(l.starts_at)} · {money(Number(l.price))}</div></div>
            <button className={l.paid ? 'btn sm ghost' : 'btn sm'} onClick={() => toggle(l)}>{l.paid ? 'Оплачено' : 'Отметить оплату'}</button>
          </div>
        ))}
        {!data?.length && <p className="muted">В этом месяце занятий нет.</p>}
      </div>
    </div>
  )
}
