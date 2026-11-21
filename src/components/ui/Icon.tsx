const P: Record<string, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10', users: 'M16 20v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a3 3 0 100-6 3 3 0 000 6M20 20v-1a3 3 0 00-2-2.8',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', folder: 'M3 6h6l2 2h10v11H3z', user: 'M12 12a4 4 0 100-8 4 4 0 000 8M4 21a8 8 0 0116 0',
  check: 'M4 4h16v16H4zM8 12l3 3 5-6', chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
}
export default function Icon({ n }: { n: string }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={P[n]} /></svg>
}
