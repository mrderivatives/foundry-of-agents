export default function SportsJournalist({ size = 48 }: { size?: number }) {
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
      <path d="M35 46 L35 52 L45 52 L45 46" fill="#c9a07e" />

      {/* Body — sharp blazer */}
      <path
        d="M20 56 C20 52 27 47 35 47 L45 47 C53 47 60 52 60 56 L62 80 L18 80 L20 56Z"
        fill="#1e3a5f"
      />
      {/* Blazer right panel lighter */}
      <path
        d="M40 48 L45 47 C53 47 60 52 60 56 L62 80 L38 80 Z"
        fill="#1e3a5f"
        opacity="0.9"
      />
      {/* Blazer lapel left */}
      <path d="M35 47 L38 56 L40 50" fill="#163250" />
      {/* Blazer lapel right */}
      <path d="M45 47 L42 56 L40 50" fill="#163250" />
      {/* Lapel edges */}
      <path d="M35 47 L38 56" stroke="#2a4a6f" strokeWidth="0.6" fill="none" />
      <path d="M45 47 L42 56" stroke="#2a4a6f" strokeWidth="0.6" fill="none" />
      {/* White shirt underneath */}
      <path d="M38 50 L40 50 L42 50 L42 65 L38 65Z" fill="#e8e4df" />
      {/* Shirt collar */}
      <path d="M35 48 L38 52 L40 49" fill="#f0ece6" />
      <path d="M45 48 L42 52 L40 49" fill="#f0ece6" />
      {/* Tie */}
      <path d="M39.5 50 L40 49 L40.5 50 L40.8 62 L39.2 62Z" fill="#f59e0b" />
      {/* Tie knot */}
      <path d="M39 49.5 L40 48.5 L41 49.5 L40.5 50.5 L39.5 50.5Z" fill="#d97706" />

      {/* Blazer button */}
      <circle cx="40" cy="58" r="0.8" fill="#9ca3af" />

      {/* Blazer pocket square — amber accent */}
      <path d="M24 56 L26 53 L28 54 L27 57Z" fill="#fbbf24" />

      {/* Press pass / badge hanging from neck */}
      {/* Lanyard */}
      <path
        d="M36 48 C36 50 35 52 34 54 L34 60"
        stroke="#f59e0b"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M44 48 C44 50 45 52 46 54"
        stroke="#f59e0b"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />
      {/* Badge card */}
      <rect x="30" y="60" width="10" height="13" rx="1" fill="white" />
      <rect x="30" y="60" width="10" height="3.5" rx="1" fill="#f59e0b" />
      {/* Badge photo placeholder */}
      <rect x="32" y="65" width="6" height="5" rx="0.5" fill="#e5e0d8" />
      <circle cx="35" cy="67" r="1.5" fill="#c9a07e" />
      <path d="M32.5 70 C33 69 34 68.5 35 68.5 C36 68.5 37 69 37.5 70" fill="#1e3a5f" />
      {/* Badge text lines */}
      <line x1="32" y1="71.5" x2="38" y2="71.5" stroke="#ccc" strokeWidth="0.5" />
      {/* Badge clip */}
      <rect x="33.5" y="58.5" width="3" height="2" rx="0.5" fill="#9ca3af" />

      {/* PRESS text on badge */}
      <text
        x="35"
        y="62.5"
        textAnchor="middle"
        fontSize="2.5"
        fontWeight="bold"
        fill="#92400e"
        fontFamily="sans-serif"
      >
        PRESS
      </text>

      {/* Head — 3/4 view facing right */}
      <ellipse cx="40" cy="32" rx="14.5" ry="15.5" fill="#c9a07e" />
      {/* Left ear */}
      <ellipse cx="26" cy="33" rx="2.5" ry="3.5" fill="#b8906a" />
      <ellipse cx="26.5" cy="33" rx="1.5" ry="2.5" fill="#c9a07e" />

      {/* Medium neat hair */}
      <path
        d="M26 27 C25 20 29 14 37 13 C41 12.5 45 13 48 15 C52 17 55 22 54 28 C54 26 53 22 49 19 C45 17 41 16 37 16.5 C33 17 29 19 27.5 23 C26.8 25 26.2 26.5 26 27Z"
        fill="#3d2b1f"
      />
      {/* Hair volume/part */}
      <path
        d="M28 24 C29 20 33 17 38 16.5 C43 16 47 17 50 20 C52 22 53 24 53 26"
        stroke="#2d1f14"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Side part */}
      <path d="M34 16 C33 18 33 20 34 22" stroke="#2d1f14" strokeWidth="0.8" fill="none" />
      {/* Hair sides */}
      <path d="M26 27 C25.5 29 25.5 32 26 34" stroke="#3d2b1f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Slight sideburn */}
      <path d="M26 34 C26 36 26.5 37 27 38" stroke="#3d2b1f" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Eyes — inquisitive, one raised eyebrow */}
      {/* Left eye */}
      <ellipse cx="34" cy="32" rx="3" ry="2.3" fill="white" />
      <circle cx="35" cy="32" r="1.6" fill="#3d6b4f" />
      <circle cx="35.5" cy="31.4" r="0.5" fill="white" />
      {/* Right eye */}
      <ellipse cx="46" cy="32" rx="2.8" ry="2.3" fill="white" />
      <circle cx="47" cy="32" r="1.6" fill="#3d6b4f" />
      <circle cx="47.4" cy="31.4" r="0.5" fill="white" />
      {/* Left eyebrow — raised (inquisitive) */}
      <path
        d="M30 27 C32 25.5 36 25.5 38 27"
        stroke="#3d2b1f"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right eyebrow — lower, creating asymmetry */}
      <path
        d="M43 28 C45 27.2 48 27.5 50 29"
        stroke="#3d2b1f"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M41 33 C42 35 42.5 37 41.5 38 C40.5 38.4 39 38.2 38.5 37.6"
        stroke="#b8906a"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth — slight thinking expression */}
      <path
        d="M35 41 C37 42 40 42.5 43 42 C44 41.8 45 41.5 45.5 41"
        stroke="#9a6e55"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Slight lower lip */}
      <path
        d="M36 42.5 C38 43.5 42 43.5 44 42.5"
        stroke="#b07e62"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Recorder/mic — held in right hand */}
      {/* Right arm */}
      <path
        d="M56 56 C58 52 60 48 58 44 C57 42 55 41.5 54 42.5"
        stroke="#1e3a5f"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hand */}
      <ellipse cx="55" cy="43" rx="2.5" ry="2" fill="#c9a07e" />

      {/* Recorder body */}
      <rect x="54" y="34" width="5" height="12" rx="1.5" fill="#374151" />
      {/* Recorder screen */}
      <rect x="55" y="36" width="3" height="4" rx="0.5" fill="#1a1a1a" />
      {/* Recording indicator */}
      <circle cx="56.5" cy="37.5" r="0.6" fill="#ef4444" />
      {/* Level bars */}
      <rect x="55.5" y="42" width="0.8" height="2" rx="0.3" fill="#4b5563" />
      <rect x="56.8" y="41" width="0.8" height="3" rx="0.3" fill="#4b5563" />
      <rect x="55.5" y="41.5" width="0.8" height="2.5" rx="0.3" fill="#f59e0b" opacity="0.6" />
      <rect x="56.8" y="41" width="0.8" height="3" rx="0.3" fill="#f59e0b" opacity="0.4" />
      {/* Mic top */}
      <ellipse cx="56.5" cy="34" rx="3" ry="2" fill="#4b5563" />
      <ellipse cx="56.5" cy="33.5" rx="2.5" ry="1.5" fill="#6b7280" />
      {/* Mic mesh pattern */}
      <line x1="54.5" y1="33" x2="58.5" y2="33" stroke="#9ca3af" strokeWidth="0.3" />
      <line x1="54.5" y1="34" x2="58.5" y2="34" stroke="#9ca3af" strokeWidth="0.3" />
      <line x1="55.5" y1="32" x2="55.5" y2="35" stroke="#9ca3af" strokeWidth="0.3" />
      <line x1="57.5" y1="32" x2="57.5" y2="35" stroke="#9ca3af" strokeWidth="0.3" />

      {/* Glasses — thin intellectual frames (optional subtle detail) */}
      <path
        d="M30 31 C30 29.5 32 29 34 29 C36 29 38 29.5 38 31 L38 33.5 C38 35 36 35.5 34 35.5 C32 35.5 30 35 30 33.5Z"
        stroke="#78716c"
        strokeWidth="0.6"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M42 31 C42 29.5 44 29 46 29 C48 29 50 29.5 50 31 L50 33.5 C50 35 48 35.5 46 35.5 C44 35.5 42 35 42 33.5Z"
        stroke="#78716c"
        strokeWidth="0.6"
        fill="none"
        opacity="0.5"
      />
      <path d="M38 31.5 C39 31 41 31 42 31.5" stroke="#78716c" strokeWidth="0.5" fill="none" opacity="0.5" />
    </svg>
  );
}
