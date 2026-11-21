import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'
const T = [['/', 'Главная', 'home'], ['/students', 'Ученики', 'users'], ['/schedule', 'Занятия', 'cal'], ['/library', 'Задания', 'folder'], ['/profile', 'Профиль', 'user']]
const S = [['/', 'Главная', 'home'], ['/schedule', 'Занятия', 'cal'], ['/tasks', 'Задания', 'check'], ['/results', 'Результаты', 'chart'], ['/profile', 'Профиль', 'user']]
export default function Layout() {
  const { role } = useAuth()
  return (
    <div className="shell">
      <div className="top"><Logo /></div>
      <nav className="nav" aria-label="Основная навигация">
        <div className="brand"><Logo /></div>
        {(role === 'teacher' ? T : S).map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'}><Icon n={icon} />{label}</NavLink>
        ))}
      </nav>
      <main className="page"><Outlet /></main>
    </div>
  )
}
