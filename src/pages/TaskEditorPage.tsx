import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../app/providers/AuthProvider'
import QuestionView from '../features/assignments/QuestionView'
import type { Question, QType, Student, TaskRow } from '../types'
const uid = () => crypto.randomUUID()
const TYPES: [QType, string][] = [['single', 'Один правильный ответ'], ['multi', 'Несколько правильных ответов'], ['bool', 'Верно/неверно'], ['number', 'Числовой ввод']]
const newQ = (type: QType): Question => ({ id: uid(), type, text: '', explanation: '', options: type === 'single' || type === 'multi' ? [{ id: uid(), text: '', correct: true }, { id: uid(), text: '', correct: false }] : [], answer: type === 'bool' ? true : undefined })
export default function TaskEditorPage() {
  const { id } = useParams(); const [sp] = useSearchParams(); const nav = useNavigate(); const { userId } = useAuth()
  const isNew = id === 'new'
  const [title, setTitle] = useState(''); const [qs, setQs] = useState<Question[]>([]); const [preview, setPreview] = useState(false); const [msg, setMsg] = useState('')
  const [pick, setPick] = useState<string[]>([]); const [comment, setComment] = useState('')
  const { data: task } = useAsync(() => (isNew ? Promise.resolve(null) : q<TaskRow>(supabase.from('tasks').select('*').eq('id', id!).single())), [id])
  const { data: students } = useAsync(() => q<Student[]>(supabase.from('students').select('*').order('full_name')), [])
  useEffect(() => { if (task) { setTitle(task.title); setQs(task.questions) } }, [task?.id])
  const set = (i: number, p: Partial<Question>) => setQs(qs.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const move = (i: number, d: number) => { const a = [...qs]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setQs(a) }
  async function save() {
    if (!title.trim()) return setMsg('Введи название задания')
    if (qs.some(x => !x.text.trim())) return setMsg('У каждого вопроса должен быть текст')
    try {
      if (isNew) { const r = await q<{ id: string }>(supabase.from('tasks').insert({ owner_id: userId, folder_id: sp.get('folder'), title: title.trim(), questions: qs }).select('id').single()); nav(`/library/task/${r.id}`, { replace: true }) }
      else await q(supabase.from('tasks').update({ title: title.trim(), questions: qs, updated_at: new Date().toISOString() }).eq('id', id!).select())
      setMsg('Сохранено')
    } catch (e: any) { setMsg(e.message) }
  }
  async function issue() {
    if (!pick.length) return setMsg('Выбери хотя бы одного ученика')
    try { const n = await q<number>(supabase.rpc('assign_task', { p_task: id, p_students: pick, p_comment: comment || null })); setMsg(`Выдано: ${n}`); setPick([]); setComment('') } catch (e: any) { setMsg(e.message) }
  }
  return (
    <div className="stack">
      <h1>{isNew ? 'Новое задание' : 'Задание'}</h1>
      <input className="input" placeholder="Название задания" value={title} onChange={e => setTitle(e.target.value)} />
      {preview ? qs.map(x => <div key={x.id} className="card"><QuestionView q={x} value={undefined} onChange={() => {}} checked={false} /></div>) : qs.map((x, i) => (
        <div key={x.id} className="card stack">
          <div className="row between"><select className="input" value={x.type} onChange={e => setQs(qs.map((y, j) => (j === i ? { ...newQ(e.target.value as QType), id: x.id, text: x.text } : y)))}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <textarea className="input" rows={2} placeholder="Текст вопроса" value={x.text} onChange={e => set(i, { text: e.target.value })} />
          {x.options.map((o, k) => (
            <div key={o.id} className="row"><input type={x.type === 'single' ? 'radio' : 'checkbox'} aria-label="Правильный ответ" checked={o.correct} onChange={e => set(i, { options: x.options.map((p, m) => (x.type === 'single' ? { ...p, correct: m === k } : m === k ? { ...p, correct: e.target.checked } : p)) })} />
              <input className="input" placeholder={`Вариант ${k + 1}`} value={o.text} onChange={e => set(i, { options: x.options.map((p, m) => (m === k ? { ...p, text: e.target.value } : p)) })} />
              <button className="btn sm danger" onClick={() => set(i, { options: x.options.filter((_, m) => m !== k) })}>×</button></div>
          ))}
          {(x.type === 'single' || x.type === 'multi') && <button className="btn sm ghost" onClick={() => set(i, { options: [...x.options, { id: uid(), text: '', correct: false }] })}>Добавить вариант</button>}
          {x.type === 'bool' && <select className="input" value={String(x.answer)} onChange={e => set(i, { answer: e.target.value === 'true' })}><option value="true">Верно</option><option value="false">Неверно</option></select>}
          {x.type === 'number' && <input className="input" inputMode="decimal" placeholder="Правильный ответ" value={x.answer ?? ''} onChange={e => set(i, { answer: e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.')) })} />}
          <input className="input" placeholder="Объяснение (необязательно)" value={x.explanation ?? ''} onChange={e => set(i, { explanation: e.target.value })} />
          <div className="row wrap"><button className="btn sm ghost" onClick={() => move(i, -1)}>Выше</button><button className="btn sm ghost" onClick={() => move(i, 1)}>Ниже</button><button className="btn sm danger" onClick={() => setQs(qs.filter((_, j) => j !== i))}>Удалить вопрос</button></div>
        </div>
      ))}
      {!preview && <div className="card stack"><h2>Добавить вопрос</h2><div className="row wrap">{TYPES.map(([v, l]) => <button key={v} className="btn sm ghost" onClick={() => setQs([...qs, newQ(v)])}>{l}</button>)}</div></div>}
      <div className="row wrap"><button className="btn" onClick={save}>Сохранить задание</button><button className="btn ghost" onClick={() => setPreview(!preview)}>{preview ? 'Вернуться к редактору' : 'Предпросмотр для ученика'}</button></div>
      {msg && <p className="muted" role="status">{msg}</p>}
      {!isNew && <div className="card stack"><h2>Выдать ученикам</h2>
        {students?.map(s => <label key={s.id} className="row"><input type="checkbox" checked={pick.includes(s.id)} onChange={e => setPick(e.target.checked ? [...pick, s.id] : pick.filter(x => x !== s.id))} />{s.full_name}</label>)}
        <input className="input" placeholder="Комментарий (необязательно)" value={comment} onChange={e => setComment(e.target.value)} />
        <button className="btn" onClick={issue}>Выдать</button></div>}
    </div>
  )
}
