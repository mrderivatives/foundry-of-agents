export default function Coach({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background shadow for depth */}
      <ellipse cx="40" cy="72" rx="22" ry="4" fill="#1a1a1a" opacity="0.3" />

      {/* Neck */}
      <path d="M34 46 L34 52 L46 52 L46 46" fill="#d4a574" />

      {/* Body — amber polo shirt */}
      <path
        d="M22 54 C22 52 28 48 34 48 L46 48 C52 48 58 52 58 54 L60 80 L20 80 L22 54Z"
        fill="#f59e0b"
      />
      {/* Polo collar */}
      <path
        d="M33 48 L37 55 L40 52 L43 55 L47 48"
        stroke="#d97706"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Polo collar fold left */}
      <path d="M34 48 L37 54 L40 51" fill="#d97706" />
      {/* Polo collar fold right */}
      <path d="M46 48 L43 54 L40 51" fill="#d97706" />
      {/* Shirt center line */}
      <line x1="40" y1="52" x2="40" y2="65" stroke="#d97706" strokeWidth="0.8" />
      {/* Button dots */}
      <circle cx="40" cy="55" r="0.8" fill="#92400e" />
      <circle cx="40" cy="59" r="0.8" fill="#92400e" />

      {/* Clipboard — held in left hand area */}
      <rect x="14" y="52" width="12" height="16" rx="1.5" fill="#6b5b45" />
      <rect x="15.5" y="55" width="9" height="11.5" rx="0.5" fill="#f5f0e8" />
      {/* Clipboard clip */}
      <rect x="17.5" y="50.5" width="5" height="3" rx="1" fill="#9ca3af" />
      {/* Clipboard lines */}
      <line x1="17" y1="58" x2="23" y2="58" stroke="#c4b8a8" strokeWidth="0.7" />
      <line x1="17" y1="60.5" x2="23" y2="60.5" stroke="#c4b8a8" strokeWidth="0.7" />
      <line x1="17" y1="63" x2="21" y2="63" stroke="#c4b8a8" strokeWidth="0.7" />

      {/* Left arm/hand holding clipboard */}
      <path
        d="M22 54 C18 56 16 58 15 60"
        stroke="#d4a574"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Head — 3/4 view facing right */}
      <ellipse cx="40" cy="32" rx="15" ry="16" fill="#d4a574" />
      {/* Ear (left, visible) */}
      <ellipse cx="25.5" cy="33" rx="2.5" ry="3.5" fill="#c4956a" />
      <ellipse cx="26" cy="33" rx="1.5" ry="2.5" fill="#d4a574" />

      {/* Short cropped hair */}
      <path
        d="M25 26 C25 16 32 13 41 13 C50 13 56 17 55 26 C55 28 54 28 53 27 C52 22 48 18 41 17 C34 18 29 22 28 27 C27 28 25 28 25 26Z"
        fill="#3d2b1f"
      />
      {/* Hair sides */}
      <path d="M25 26 C24 28 24 31 24.5 32 L26 30 C26 28 25.5 27 25 26Z" fill="#3d2b1f" />
      <path d="M55 26 C56 28 56 30 55.5 31 L54 29 C54.5 27.5 55 27 55 26Z" fill="#3d2b1f" />

      {/* Eyes — intense but warm */}
      {/* Left eye */}
      <ellipse cx="34" cy="32" rx="3" ry="2.2" fill="white" />
      <circle cx="35" cy="32" r="1.5" fill="#4a3728" />
      <circle cx="35.5" cy="31.5" r="0.5" fill="white" />
      {/* Right eye */}
      <ellipse cx="46" cy="32" rx="2.8" ry="2.2" fill="white" />
      <circle cx="47" cy="32" r="1.5" fill="#4a3728" />
      <circle cx="47.5" cy="31.5" r="0.5" fill="white" />
      {/* Eyebrows — strong, determined */}
      <path
        d="M30 28.5 C32 27 36 27 38 27.8"
        stroke="#3d2b1f"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43 27.8 C45 27 48 27.2 50 28.8"
        stroke="#3d2b1f"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose — 3/4 view */}
      <path
        d="M41 33 C42 35 43 37 42 38 C41 38.5 39 38.5 38.5 38"
        stroke="#c4956a"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth — warm firm smile */}
      <path
        d="M35 41 C37 43 43 43 45 41"
        stroke="#a0715a"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Slight smile upturn */}
      <path
        d="M36 41.5 C38 42.5 42 42.5 44 41.5"
        fill="#c4785a"
        opacity="0.5"
      />

      {/* Headset — over the head */}
      <path
        d="M23 30 C22 22 28 12 40 11 C52 12 58 22 57 30"
        stroke="#374151"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Headset padding top */}
      <rect x="36" y="9.5" width="8" height="4" rx="2" fill="#4b5563" />
      {/* Left ear cup */}
      <rect x="20" y="28" width="5" height="7" rx="2.5" fill="#374151" />
      <rect x="21" y="29.5" width="3" height="4" rx="1.5" fill="#4b5563" />
      {/* Right ear cup */}
      <rect x="55" y="28" width="5" height="7" rx="2.5" fill="#374151" />
      <rect x="56" y="29.5" width="3" height="4" rx="1.5" fill="#4b5563" />
      {/* Headset mic boom */}
      <path
        d="M21 34 C19 36 20 40 24 42 C26 43 28 43 30 42"
        stroke="#374151"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Mic end */}
      <ellipse cx="30.5" cy="41.5" rx="2" ry="1.5" fill="#4b5563" />
      <ellipse cx="31" cy="41.5" rx="1" ry="1" fill="#6b7280" />

      {/* Whistle around neck */}
      {/* Lanyard */}
      <path
        d="M34 48 C34 50 36 52 38 53 L42 54 C44 53 46 50 46 48"
        stroke="#fbbf24"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Whistle body */}
      <path
        d="M37 53 L33 56 L33 58 L37 58 L39 55 Z"
        fill="#d1d5db"
      />
      <circle cx="33" cy="57" r="1.5" fill="#e5e7eb" />
      {/* Whistle mouthpiece */}
      <rect x="38" y="53.5" width="4" height="1.5" rx="0.5" fill="#9ca3af" />
      {/* Whistle shine */}
      <path d="M34 55 L36 55" stroke="white" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}
