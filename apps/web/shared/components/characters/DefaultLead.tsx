export default function DefaultLead({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#dl-head)" />
      {/* Clean medium hair */}
      <path d="M20 18 Q21 8 32 7 Q43 8 44 18 Q42 12 32 10 Q22 12 20 18Z" fill="#4a3728" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Body - dark smart casual */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#dl-body)" />
      {/* Collar */}
      <path d="M27 33 L30 37 L32 35 L34 37 L37 33" stroke="#1e293b" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Star badge on chest */}
      <path d="M32 39 L33.5 42 L37 42.5 L34.5 44.5 L35 48 L32 46.5 L29 48 L29.5 44.5 L27 42.5 L30.5 42 Z" fill="#06b6d4" opacity="0.7" />
      {/* Headset */}
      <path d="M20 22 Q20 10 32 9 Q44 10 44 22" stroke="#06b6d4" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="17" y="20" width="4" height="5" rx="2" fill="#06b6d4" opacity="0.7" />
      <rect x="43" y="20" width="4" height="5" rx="2" fill="#06b6d4" opacity="0.7" />
      <defs>
        <linearGradient id="dl-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0c8a8" />
          <stop offset="1" stopColor="#bfa580" />
        </linearGradient>
        <linearGradient id="dl-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#27272a" />
          <stop offset="1" stopColor="#18181b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
