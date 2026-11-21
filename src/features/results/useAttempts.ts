import { supabase, q } from '../../lib/supabase'
import { useAsync } from '../../hooks/useAsync'
import type { AttemptRow } from '../../types'
export const useAttempts = () => useAsync(() => q<AttemptRow[]>(supabase.from('attempts').select('*,assignments(title),students(full_name)').order('created_at', { ascending: false })), [])
