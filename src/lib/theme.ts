import { tgScheme } from './telegram'
export type Pref = 'auto' | 'light' | 'dark'
export const getPref = (): Pref => (localStorage.getItem('theme') as Pref) || 'auto'
export function applyTheme(p: Pref = getPref()) {
  const sys = tgScheme() ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  document.documentElement.dataset.theme = p === 'auto' ? sys : p
}
export function setPref(p: Pref) { localStorage.setItem('theme', p); applyTheme(p) }
