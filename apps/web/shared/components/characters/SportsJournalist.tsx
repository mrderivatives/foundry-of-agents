export default function SportsJournalist({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#sj-head)" />
      {/* Neat hair */}
      <path d="M20 18 Q21 10 32 9 Q43 10 44 18 Q42 12 32 12 Q22 12 20 18Z" fill="#5c4033" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Thin glasses */}
      <circle cx="28" cy="19" r="4" stroke="#71717a" strokeWidth="0.8" fill="none" />
      <circle cx="36" cy="19" r="4" stroke="#71717a" strokeWidth="0.8" fill="none" />
      <line x1="32" y1="19" x2="32" y2="19" stroke="#71717a" strokeWidth="0.8" />
      {/* Body - blazer */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#sj-body)" />
      {/* Tie */}
      <path d="M32 33 L30 38 L32 44 L34 38 Z" fill="#ef4444" />
      {/* Press badge */}
      <rect x="38" y="38" width="6" height="8" rx="1" fill="#fafafa" />
      <rect x="39" y="39" width="4" height="2" rx="0.5" fill="#3b82f6" />
      {/* Microphone prop */}
      <rect x="8" y="22" width="4" height="14" rx="2" fill="#52525b" />
      <circle cx="10" cy="20" r="4" fill="#71717a" />
      <circle cx="10" cy="20" r="2.5" fill="#52525b" />
      <defs>
        <linearGradient id="sj-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d4b08c" />
          <stop offset="1" stopColor="#b08d68" />
        </linearGradient>
        <linearGradient id="sj-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a5f" />
          <stop offset="1" stopColor="#162d4a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
