const tg = (window as any).Telegram?.WebApp
export const initData: string = tg?.initData ?? ''
export const tgScheme = (): 'light' | 'dark' | undefined => tg?.colorScheme
export function initTelegram() { tg?.ready(); tg?.expand() }
