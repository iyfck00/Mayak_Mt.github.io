// Проверяет Telegram initData на сервере и выдаёт сессию Supabase.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const enc = new TextEncoder()
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
async function hmac(key: Uint8Array, data: string) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data)))
}
const hex = (u: Uint8Array) => [...u].map(b => b.toString(16).padStart(2, '0')).join('')
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const { initData } = await req.json()
  const p = new URLSearchParams(initData)
  const hash = p.get('hash'); p.delete('hash')
  const check = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n')
  const secret = await hmac(enc.encode('WebAppData'), Deno.env.get('BOT_TOKEN')!)
  if (hex(await hmac(secret, check)) !== hash) return json({ error: 'bad signature' }, 401)
  if (Date.now() / 1000 - Number(p.get('auth_date')) > 86400) return json({ error: 'expired' }, 401)
  const u = JSON.parse(p.get('user')!)
  const email = `tg${u.id}@mayak.local`
  const password = hex(await hmac(enc.encode(Deno.env.get('AUTH_SALT')!), String(u.id)))
  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  await admin.auth.admin.createUser({ email, password, email_confirm: true }) // если уже есть — ошибку игнорируем
  const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { data, error } = await anon.auth.signInWithPassword({ email, password })
  if (error || !data.session) return json({ error: error?.message ?? 'no session' }, 500)
  const id = data.user.id
  const isTeacher = String(u.id) === Deno.env.get('TEACHER_TG_ID')
  await admin.from('profiles').update({ tg_id: u.id, full_name: [u.first_name, u.last_name].filter(Boolean).join(' '), ...(isTeacher ? { role: 'teacher' } : {}) }).eq('id', id)
  await admin.from('students').update({ user_id: id }).eq('tg_id', u.id).is('user_id', null)
  return json({ session: data.session })
})
