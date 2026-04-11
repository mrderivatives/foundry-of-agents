export default function ManagingDirector({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#md-head)" />
      {/* Slicked-back hair with grey */}
      <path d="M20 17 Q22 8 32 7 Q42 8 44 17 L42 13 Q38 9 32 9 Q26 9 22 13 Z" fill="#6b7280" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Body - navy suit */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#md-body)" />
      {/* Suit lapels */}
      <path d="M26 33 L30 42" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 33 L34 42" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      {/* Emerald tie */}
      <path d="M32 33 L30 39 L32 48 L34 39 Z" fill="#10b981" />
      <defs>
        <linearGradient id="md-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dcc0a0" />
          <stop offset="1" stopColor="#b89878" />
        </linearGradient>
        <linearGradient id="md-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e293b" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
