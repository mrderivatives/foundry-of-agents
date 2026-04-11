export default function Quant({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head - slightly angular */}
      <circle cx="32" cy="20" r="12" fill="url(#qt-head)" />
      {/* Clean short hair */}
      <path d="M20 16 Q23 8 32 8 Q41 8 44 16 Q41 11 32 11 Q23 11 20 16Z" fill="#1a1a2e" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Body - black turtleneck */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#qt-body)" />
      {/* Turtleneck collar */}
      <rect x="26" y="31" width="12" height="4" rx="2" fill="#27272a" />
      {/* Binary dots pattern on body */}
      <circle cx="24" cy="40" r="1" fill="#10b981" opacity="0.3" />
      <circle cx="28" cy="43" r="1" fill="#10b981" opacity="0.2" />
      <circle cx="32" cy="40" r="1" fill="#10b981" opacity="0.4" />
      <circle cx="36" cy="43" r="1" fill="#10b981" opacity="0.2" />
      <circle cx="40" cy="40" r="1" fill="#10b981" opacity="0.3" />
      <circle cx="24" cy="47" r="1" fill="#10b981" opacity="0.2" />
      <circle cx="32" cy="47" r="1" fill="#10b981" opacity="0.3" />
      <circle cx="40" cy="47" r="1" fill="#10b981" opacity="0.2" />
      {/* Earpiece */}
      <circle cx="44" cy="20" r="2" fill="#10b981" />
      <circle cx="44" cy="20" r="1" fill="#09090b" />
      <defs>
        <linearGradient id="qt-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d4b896" />
          <stop offset="1" stopColor="#b09470" />
        </linearGradient>
        <linearGradient id="qt-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#18181b" />
          <stop offset="1" stopColor="#09090b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
