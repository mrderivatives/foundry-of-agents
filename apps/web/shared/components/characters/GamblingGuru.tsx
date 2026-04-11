export default function GamblingGuru({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#gg-head)" />
      {/* Slicked hair */}
      <path d="M20 17 Q22 8 32 7 Q42 8 44 17 L42 14 Q38 10 32 10 Q26 10 22 14 Z" fill="#1a1a2e" />
      {/* Sunglasses */}
      <rect x="23" y="17" width="8" height="5" rx="2" fill="#18181b" />
      <rect x="33" y="17" width="8" height="5" rx="2" fill="#18181b" />
      <line x1="31" y1="19" x2="33" y2="19" stroke="#18181b" strokeWidth="1.5" />
      {/* Lens shine */}
      <rect x="24" y="18" width="3" height="1" rx="0.5" fill="#f59e0b" opacity="0.4" />
      <rect x="34" y="18" width="3" height="1" rx="0.5" fill="#f59e0b" opacity="0.4" />
      {/* Body - leather jacket */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#gg-body)" />
      {/* Jacket lapel */}
      <path d="M28 33 L32 40" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M36 33 L32 40" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />
      {/* Dice floating */}
      <rect x="48" y="10" width="10" height="10" rx="2" fill="#fafafa" transform="rotate(15 53 15)" />
      <circle cx="51" cy="13" r="1" fill="#09090b" />
      <circle cx="55" cy="17" r="1" fill="#09090b" />
      <circle cx="53" cy="15" r="1" fill="#09090b" />
      <defs>
        <linearGradient id="gg-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0c8a8" />
          <stop offset="1" stopColor="#bfa580" />
        </linearGradient>
        <linearGradient id="gg-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#27272a" />
          <stop offset="1" stopColor="#18181b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
