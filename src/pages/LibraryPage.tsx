import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, q } from '../lib/supabase'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../app/providers/AuthProvider'
import type { Folder, TaskRow } from '../types'
type Crumb = { id: string | null; name: string }
export default function LibraryPage() {
  const { userId } = useAuth()
  const [path, setPath] = useState<Crumb[]>([{ id: null, name: 'Библиотека' }])
  const cur = path[path.length - 1].id
  const [search, setSearch] = useState(''); const [sort, setSort] = useState<'name' | 'date'>('name')
  const [name, setName] = useState(''); const [edit, setEdit] = useState<{ id: string; name: string } | null>(null); const [del, setDel] = useState<string | null>(null)
  const { data, reload } = useAsync(async () => {
    const tq = supabase.from('tasks').select('id,title,folder_id,updated_at,questions'); const fq = supabase.from('folders').select('*')
    if (search.trim()) return { folders: [] as Folder[], tasks: await q<TaskRow[]>(tq.ilike('title', `%${search.trim()}%`)) }
    return { folders: await q<Folder[]>(cur ? fq.eq('parent_id', cur) : fq.is('parent_id', null)), tasks: await q<TaskRow[]>(cur ? tq.eq('folder_id', cur) : tq.is('folder_id', null)) }
  }, [cur, search])
  const addFolder = async () => { if (!name.trim()) return; await q(supabase.from('folders').insert({ owner_id: userId, parent_id: cur, name: name.trim() }).select()); setName(''); reload() }
  const rename = async () => { if (edit?.name.trim()) await q(supabase.from('folders').update({ name: edit.name.trim() }).eq('id', edit.id).select()); setEdit(null); reload() }
  const remove = async (table: 'folders' | 'tasks', id: string) => { if (del !== id) return setDel(id); await q(supabase.from(table).delete().eq('id', id).select()); setDel(null); reload() }
  const byName = (a: string, b: string) => a.localeCompare(b, 'ru')
  const folders = [...(data?.folders ?? [])].sort((a, b) => byName(a.name, b.name))
  const tasks = [...(data?.tasks ?? [])].sort((a, b) => (sort === 'name' ? byName(a.title, b.title) : b.updated_at.localeCompare(a.updated_at)))
  return (
    <div className="stack">
      <h1>Библиотека</h1>
      <input className="input" placeholder="Поиск заданий" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="row wrap muted">{path.map((c, i) => <button key={i} className="btn sm ghost" onClick={() => setPath(path.slice(0, i + 1))}>{c.name}</button>)}
        <button className="btn sm ghost" onClick={() => setSort(sort === 'name' ? 'date' : 'name')}>Сортировка: {sort === 'name' ? 'по имени' : 'по дате'}</button></div>
      {folders.map(f => (
        <div key={f.id} className="card row">
          {edit?.id === f.id ? <><input className="input grow" value={edit.name} onChange={e => setEdit({ id: f.id, name: e.target.value })} /><button className="btn sm" onClick={rename}>Сохранить</button></>
            : <><button className="btn ghost grow" style={{ textAlign: 'left' }} onClick={() => setPath([...path, { id: f.id, name: f.name }])}>{f.name}</button>
              <button className="btn sm ghost" onClick={() => setEdit({ id: f.id, name: f.name })}>Изменить</button>
              <button className="btn sm danger" onClick={() => remove('folders', f.id)}>{del === f.id ? 'Точно удалить?' : 'Удалить'}</button></>}
        </div>
      ))}
      {tasks.map(t => (
        <div key={t.id} className="card row"><Link to={`/library/task/${t.id}`} className="grow"><b>{t.title}</b><div className="muted">Вопросов: {t.questions.length}</div></Link>
          <button className="btn sm danger" onClick={() => remove('tasks', t.id)}>{del === t.id ? 'Точно удалить?' : 'Удалить'}</button></div>
      ))}
      {!folders.length && !tasks.length && <p className="muted">Здесь пусто. Создай папку или задание.</p>}
      {!search && <div className="card stack">
        <div className="row"><input className="input" placeholder="Название новой папки" value={name} onChange={e => setName(e.target.value)} /><button className="btn" onClick={addFolder}>Создать папку</button></div>
        <Link className="btn ghost" style={{ textAlign: 'center' }} to={`/library/task/new${cur ? `?folder=${cur}` : ''}`}>Создать задание</Link>
      </div>}
    </div>
  )
}
