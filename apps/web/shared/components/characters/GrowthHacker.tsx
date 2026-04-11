export default function GrowthHacker({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#gh-head)" />
      {/* Hair with purple streak */}
      <path d="M19 18 Q21 8 32 7 Q43 8 45 18 Q42 11 35 10 Q25 10 21 15 Z" fill="#3d2b1f" />
      <path d="M35 10 Q38 8 40 12 Q38 10 36 10Z" fill="#8b5cf6" />
      {/* Eyes - wide/expressive */}
      <circle cx="28" cy="19" r="2" fill="#09090b" />
      <circle cx="36" cy="19" r="2" fill="#09090b" />
      {/* Eye highlights */}
      <circle cx="29" cy="18" r="0.6" fill="#fafafa" />
      <circle cx="37" cy="18" r="0.6" fill="#fafafa" />
      {/* Body */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#gh-body)" />
      {/* Lightning bolt on shirt */}
      <path d="M30 38 L33 38 L31 43 L35 43 L29 51 L31 45 L28 45 Z" fill="#fbbf24" opacity="0.6" />
      {/* Megaphone prop */}
      <path d="M50 12 L58 8 L58 20 L50 16 Z" fill="#a78bfa" />
      <rect x="47" y="12" width="4" height="4" rx="1" fill="#8b5cf6" />
      {/* Upward arrow */}
      <path d="M8 20 L12 12 L16 20 M12 12 L12 28" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <defs>
        <linearGradient id="gh-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8c9a0" />
          <stop offset="1" stopColor="#c4a070" />
        </linearGradient>
        <linearGradient id="gh-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
