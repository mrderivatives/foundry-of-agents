export default function CTO({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#cto-head)" />
      {/* Short fade hair */}
      <path d="M21 16 Q24 9 32 8 Q40 9 43 16 Q40 12 32 11 Q24 12 21 16Z" fill="#1a1a2e" />
      {/* Purple glasses */}
      <rect x="24" y="17" width="7" height="5" rx="1.5" stroke="#8b5cf6" strokeWidth="1" fill="none" />
      <rect x="33" y="17" width="7" height="5" rx="1.5" stroke="#8b5cf6" strokeWidth="1" fill="none" />
      <line x1="31" y1="19" x2="33" y2="19" stroke="#8b5cf6" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="27.5" cy="19.5" r="1.5" fill="#09090b" />
      <circle cx="36.5" cy="19.5" r="1.5" fill="#09090b" />
      {/* Body - purple hoodie */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#cto-body)" />
      {/* Hood drawstrings */}
      <line x1="28" y1="33" x2="27" y2="39" stroke="#6d28d9" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="36" y1="33" x2="37" y2="39" stroke="#6d28d9" strokeWidth="0.8" strokeLinecap="round" />
      {/* Code brackets on body */}
      <text x="26" y="48" fill="#c4b5fd" fontSize="10" fontFamily="monospace" opacity="0.5">&lt;/&gt;</text>
      {/* Rocket pin */}
      <path d="M41 38 L43 34 L45 38 L43 37 Z" fill="#f59e0b" />
      <defs>
        <linearGradient id="cto-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d4b896" />
          <stop offset="1" stopColor="#b09470" />
        </linearGradient>
        <linearGradient id="cto-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
