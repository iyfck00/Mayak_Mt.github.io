import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const envOk = Boolean(url && key)
// Без .env приложение показывает подсказку, а не падает белым экраном
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')
export async function q<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p
  if (error) throw new Error(error.message)
  return data as T
}
