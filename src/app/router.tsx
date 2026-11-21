import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './providers/AuthProvider'
import { envOk } from '../lib/supabase'
import Layout from '../components/layout/Layout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import StudentsPage from '../pages/StudentsPage'
import StudentPage from '../pages/StudentPage'
import SchedulePage from '../pages/SchedulePage'
import FinancePage from '../pages/FinancePage'
import LibraryPage from '../pages/LibraryPage'
import TaskEditorPage from '../pages/TaskEditorPage'
import AssignedPage from '../pages/AssignedPage'
import TasksPage from '../pages/TasksPage'
import PlayPage from '../pages/PlayPage'
import ResultsPage from '../pages/ResultsPage'
import StatsPage from '../pages/StatsPage'
import ProfilePage from '../pages/ProfilePage'
export default function Router() {
  const { role, loading, error } = useAuth()
  if (!envOk) return <div className="shell"><div className="card stack"><h2>Не настроен Supabase</h2><p>Создай файл <code>.env</code> рядом с package.json (скопируй .env.example) и укажи VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY. Потом перезапусти <code>npm run dev</code>.</p></div></div>
  if (loading) return <div className="shell"><p className="muted">Загрузка…</p></div>
  if (!role) return <LoginPage error={error} />
  return (
    <HashRouter><Routes><Route element={<Layout />}>
      <Route index element={<DashboardPage />} />
      {role === 'teacher' ? (<>
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="library/task/:id" element={<TaskEditorPage />} />
        <Route path="assigned" element={<AssignedPage />} />
      </>) : (<>
        <Route path="tasks" element={<TasksPage />} />
        <Route path="play/:id" element={<PlayPage />} />
      </>)}
      <Route path="schedule" element={<SchedulePage />} />
      <Route path="results" element={<ResultsPage />} />
      <Route path="stats" element={<StatsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Route></Routes></HashRouter>
  )
}
