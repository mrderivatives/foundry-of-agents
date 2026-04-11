export default function GamblingGuru({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background shadow */}
      <ellipse cx="40" cy="72" rx="22" ry="4" fill="#1a1a1a" opacity="0.3" />

      {/* Neck */}
      <path d="M34 46 L34 52 L46 52 L46 46" fill="#d4a574" />

      {/* Body — leather jacket */}
      <path
        d="M20 56 C20 52 27 47 34 47 L46 47 C53 47 60 52 60 56 L62 80 L18 80 L20 56Z"
        fill="#1c1917"
      />
      {/* Jacket highlight/sheen */}
      <path
        d="M24 56 C26 52 30 49 36 48 L38 48 L36 80 L22 80 L24 56Z"
        fill="#292524"
        opacity="0.6"
      />
      {/* High collar — left */}
      <path
        d="M28 48 C27 46 28 43 30 42 C32 41 34 42 35 44 L34 48"
        fill="#292524"
      />
      {/* High collar — right */}
      <path
        d="M52 48 C53 46 52 43 50 42 C48 41 46 42 45 44 L46 48"
        fill="#292524"
      />
      {/* Collar edge highlights */}
      <path
        d="M29 47 C28.5 45 29 43 31 42"
        stroke="#44403c"
        strokeWidth="0.6"
        fill="none"
      />
      <path
        d="M51 47 C51.5 45 51 43 49 42"
        stroke="#44403c"
        strokeWidth="0.6"
        fill="none"
      />
      {/* Jacket lapels */}
      <path d="M34 48 L38 58 L40 52 L42 58 L46 48" fill="#292524" />
      <path
        d="M34 48 L38 58 L40 52"
        stroke="#44403c"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M46 48 L42 58 L40 52"
        stroke="#44403c"
        strokeWidth="0.5"
        fill="none"
      />
      {/* Dark shirt underneath */}
      <path d="M38 52 L40 52 L42 52 L42 65 L38 65Z" fill="#0f0f0f" />

      {/* Dice motif on left lapel */}
      <rect x="33" y="52" width="4" height="4" rx="0.8" fill="#f59e0b" opacity="0.9" />
      <circle cx="34" cy="53" r="0.4" fill="#92400e" />
      <circle cx="36" cy="55" r="0.4" fill="#92400e" />
      <circle cx="35" cy="54" r="0.4" fill="#92400e" />

      {/* Jacket zipper */}
      <line x1="40" y1="52" x2="40" y2="72" stroke="#78716c" strokeWidth="0.7" />
      {/* Zipper teeth */}
      <line x1="39.5" y1="54" x2="40.5" y2="54" stroke="#78716c" strokeWidth="0.4" />
      <line x1="39.5" y1="56" x2="40.5" y2="56" stroke="#78716c" strokeWidth="0.4" />
      <line x1="39.5" y1="58" x2="40.5" y2="58" stroke="#78716c" strokeWidth="0.4" />
      <line x1="39.5" y1="60" x2="40.5" y2="60" stroke="#78716c" strokeWidth="0.4" />

      {/* Head — 3/4 view facing right */}
      <ellipse cx="40" cy="32" rx="15" ry="16" fill="#d4a574" />
      {/* Left ear */}
      <ellipse cx="25.5" cy="33" rx="2.5" ry="3.5" fill="#c4956a" />
      <ellipse cx="26" cy="33" rx="1.5" ry="2.5" fill="#d4a574" />

      {/* Slicked back hair */}
      <path
        d="M25 28 C24 22 28 16 34 14 C38 13 42 13 46 14 C52 16 56 22 55 28 C55 26 54 22 50 19 C46 17 42 16.5 38 17 C34 17.5 30 19 27 23 C26 25 25.5 27 25 28Z"
        fill="#1a1a1a"
      />
      {/* Hair sheen lines */}
      <path d="M30 19 C34 17 40 16.5 46 18" stroke="#333" strokeWidth="0.8" fill="none" />
      <path d="M29 21 C33 18.5 41 17.5 48 20" stroke="#333" strokeWidth="0.6" fill="none" />
      {/* Side hair clean */}
      <path d="M25 28 C24.5 30 24.5 32 25 33" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M55 28 C55.5 29.5 55.5 31 55 32" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Reflective sunglasses */}
      {/* Bridge */}
      <path
        d="M37 30 C38 29.5 42 29.5 43 30"
        stroke="#374151"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Left lens */}
      <path
        d="M28 28 C28 27 30 26 34 26 C37 26 38 27 38 28 L38 33 C38 35 36 36 34 36 C30 36 28 35 28 33 Z"
        fill="#1e293b"
      />
      {/* Left lens amber reflection */}
      <path
        d="M30 28 C31 27.5 34 27.5 36 28 L35 31 C33 30.5 31 30.5 30 31 Z"
        fill="#f59e0b"
        opacity="0.35"
      />
      <path
        d="M31 29 L33 28.5 L34 30 L32 30.5Z"
        fill="#fbbf24"
        opacity="0.25"
      />
      {/* Right lens */}
      <path
        d="M42 28 C42 27 44 26 47 26 C50 26 52 27 52 28 L52 33 C52 35 50 36 47 36 C44 36 42 35 42 33 Z"
        fill="#1e293b"
      />
      {/* Right lens amber reflection */}
      <path
        d="M44 28 C45 27.5 48 27.5 50 28 L49 31 C47 30.5 45 30.5 44 31 Z"
        fill="#f59e0b"
        opacity="0.35"
      />
      <path
        d="M45 29 L47 28.5 L48 30 L46 30.5Z"
        fill="#fbbf24"
        opacity="0.25"
      />
      {/* Frame top line */}
      <path
        d="M28 28 C28 26.5 31 25.5 34 25.5 C37 25.5 38 26.5 38 28"
        stroke="#374151"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M42 28 C42 26.5 44 25.5 47 25.5 C50 25.5 52 26.5 52 28"
        stroke="#374151"
        strokeWidth="1"
        fill="none"
      />
      {/* Temple arms */}
      <path d="M28 29 L25 30" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" />

      {/* Nose */}
      <path
        d="M41 33 C42 35 42.5 37 41.5 38 C40.5 38.5 39 38.3 38.5 37.5"
        stroke="#c4956a"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth — confident smirk */}
      <path
        d="M34 41.5 C36 42 40 42.5 44 41 C45 40.5 46 41 46 41.5"
        stroke="#a0715a"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Smirk upturn on right side */}
      <path
        d="M44 41 C45.5 40 47 40.5 46.5 41.5"
        stroke="#a0715a"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Chin shadow for structure */}
      <path
        d="M32 44 C36 46 44 46 48 44"
        stroke="#c4956a"
        strokeWidth="0.5"
        opacity="0.4"
        fill="none"
      />

      {/* Subtle stubble dots */}
      <circle cx="34" cy="43" r="0.3" fill="#a08060" opacity="0.3" />
      <circle cx="37" cy="44" r="0.3" fill="#a08060" opacity="0.3" />
      <circle cx="40" cy="44.5" r="0.3" fill="#a08060" opacity="0.3" />
      <circle cx="43" cy="44" r="0.3" fill="#a08060" opacity="0.3" />
      <circle cx="46" cy="43" r="0.3" fill="#a08060" opacity="0.3" />

      {/* Second dice on right lapel for symmetry */}
      <rect x="43" y="52" width="4" height="4" rx="0.8" fill="#d97706" opacity="0.7" />
      <circle cx="44" cy="53" r="0.4" fill="#92400e" />
      <circle cx="46" cy="55" r="0.4" fill="#92400e" />
    </svg>
  );
}
