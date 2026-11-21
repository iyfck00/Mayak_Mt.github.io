import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, q } from '../../lib/supabase'
import { initData } from '../../lib/telegram'
import type { Role } from '../../types'
interface Ctx { role: Role | null; userId: string | null; name: string; loading: boolean; error: string | null; signIn: (e: string, p: string) => Promise<void>; signOut: () => Promise<void> }
const C = createContext<Ctx>(null as unknown as Ctx)
export const useAuth = () => useContext(C)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setRole(null); setUserId(null); return }
    const p = await q<{ role: Role; full_name: string }>(supabase.from('profiles').select('role,full_name').eq('id', session.user.id).single())
    setRole(p.role); setName(p.full_name); setUserId(session.user.id)
  }
  useEffect(() => {
    (async () => {
      try {
        if (initData) {
          const { data, error } = await supabase.functions.invoke('telegram-auth', { body: { initData } })
          if (error) throw error
          await supabase.auth.setSession(data.session)
        }
        await load()
      } catch (e: any) { setError(e.message) } finally { setLoading(false) }
    })()
  }, [])
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await load()
  }
  const signOut = async () => { await supabase.auth.signOut(); setRole(null); setUserId(null) }
  return <C.Provider value={{ role, userId, name, loading, error, signIn, signOut }}>{children}</C.Provider>
}
