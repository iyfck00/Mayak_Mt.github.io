import type { Question } from '../types'
export function isCorrect(q: Question, a: any): boolean {
  if (q.type === 'single') return q.options.some(o => o.correct && o.id === a)
  if (q.type === 'multi') {
    const s = new Set<string>(a ?? []); const c = q.options.filter(o => o.correct).map(o => o.id)
    return c.length > 0 && c.length === s.size && c.every(i => s.has(i))
  }
  if (q.type === 'bool') return a === q.answer
  return a !== '' && a != null && Number(String(a).replace(',', '.')) === Number(q.answer)
}
