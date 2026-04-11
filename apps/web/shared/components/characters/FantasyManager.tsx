export default function FantasyManager({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#fm-head)" />
      {/* Beanie/hood */}
      <path d="M20 18 Q20 8 32 8 Q44 8 44 18" fill="#6b7280" />
      <rect x="20" y="16" width="24" height="4" rx="2" fill="#4b5563" />
      {/* Eyes */}
      <circle cx="28" cy="21" r="1.5" fill="#09090b" />
      <circle cx="36" cy="21" r="1.5" fill="#09090b" />
      {/* Body - hoodie */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#fm-body)" />
      {/* Hood strings */}
      <line x1="28" y1="33" x2="27" y2="40" stroke="#52525b" strokeWidth="1" strokeLinecap="round" />
      <line x1="36" y1="33" x2="37" y2="40" stroke="#52525b" strokeWidth="1" strokeLinecap="round" />
      {/* Coffee cup */}
      <rect x="47" y="16" width="8" height="10" rx="2" fill="#92400e" />
      <rect x="47" y="14" width="8" height="3" rx="1" fill="#a16207" />
      {/* Steam */}
      <path d="M49 12 Q50 9 49 7" stroke="#71717a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M53 12 Q54 9 53 7" stroke="#71717a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <defs>
        <linearGradient id="fm-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dbb896" />
          <stop offset="1" stopColor="#b8956c" />
        </linearGradient>
        <linearGradient id="fm-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6b7280" />
          <stop offset="1" stopColor="#4b5563" />
        </linearGradient>
      </defs>
    </svg>
  );
}
