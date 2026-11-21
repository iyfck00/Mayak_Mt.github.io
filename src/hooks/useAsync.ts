import { useCallback, useEffect, useState } from 'react'
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const run = useCallback(() => {
    setLoading(true)
    fn().then(d => { setData(d); setError(null) }).catch(e => setError(String(e.message ?? e))).finally(() => setLoading(false))
  }, deps) // eslint-disable-line
  useEffect(run, [run])
  return { data, loading, error, reload: run }
}
