export default function Analyst({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#an-head)" />
      {/* Tidy hair */}
      <path d="M20 17 Q22 10 32 9 Q42 10 44 17 Q42 13 32 12 Q22 13 20 17Z" fill="#4a3728" />
      {/* Round glasses */}
      <circle cx="27" cy="19" r="4.5" stroke="#10b981" strokeWidth="1.2" fill="none" />
      <circle cx="37" cy="19" r="4.5" stroke="#10b981" strokeWidth="1.2" fill="none" />
      <line x1="31.5" y1="19" x2="32.5" y2="19" stroke="#10b981" strokeWidth="1.2" />
      {/* Eyes behind glasses */}
      <circle cx="27" cy="19" r="1.5" fill="#09090b" />
      <circle cx="37" cy="19" r="1.5" fill="#09090b" />
      {/* Body - light blue shirt */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#an-body)" />
      {/* Rolled sleeves hint */}
      <rect x="18" y="45" width="4" height="2" rx="1" fill="#e0f2fe" opacity="0.3" />
      <rect x="42" y="45" width="4" height="2" rx="1" fill="#e0f2fe" opacity="0.3" />
      {/* Magnifying glass prop */}
      <circle cx="52" cy="14" r="6" stroke="#10b981" strokeWidth="2" fill="none" />
      <line x1="56" y1="19" x2="60" y2="24" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="an-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8c9a0" />
          <stop offset="1" stopColor="#c4a070" />
        </linearGradient>
        <linearGradient id="an-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
