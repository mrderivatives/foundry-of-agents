export default function CareerAnalyst({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#ca-head)" />
      {/* Receding neat hair */}
      <path d="M22 15 Q25 9 32 8 Q39 9 42 15 Q39 11 32 11 Q25 11 22 15Z" fill="#5c4033" />
      {/* Rectangular glasses */}
      <rect x="24" y="17" width="7" height="5" rx="1.5" stroke="#3b82f6" strokeWidth="1" fill="none" />
      <rect x="33" y="17" width="7" height="5" rx="1.5" stroke="#3b82f6" strokeWidth="1" fill="none" />
      <line x1="31" y1="19" x2="33" y2="19" stroke="#3b82f6" strokeWidth="1" />
      {/* Eyes behind glasses */}
      <circle cx="27.5" cy="19.5" r="1.5" fill="#09090b" />
      <circle cx="36.5" cy="19.5" r="1.5" fill="#09090b" />
      {/* Body - sweater vest */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#ca-body)" />
      {/* White collar peek */}
      <path d="M27 33 L29 36 L32 34 L35 36 L37 33" stroke="#fafafa" strokeWidth="0.8" fill="none" />
      {/* Laptop prop */}
      <rect x="48" y="18" width="12" height="8" rx="1.5" fill="#3f3f46" />
      <rect x="46" y="26" width="16" height="2" rx="1" fill="#52525b" />
      {/* Screen glow */}
      <rect x="49" y="19" width="10" height="6" rx="0.5" fill="#3b82f6" opacity="0.2" />
      <defs>
        <linearGradient id="ca-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dcc0a0" />
          <stop offset="1" stopColor="#b89878" />
        </linearGradient>
        <linearGradient id="ca-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
