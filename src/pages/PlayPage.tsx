import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { isCorrect } from '../lib/grading'
import QuestionView from '../features/assignments/QuestionView'
import type { Assignment } from '../types'
export default function PlayPage() {
  const { id } = useParams()
  const { data: a } = useAsync(() => q<Assignment>(supabase.from('assignments').select('*').eq('id', id!).single()), [id])
  const [i, setI] = useState(0); const [ans, setAns] = useState<Record<string, any>>({}); const [checked, setChecked] = useState(false)
  const [instant, setInstant] = useState(true); const [done, setDone] = useState<{ score: number; total: number } | null>(null); const [err, setErr] = useState('')
  if (!a) return <p className="muted">Загрузка…</p>
  const qs = a.snapshot
  async function finish() {
    const score = qs.filter(x => isCorrect(x, ans[x.id])).length
    try {
      const { count } = await supabase.from('attempts').select('id', { count: 'exact', head: true }).eq('assignment_id', id!)
      await q(supabase.from('attempts').insert({ assignment_id: id, student_id: a!.student_id, answers: ans, score, total: qs.length, attempt_no: (count ?? 0) + 1 }).select())
      setDone({ score, total: qs.length })
    } catch (e: any) { setErr(e.message) }
  }
  if (done) return (
    <div className="stack"><h1>Итог: {done.score} из {done.total}</h1>
      {qs.map(x => <div key={x.id} className="card"><QuestionView q={x} value={ans[x.id]} onChange={() => {}} checked /></div>)}
      <Link className="btn" to="/tasks">К заданиям</Link></div>)
  if (!qs.length) return <p className="muted">В этом задании нет вопросов.</p>
  const x = qs[i]; const last = i === qs.length - 1
  return (
    <div className="stack">
      <div className="row between"><h1>{a.title}</h1><span className="muted">{i + 1} / {qs.length}</span></div>
      <div className="bar"><i style={{ width: `${((i + (checked ? 1 : 0)) / qs.length) * 100}%` }} /></div>
      {i === 0 && !checked && <label className="row muted"><input type="checkbox" checked={instant} onChange={e => setInstant(e.target.checked)} />Проверять сразу после ответа</label>}
      <div className="card"><QuestionView q={x} value={ans[x.id]} onChange={v => setAns({ ...ans, [x.id]: v })} checked={checked} /></div>
      {err && <p style={{ color: 'var(--bad)' }}>{err}</p>}
      {instant && !checked
        ? <button className="btn" disabled={ans[x.id] == null || ans[x.id] === ''} onClick={() => setChecked(true)}>Проверить</button>
        : <button className="btn" onClick={() => { setChecked(false); last ? finish() : setI(i + 1) }}>{last ? 'Завершить' : 'Дальше'}</button>}
    </div>
  )
}
