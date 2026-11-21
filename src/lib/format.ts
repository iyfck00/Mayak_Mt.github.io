export const fmtDate = (s: string) => new Date(s).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })
export const fmtTime = (s: string) => new Date(s).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
export const money = (n: number) => new Intl.NumberFormat('ru-RU').format(n)
export const toLocalInput = (s: string) => { const d = new Date(s); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }
export const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)
