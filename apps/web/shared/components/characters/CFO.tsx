export default function CFO({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#cfo-head)" />
      {/* Neat parted grey hair */}
      <path d="M20 17 Q22 9 32 8 Q42 9 44 17 Q42 12 32 11 Q22 12 20 17Z" fill="#9ca3af" />
      {/* Part line */}
      <line x1="28" y1="9" x2="26" y2="16" stroke="#71717a" strokeWidth="0.6" />
      {/* Half-moon glasses */}
      <path d="M23 19 Q27.5 24 32 19" stroke="#a78bfa" strokeWidth="1" fill="none" />
      <path d="M32 19 Q36.5 24 41 19" stroke="#a78bfa" strokeWidth="1" fill="none" />
      {/* Eyes above glasses */}
      <circle cx="27.5" cy="18" r="1.5" fill="#09090b" />
      <circle cx="36.5" cy="18" r="1.5" fill="#09090b" />
      {/* Body - dark purple suit */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#cfo-body)" />
      {/* Suit lapels */}
      <path d="M26 33 L30 42" stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M38 33 L34 42" stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" />
      {/* Tie */}
      <path d="M32 34 L31 38 L32 44 L33 38 Z" fill="#8b5cf6" />
      {/* Calculator prop */}
      <rect x="48" y="14" width="10" height="14" rx="1.5" fill="#27272a" />
      <rect x="49" y="15" width="8" height="4" rx="0.5" fill="#22c55e" opacity="0.3" />
      {/* Calculator buttons grid */}
      <circle cx="51" cy="22" r="1" fill="#52525b" />
      <circle cx="53" cy="22" r="1" fill="#52525b" />
      <circle cx="55" cy="22" r="1" fill="#52525b" />
      <circle cx="51" cy="25" r="1" fill="#52525b" />
      <circle cx="53" cy="25" r="1" fill="#52525b" />
      <circle cx="55" cy="25" r="1" fill="#52525b" />
      <defs>
        <linearGradient id="cfo-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dcc0a0" />
          <stop offset="1" stopColor="#b89878" />
        </linearGradient>
        <linearGradient id="cfo-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b0764" />
          <stop offset="1" stopColor="#2e1065" />
        </linearGradient>
      </defs>
    </svg>
  );
}
