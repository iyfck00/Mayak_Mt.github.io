import type { Question } from '../../types'
import { isCorrect } from '../../lib/grading'
const toggle = (a: string[], id: string) => (a.includes(id) ? a.filter(x => x !== id) : [...a, id])
export default function QuestionView({ q, value, onChange, checked }: { q: Question; value: any; onChange: (v: any) => void; checked: boolean }) {
  const ok = checked && isCorrect(q, value)
  const optCls = (id: string, correct: boolean) => {
    const sel = q.type === 'multi' ? (value ?? []).includes(id) : value === id
    if (checked) return correct ? 'opt right' : sel ? 'opt wrong' : 'opt'
    return sel ? 'opt sel' : 'opt'
  }
  return (
    <div>
      <h3>{q.text || 'Вопрос без текста'}</h3>
      {(q.type === 'single' || q.type === 'multi') && q.options.map(o => (
        <button key={o.id} className={optCls(o.id, o.correct)} disabled={checked}
          onClick={() => onChange(q.type === 'multi' ? toggle(value ?? [], o.id) : o.id)}>{o.text}</button>
      ))}
      {q.type === 'bool' && [true, false].map(b => {
        const sel = value === b
        const cls = checked ? (b === q.answer ? 'opt right' : sel ? 'opt wrong' : 'opt') : sel ? 'opt sel' : 'opt'
        return <button key={String(b)} className={cls} disabled={checked} onClick={() => onChange(b)}>{b ? 'Верно' : 'Неверно'}</button>
      })}
      {q.type === 'number' && <input className="input" style={{ marginTop: 8 }} inputMode="decimal" placeholder="Ваш ответ…" value={value ?? ''} disabled={checked} onChange={e => onChange(e.target.value)} />}
      {checked && (
        <p className="muted" style={{ marginTop: 8 }}>
          <span className={ok ? 'chip ok' : 'chip bad'}>{ok ? 'Верно' : 'Неверно'}</span>
          {!ok && q.type === 'number' && <> Правильный ответ: {String(q.answer)}</>}
          {q.explanation && <><br />{q.explanation}</>}
        </p>
      )}
    </div>
  )
}
