export default function ProductChief({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background subtle glow */}
      <circle cx="40" cy="40" r="38" fill="#1a1025" />
      <circle cx="40" cy="40" r="36" fill="#1e1230" opacity="0.6" />

      {/* Neck */}
      <rect x="34" y="48" width="14" height="8" rx="3" fill="#d4a574" />

      {/* Blazer - outer layer */}
      <path
        d="M18 80 L22 56 C23 52 28 50 32 50 L50 50 C54 50 59 52 60 56 L64 80"
        fill="#2d1b4e"
      />
      {/* Blazer lapels */}
      <path
        d="M32 50 L38 62 L32 66 L26 58 Z"
        fill="#3b2463"
      />
      <path
        d="M50 50 L44 62 L50 66 L56 58 Z"
        fill="#3b2463"
      />

      {/* Hoodie underneath - visible at collar */}
      <path
        d="M33 50 C33 50 36 54 41 54 C46 54 49 50 49 50 L47 58 C47 58 44 61 41 61 C38 61 35 58 35 58 Z"
        fill="#5b21b6"
      />
      {/* Hoodie drawstrings */}
      <line x1="39" y1="54" x2="38" y2="60" stroke="#a78bfa" strokeWidth="0.6" />
      <line x1="43" y1="54" x2="44" y2="60" stroke="#a78bfa" strokeWidth="0.6" />

      {/* Blazer badges/pins */}
      <circle cx="27" cy="60" r="2" fill="#8b5cf6" />
      <circle cx="27" cy="65" r="1.5" fill="#a78bfa" />
      <rect x="25" y="68" width="4" height="2" rx="1" fill="#7c3aed" />

      {/* Head - 3/4 view, slightly right */}
      <ellipse cx="41" cy="36" rx="15" ry="16" fill="#d4a574" />
      {/* Ear - left side visible */}
      <ellipse cx="27" cy="37" rx="2.5" ry="3.5" fill="#c4956a" />

      {/* AirPod - left ear */}
      <ellipse cx="26.5" cy="36" rx="1.8" ry="2.2" fill="#e8e8e8" />
      <ellipse cx="26.5" cy="38.5" rx="1" ry="1.5" fill="#f0f0f0" />

      {/* Messy-cool hair */}
      <path
        d="M26 30 C24 22 30 16 40 15 C50 14 56 20 56 28 C56 30 55 32 54 33 L54 28 C54 22 49 18 41 18 C33 18 28 22 27 28 Z"
        fill="#2a1a0a"
      />
      {/* Hair texture - messy strands */}
      <path
        d="M28 20 C26 18 25 22 26 25"
        stroke="#3d2a14"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M35 16 C34 13 32 14 33 18"
        stroke="#3d2a14"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M44 15 C46 12 48 13 47 17"
        stroke="#3d2a14"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M52 20 C54 17 56 19 54 24"
        stroke="#3d2a14"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Side hair covering ear area slightly */}
      <path
        d="M26 28 C25 30 25 34 26 36"
        stroke="#2a1a0a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Eyes - looking slightly right */}
      <ellipse cx="35" cy="36" rx="3.5" ry="3" fill="white" />
      <ellipse cx="46" cy="36" rx="3" ry="3" fill="white" />
      <circle cx="36.5" cy="36" r="1.8" fill="#2a1a0a" />
      <circle cx="47" cy="36" r="1.6" fill="#2a1a0a" />
      <circle cx="37" cy="35.2" r="0.6" fill="white" />
      <circle cx="47.5" cy="35.2" r="0.5" fill="white" />

      {/* Eyebrows - confident */}
      <path
        d="M31 32 C33 30.5 37 30.5 39 31.5"
        stroke="#2a1a0a"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M43 31.5 C45 30.5 48 30.5 50 32"
        stroke="#2a1a0a"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Nose - 3/4 view */}
      <path
        d="M42 37 C42 39 41 41 39 42 C40 42 42 41.5 42.5 40"
        stroke="#c4956a"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth - slight confident smirk */}
      <path
        d="M36 45 C38 46.5 43 46.5 46 45"
        stroke="#b5785a"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Slight jawline definition */}
      <path
        d="M27 42 C29 48 35 52 41 52 C47 52 53 48 55 42"
        stroke="#c4956a"
        strokeWidth="0.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* AirPod right ear hint */}
      <ellipse cx="55.5" cy="37" rx="1.2" ry="1.8" fill="#e8e8e8" opacity="0.5" />

      {/* Blazer pocket square accent */}
      <path
        d="M53 56 L56 54 L57 57 L54 58 Z"
        fill="#8b5cf6"
      />
    </svg>
  );
}
