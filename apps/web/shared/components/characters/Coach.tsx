export default function Coach({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#coach-head)" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* Body */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#coach-body)" />
      {/* Polo collar lines */}
      <path d="M28 33 L32 38 L36 33" stroke="#d97706" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Whistle - circle + cord */}
      <circle cx="42" cy="29" r="3" fill="#fbbf24" />
      <circle cx="42" cy="29" r="1.5" fill="#f59e0b" />
      <line x1="42" y1="26" x2="38" y2="22" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
      <defs>
        <linearGradient id="coach-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8c9a0" />
          <stop offset="1" stopColor="#c4a070" />
        </linearGradient>
        <linearGradient id="coach-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}
