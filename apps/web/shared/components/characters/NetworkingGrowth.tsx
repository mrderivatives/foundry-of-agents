export default function NetworkingGrowth({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="40" cy="40" r="38" fill="#1a1a2e" />

      {/* Subtle connection web motif behind character */}
      <circle cx="18" cy="22" r="1.5" fill="#3b82f6" opacity="0.15" />
      <circle cx="62" cy="18" r="1.2" fill="#60a5fa" opacity="0.12" />
      <circle cx="12" cy="42" r="1" fill="#3b82f6" opacity="0.1" />
      <circle cx="68" cy="44" r="1.3" fill="#60a5fa" opacity="0.12" />
      <circle cx="22" cy="14" r="0.8" fill="#60a5fa" opacity="0.1" />
      <circle cx="58" cy="12" r="0.8" fill="#3b82f6" opacity="0.1" />
      {/* Connection lines */}
      <line x1="18" y1="22" x2="62" y2="18" stroke="#3b82f6" strokeWidth="0.3" opacity="0.08" />
      <line x1="18" y1="22" x2="12" y2="42" stroke="#3b82f6" strokeWidth="0.3" opacity="0.08" />
      <line x1="62" y1="18" x2="68" y2="44" stroke="#60a5fa" strokeWidth="0.3" opacity="0.08" />
      <line x1="22" y1="14" x2="18" y2="22" stroke="#60a5fa" strokeWidth="0.3" opacity="0.06" />
      <line x1="58" y1="12" x2="62" y2="18" stroke="#3b82f6" strokeWidth="0.3" opacity="0.06" />

      {/* Neck — slightly wider, confident posture */}
      <path d="M34 52 L34 58 L46 58 L46 52" fill="#c4956a" />

      {/* Stylish blazer — open, no tie, relaxed fit */}
      <path
        d="M18 80 L21 60 C21 55 27 52 34 51 L34 58 L24 63 L18 80 Z"
        fill="#2563eb"
      />
      <path
        d="M62 80 L59 60 C59 55 53 52 46 51 L46 58 L56 63 L62 80 Z"
        fill="#2563eb"
      />
      {/* Blazer lapels — wider, stylish */}
      <path d="M34 55 L28 63 L32 65 L36 58 Z" fill="#1e40af" />
      <path d="M46 55 L52 63 L48 65 L44 58 Z" fill="#1e40af" />
      {/* Lapel edges */}
      <path d="M34 55 L30 60" stroke="#60a5fa" strokeWidth="0.3" fill="none" />
      <path d="M46 55 L50 60" stroke="#60a5fa" strokeWidth="0.3" fill="none" />

      {/* Open collar shirt underneath — no tie */}
      <path
        d="M34 54 L34 80 L46 80 L46 54 C44 53 36 53 34 54 Z"
        fill="#f8fafc"
      />
      {/* Open collar V */}
      <path
        d="M36 53 L40 58 L44 53"
        stroke="#e2e8f0"
        strokeWidth="0.5"
        fill="none"
      />
      {/* Exposed collar area */}
      <path d="M36.5 53 L40 57 L43.5 53" fill="#c4956a" />

      {/* Head — 3/4 view, slightly larger for confidence */}
      <ellipse cx="40" cy="35" rx="14.5" ry="16.5" fill="#c4956a" />
      {/* Ear left */}
      <ellipse cx="26" cy="36" rx="2.5" ry="3.5" fill="#b5845c" />
      <ellipse cx="26.5" cy="36" rx="1.5" ry="2.5" fill="#c4956a" />

      {/* Hair — styled, voluminous, confident look */}
      <path
        d="M26 28 C26 15 35 11 42 11 C50 11 57 17 56 28 C55 22 50 17 42 16 C35 16 28 21 26 28 Z"
        fill="#1a0f07"
      />
      {/* Hair volume — swept back with style */}
      <path
        d="M28 26 C29 15 37 10 43 10 C50 10 56 15 55 26 C53 18 48 14 43 14 C38 14 31 18 28 26 Z"
        fill="#2a1a0f"
      />
      {/* Side sweep detail */}
      <path
        d="M26 28 C25 32 25 35 26 38 C26 33 27 28 28 26"
        fill="#1a0f07"
      />
      {/* Top wave detail */}
      <path
        d="M32 15 C36 12 44 11 48 13"
        stroke="#3d2815"
        strokeWidth="0.5"
        fill="none"
      />

      {/* Eyes — bright, open, confident and warm */}
      {/* Left eye */}
      <ellipse cx="34" cy="35.5" rx="3.2" ry="2.8" fill="white" />
      <circle cx="35.2" cy="35.5" r="1.6" fill="#2c1810" />
      <circle cx="35.6" cy="35" r="0.6" fill="white" />
      <circle cx="34.5" cy="36" r="0.3" fill="white" opacity="0.5" />
      {/* Right eye */}
      <ellipse cx="46.5" cy="35" rx="3" ry="2.6" fill="white" />
      <circle cx="47.3" cy="35" r="1.5" fill="#2c1810" />
      <circle cx="47.7" cy="34.5" r="0.6" fill="white" />
      <circle cx="46.6" cy="35.5" r="0.3" fill="white" opacity="0.5" />

      {/* Eyebrows — raised, open, friendly */}
      <path
        d="M30.5 31 C32.5 30 36 30 37.5 31"
        stroke="#1a0f07"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43 30.5 C45 29.5 48.5 29.5 50 31"
        stroke="#1a0f07"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M41 36 L42 41 L40 42"
        stroke="#b5845c"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth — BIG warm smile, key feature */}
      <path
        d="M34 44 C36 48 44 48.5 47 44.5"
        stroke="#8b5e3c"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Teeth showing in big smile */}
      <path
        d="M35 44.5 C37 47 43 47.5 46 45"
        fill="white"
      />
      {/* Lower lip */}
      <path
        d="M35.5 47 C37.5 48.5 43 48.5 45.5 47"
        stroke="#8b5e3c"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Smile dimple left */}
      <path
        d="M33.5 44 C33 44.5 33 45 33.3 45.5"
        stroke="#b5845c"
        strokeWidth="0.5"
        fill="none"
      />

      {/* Phone in right hand — key silhouette element */}
      <g transform="rotate(-15, 58, 62)">
        {/* Phone body */}
        <rect x="56" y="55" width="8" height="14" rx="1.5" fill="#0f172a" />
        {/* Screen */}
        <rect x="57" y="56.5" width="6" height="10.5" rx="0.5" fill="#1e293b" />
        {/* Screen content — chat/contact */}
        <circle cx="60" cy="59" r="1.5" fill="#3b82f6" opacity="0.3" />
        <rect x="58" y="61.5" width="4" height="0.5" rx="0.2" fill="#60a5fa" opacity="0.4" />
        <rect x="58" y="62.8" width="3" height="0.5" rx="0.2" fill="#60a5fa" opacity="0.3" />
        <rect x="58" y="64" width="4.5" height="0.5" rx="0.2" fill="#3b82f6" opacity="0.3" />
        {/* Phone notch */}
        <rect x="59" y="56" width="2" height="0.6" rx="0.3" fill="#1e293b" />
      </g>
      {/* Hand holding phone */}
      <path
        d="M56 60 C55 58 56 56 58 56 C59 56 60 57 60 58 L60 64 C60 65 59 66 58 66 L56 65 C55 64 55 62 56 60 Z"
        fill="#c4956a"
      />
      {/* Thumb */}
      <path
        d="M56 61 C55 60.5 54.5 61 54.5 62 C54.5 63 55 63.5 56 63"
        fill="#c4956a"
      />

      {/* Left hand — open, outgoing gesture */}
      <path
        d="M20 62 C19 60 18 58 19 57 C20 56 22 57 22 59 L24 62"
        fill="#c4956a"
      />
      {/* Fingers spread — outgoing posture */}
      <path
        d="M19 57 C18 55 18.5 53 19.5 53 C20.5 53 20.5 55 20 57"
        fill="#c4956a"
      />
      <path
        d="M20.5 56.5 C20 54 20.5 52 21.5 52 C22.5 52 22.5 54.5 22 56.5"
        fill="#c4956a"
      />
      <path
        d="M22 57 C22 55 22.5 53 23.5 53.5 C24 54 23.5 56 23 57.5"
        fill="#c4956a"
      />

      {/* Blazer pocket square accent */}
      <path
        d="M49 62 L50 59 L51.5 60 L50.5 63 Z"
        fill="#60a5fa"
        opacity="0.7"
      />

      {/* Subtle shoulder/posture line — confident, open */}
      <path
        d="M21 60 C19 58 18 55 20 53"
        stroke="#1e40af"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M59 60 C61 58 62 55 60 53"
        stroke="#1e40af"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}
