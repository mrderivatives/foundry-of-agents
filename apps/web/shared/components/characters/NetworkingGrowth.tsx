export default function NetworkingGrowth({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#ng-head)" />
      {/* Voluminous hair */}
      <path d="M18 18 Q19 6 32 5 Q45 6 46 18 Q44 10 38 8 Q26 7 20 14 Z" fill="#3d2b1f" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Body - open collar blazer */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#ng-body)" />
      {/* Open collar */}
      <path d="M28 33 L30 38" stroke="#1e40af" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M36 33 L34 38" stroke="#1e40af" strokeWidth="1.2" strokeLinecap="round" />
      {/* Connection dots network */}
      <circle cx="50" cy="10" r="3" fill="#3b82f6" opacity="0.6" />
      <circle cx="56" cy="20" r="2.5" fill="#3b82f6" opacity="0.4" />
      <circle cx="52" cy="28" r="2" fill="#3b82f6" opacity="0.5" />
      <line x1="50" y1="13" x2="55" y2="18" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
      <line x1="55" y1="22" x2="52" y2="26" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
      <line x1="50" y1="12" x2="52" y2="26" stroke="#3b82f6" strokeWidth="0.8" opacity="0.2" />
      <defs>
        <linearGradient id="ng-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d4b896" />
          <stop offset="1" stopColor="#b09470" />
        </linearGradient>
        <linearGradient id="ng-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
