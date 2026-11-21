import { useState } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import Logo from '../components/ui/Logo'
export default function LoginPage({ error }: { error: string | null }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState<string | null>(error)
  return (
    <div className="shell"><div className="page stack">
      <Logo /><h1>Вход</h1>
      <p className="muted">В Telegram вход выполняется автоматически. В браузере войди по почте и паролю.</p>
      {err && <p style={{ color: 'var(--bad)' }}>{err}</p>}
      <input className="input" type="email" placeholder="Почта" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Пароль" value={pw} onChange={e => setPw(e.target.value)} />
      <button className="btn" onClick={() => signIn(email, pw).catch(e => setErr(e.message))}>Войти</button>
    </div></div>
  )
}
