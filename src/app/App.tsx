import { useEffect } from 'react'
import { AuthProvider } from './providers/AuthProvider'
import Router from './router'
import { initTelegram } from '../lib/telegram'
import { applyTheme } from '../lib/theme'
export default function App() {
  useEffect(() => { initTelegram(); applyTheme() }, [])
  return <AuthProvider><Router /></AuthProvider>
}
