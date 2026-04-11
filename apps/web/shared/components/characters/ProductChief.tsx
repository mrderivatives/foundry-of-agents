export default function ProductChief({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="20" r="12" fill="url(#pc-head)" />
      {/* Messy-cool hair */}
      <path d="M19 18 Q20 7 32 6 Q44 7 45 18 Q42 10 36 9 Q27 8 21 14 Z" fill="#2d1b4e" />
      <path d="M36 9 Q40 7 42 10" fill="#2d1b4e" />
      {/* Eyes */}
      <circle cx="28" cy="19" r="1.5" fill="#09090b" />
      <circle cx="36" cy="19" r="1.5" fill="#09090b" />
      {/* AirPod in ear */}
      <ellipse cx="44" cy="20" rx="1.5" ry="2.5" fill="#fafafa" />
      {/* Body - hoodie under blazer */}
      <rect x="18" y="33" width="28" height="24" rx="6" fill="url(#pc-body)" />
      {/* Blazer overlay edges */}
      <path d="M18 33 L24 33 L26 45 L18 45Z" fill="#2d1b4e" opacity="0.3" />
      <path d="M46 33 L40 33 L38 45 L46 45Z" fill="#2d1b4e" opacity="0.3" />
      {/* Badge pins */}
      <circle cx="24" cy="38" r="1.5" fill="#a78bfa" />
      <circle cx="24" cy="42" r="1.5" fill="#c084fc" />
      <circle cx="28" cy="40" r="1.5" fill="#8b5cf6" />
      <defs>
        <linearGradient id="pc-head" x1="32" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0c4a0" />
          <stop offset="1" stopColor="#bca078" />
        </linearGradient>
        <linearGradient id="pc-body" x1="32" y1="33" x2="32" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}
