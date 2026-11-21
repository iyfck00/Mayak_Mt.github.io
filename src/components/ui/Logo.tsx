export default function Logo({ className = 'logo' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 124 100" role="img" aria-label="MAYAK.MAT">
      <polygon fill="currentColor" points="10,90 10,20 26,20 52,56 78,20 92,20 92,90 78,90 78,46 52,82 26,46 26,90" />
      <polygon fill="#C49A70" points="97,30 122,14 122,46 97,38" />
    </svg>
  )
}
