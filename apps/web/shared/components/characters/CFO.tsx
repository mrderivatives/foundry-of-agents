export default function CFO({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <circle cx="40" cy="40" r="38" fill="#110d18" />

      {/* Neck */}
      <rect x="35" y="48" width="12" height="8" rx="3" fill="#c89878" />

      {/* Conservative suit jacket */}
      <path
        d="M14 80 L20 58 C21 53 27 49 33 49 L49 49 C55 49 61 53 62 58 L68 80"
        fill="#1a1428"
      />
      {/* Suit shoulders - structured */}
      <path
        d="M20 58 C18 56 17 57 16 60"
        stroke="#221a32"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M62 58 C64 56 65 57 66 60"
        stroke="#221a32"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Vest underneath */}
      <path
        d="M33 50 L31 66 C31 68 35 70 41 70 C47 70 51 68 51 66 L49 50"
        fill="#2d2040"
      />
      {/* Vest buttons */}
      <circle cx="41" cy="56" r="1" fill="#8b5cf6" opacity="0.6" />
      <circle cx="41" cy="61" r="1" fill="#8b5cf6" opacity="0.6" />
      <circle cx="41" cy="66" r="1" fill="#8b5cf6" opacity="0.6" />

      {/* Dress shirt collar */}
      <path
        d="M34 49 L37 53 L41 51 L45 53 L48 49"
        fill="#e8e0d4"
      />
      {/* Tie */}
      <path
        d="M40 51 L42 51 L42.5 56 L41 62 L39.5 56 Z"
        fill="#5b21b6"
      />
      {/* Tie knot */}
      <path
        d="M39.5 51 L42.5 51 L42 53 L40 53 Z"
        fill="#7c3aed"
      />

      {/* Suit lapels */}
      <path
        d="M33 49 L36 56 L30 62 L24 56 Z"
        fill="#221a32"
      />
      <path
        d="M49 49 L46 56 L52 62 L58 56 Z"
        fill="#221a32"
      />

      {/* Head - 3/4 view */}
      <ellipse cx="41" cy="35" rx="14" ry="15" fill="#c89878" />
      {/* Ear left */}
      <ellipse cx="28" cy="36" rx="2.5" ry="3.5" fill="#b88868" />

      {/* Neat parted hair - conservative, greying */}
      <path
        d="M28 28 C28 20 34 16 42 15.5 C50 15 56 20 56 28 L56 30 C55 24 50 19 42 19 C34 19 29 23 28 30 Z"
        fill="#4a4a52"
      />
      {/* Clean part line */}
      <line
        x1="36"
        y1="16"
        x2="35"
        y2="22"
        stroke="#3a3a42"
        strokeWidth="0.8"
      />
      {/* Hair sides - neat, trimmed */}
      <path
        d="M28 28 C27 30 27 33 28 36"
        stroke="#4a4a52"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M56 28 C56 30 56 32 55 34"
        stroke="#4a4a52"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Slight grey temple highlights */}
      <path
        d="M28.5 30 C28 32 28 34 28.5 36"
        stroke="#6a6a72"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Half-moon reading glasses - distinctive shape */}
      <path
        d="M30 35 C30 33 32 32 35 32 C38 32 40 33 40 35 C40 37 38 38.5 35 38.5 C32 38.5 30 37 30 35"
        stroke="#a78bfa"
        strokeWidth="1.3"
        fill="none"
      />
      {/* Only bottom half is lens */}
      <path
        d="M31 35.5 C31 37 33 38 35 38 C37 38 39 37 39 35.5"
        fill="#8b5cf6"
        opacity="0.06"
      />
      <path
        d="M43 35 C43 33 44.5 32 47 32 C49.5 32 51 33 51 35 C51 37 49.5 38.5 47 38.5 C44.5 38.5 43 37 43 35"
        stroke="#a78bfa"
        strokeWidth="1.3"
        fill="none"
      />
      <path
        d="M44 35.5 C44 37 45.5 38 47 38 C48.5 38 50 37 50 35.5"
        fill="#8b5cf6"
        opacity="0.06"
      />
      {/* Bridge */}
      <path d="M40 34.5 C41 33.5 42 33.5 43 34.5" stroke="#a78bfa" strokeWidth="1" fill="none" />
      {/* Temple arm */}
      <line x1="30" y1="34" x2="28" y2="35" stroke="#a78bfa" strokeWidth="1" />

      {/* Eyes - thoughtful, measured */}
      <ellipse cx="35" cy="35.5" rx="2.5" ry="2.2" fill="white" />
      <ellipse cx="47" cy="35.5" rx="2.2" ry="2.2" fill="white" />
      <circle cx="36" cy="35.5" r="1.4" fill="#3a3a52" />
      <circle cx="47.8" cy="35.5" r="1.2" fill="#3a3a52" />
      <circle cx="36.3" cy="34.8" r="0.4" fill="white" />
      <circle cx="48" cy="34.8" r="0.35" fill="white" />

      {/* Eyebrows - measured, steady */}
      <path
        d="M31 31 C33 30 37 30 39 31"
        stroke="#4a4a52"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M43 31 C45 30 49 30 51 31"
        stroke="#4a4a52"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Nose - distinguished */}
      <path
        d="M42 37.5 C42 39.5 41 41 39.5 41.5 C40.5 42 42 41 42.5 39.5"
        stroke="#b88868"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth - reserved, thoughtful, closed */}
      <path
        d="M37 45 C39 45.8 43 45.8 46 45"
        stroke="#a07050"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Chart motif - small bar chart on lapel area */}
      <rect x="24" y="62" width="2" height="4" fill="#5b21b6" opacity="0.5" />
      <rect x="27" y="60" width="2" height="6" fill="#7c3aed" opacity="0.5" />
      <rect x="30" y="58" width="2" height="8" fill="#8b5cf6" opacity="0.5" />

      {/* Subtle wrinkle lines for maturity */}
      <path
        d="M33 28 C34 27.5 36 27.5 37 28"
        stroke="#b88868"
        strokeWidth="0.4"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
