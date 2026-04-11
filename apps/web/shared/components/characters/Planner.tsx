export default function Planner({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#pl-head)" />
      {/* Neat hair */}
      <path d="M20 17 Q22 10 32 9 Q42 10 44 17 Q42 13 32 12 Q22 13 20 17Z" fill="#6b4423" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Pen behind ear */}
      <line x1="43" y1="12" x2="48" y2="8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="48" cy="8" r="1" fill="#ef4444" />
      {/* Body - light blue shirt */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#pl-body)" />
      {/* Button dots */}
      <circle cx="32" cy="38" r="0.8" fill="#1d4ed8" opacity="0.5" />
      <circle cx="32" cy="42" r="0.8" fill="#1d4ed8" opacity="0.5" />
      {/* Clock prop */}
      <circle cx="52" cy="14" r="6" stroke="#3b82f6" strokeWidth="1.5" fill="#09090b" />
      <line x1="52" y1="14" x2="52" y2="10" stroke="#fafafa" strokeWidth="1" strokeLinecap="round" />
      <line x1="52" y1="14" x2="55" y2="14" stroke="#fafafa" strokeWidth="1" strokeLinecap="round" />
      <defs>
        <linearGradient id="pl-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8c9a0" />
          <stop offset="1" stopColor="#c4a070" />
        </linearGradient>
        <linearGradient id="pl-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93c5fd" />
          <stop offset="1" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
    </svg>
  );
}
