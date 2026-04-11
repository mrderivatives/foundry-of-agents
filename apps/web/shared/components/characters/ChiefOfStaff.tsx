export default function ChiefOfStaff({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#cs-head)" />
      {/* Clean hair */}
      <path d="M20 17 Q22 9 32 8 Q42 9 44 17 Q41 12 32 11 Q23 12 20 17Z" fill="#3d2b1f" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Earpiece */}
      <circle cx="44" cy="19" r="2" fill="#3b82f6" />
      <path d="M44 17 Q46 15 45 13" stroke="#3b82f6" strokeWidth="0.8" fill="none" />
      {/* Body - blazer over tee */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#cs-body)" />
      {/* Dark tee underneath */}
      <rect x="26" y="33" width="12" height="8" rx="2" fill="#18181b" />
      {/* Badge on lanyard */}
      <line x1="32" y1="33" x2="32" y2="44" stroke="#71717a" strokeWidth="0.8" />
      <rect x="28" y="44" width="8" height="6" rx="1.5" fill="#fafafa" />
      <rect x="30" y="45.5" width="4" height="1.5" rx="0.5" fill="#3b82f6" />
      <defs>
        <linearGradient id="cs-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d4b08c" />
          <stop offset="1" stopColor="#b08d68" />
        </linearGradient>
        <linearGradient id="cs-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  );
}
