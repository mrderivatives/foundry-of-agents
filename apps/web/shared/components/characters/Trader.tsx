export default function Trader({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#tr-head)" />
      {/* Messy hair */}
      <path d="M20 17 Q22 9 32 8 Q42 9 44 17 Q41 11 36 10 Q28 10 22 14 Z" fill="#5c4033" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Headset arc */}
      <path d="M19 22 Q19 8 32 7 Q45 8 45 22" stroke="#52525b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Ear cups */}
      <rect x="16" y="19" width="5" height="7" rx="2.5" fill="#3f3f46" />
      <rect x="43" y="19" width="5" height="7" rx="2.5" fill="#3f3f46" />
      {/* Mic boom */}
      <path d="M17 25 Q14 30 18 33" stroke="#52525b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="33" r="2" fill="#3f3f46" />
      {/* Body - grey shirt */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#tr-body)" />
      {/* Loosened tie */}
      <path d="M32 34 L31 38 L32 44 L33 38 Z" fill="#10b981" opacity="0.7" />
      {/* Screen glow */}
      <rect x="4" y="38" width="8" height="12" rx="1" fill="#10b981" opacity="0.15" />
      <rect x="52" y="38" width="8" height="12" rx="1" fill="#10b981" opacity="0.15" />
      <defs>
        <linearGradient id="tr-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0c4a0" />
          <stop offset="1" stopColor="#bca078" />
        </linearGradient>
        <linearGradient id="tr-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a1a1aa" />
          <stop offset="1" stopColor="#71717a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
