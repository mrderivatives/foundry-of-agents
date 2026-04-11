export default function ManagingDirector({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background subtle glow */}
      <circle cx="40" cy="40" r="38" fill="#065f46" opacity="0.08" />

      {/* Neck */}
      <path
        d="M35 52 L35 58 Q35 60 37 60 L43 60 Q45 60 45 58 L45 52"
        fill="#c8a07e"
      />

      {/* Suit jacket — power cut with broad shoulders */}
      <path
        d="M20 80 L20 64 Q20 58 26 56 L34 54 L34 60 L40 66 L46 60 L46 54 L54 56 Q60 58 60 64 L60 80 Z"
        fill="#1e293b"
      />
      {/* Suit jacket inner shadow / depth */}
      <path
        d="M26 58 L34 55 L34 60 L40 66 L46 60 L46 55 L54 58 L54 64 Q54 60 40 62 Q26 60 26 64 Z"
        fill="#0f172a"
        opacity="0.5"
      />

      {/* Left lapel */}
      <path d="M34 54 L34 68 L38 66 L40 66 L34 60 Z" fill="#334155" />
      {/* Right lapel */}
      <path d="M46 54 L46 68 L42 66 L40 66 L46 60 Z" fill="#334155" />

      {/* Shirt collar visible */}
      <path d="M36 55 L40 62 L44 55 L42 54 L40 58 L38 54 Z" fill="#e2e8f0" />

      {/* Power tie — emerald */}
      <path d="M39 58 L40 62 L41 58 L40.5 54 L39.5 54 Z" fill="#10b981" />
      <path d="M39.2 62 L40 68 L40.8 62 Z" fill="#059669" />

      {/* Head — 3/4 view, slightly right-facing */}
      <ellipse cx="40" cy="38" rx="14" ry="16" fill="#d4a574" />
      {/* Jaw / chin — strong commanding jaw */}
      <path
        d="M28 42 Q28 54 40 54 Q52 54 52 42"
        fill="#d4a574"
      />
      <path
        d="M28 40 Q30 52 40 53 Q50 52 52 40"
        fill="#c8996a"
        opacity="0.3"
      />

      {/* Ear (right side, visible in 3/4) */}
      <ellipse cx="53" cy="40" rx="3" ry="4" fill="#c8996a" />

      {/* Salt-and-pepper hair — commanding style */}
      <path
        d="M26 34 Q24 22 34 18 Q40 16 46 18 Q56 22 54 34 L52 30 Q50 22 40 20 Q30 22 28 30 Z"
        fill="#6b7280"
      />
      {/* Hair highlights — silver streaks */}
      <path
        d="M30 24 Q34 20 38 20 L36 22 Q32 22 30 26 Z"
        fill="#d1d5db"
        opacity="0.7"
      />
      <path
        d="M44 19 Q48 20 50 24 L48 22 Q46 20 43 20 Z"
        fill="#d1d5db"
        opacity="0.6"
      />
      <path
        d="M26 32 Q26 28 28 24 L27 28 Q26 30 27 34 Z"
        fill="#d1d5db"
        opacity="0.5"
      />
      {/* Hair side texture */}
      <path
        d="M54 34 Q55 28 52 24 L53 28 Q54 30 53 34 Z"
        fill="#4b5563"
      />

      {/* Eyes — slightly right-looking */}
      {/* Left eye */}
      <ellipse cx="35" cy="38" rx="3.5" ry="2.5" fill="white" />
      <circle cx="36" cy="38" r="1.8" fill="#1e293b" />
      <circle cx="36.5" cy="37.5" r="0.6" fill="white" />
      {/* Right eye */}
      <ellipse cx="46" cy="38" rx="3" ry="2.5" fill="white" />
      <circle cx="47" cy="38" r="1.8" fill="#1e293b" />
      <circle cx="47.5" cy="37.5" r="0.6" fill="white" />

      {/* Eyebrows — strong, commanding */}
      <path
        d="M31 34.5 Q35 32.5 39 34"
        stroke="#4b5563"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43 34 Q47 32.5 50 34.5"
        stroke="#4b5563"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M40 39 L41 44 L39 45 Q38 45 38.5 44"
        stroke="#b8885a"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth — firm, authoritative */}
      <path
        d="M36 48 Q40 50 44 48"
        stroke="#a0644a"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Glasses frames — rectangular, authoritative */}
      <rect
        x="30.5"
        y="35"
        width="9"
        height="7"
        rx="1.5"
        stroke="#10b981"
        strokeWidth="1.2"
        fill="none"
      />
      <rect
        x="42.5"
        y="35"
        width="8"
        height="7"
        rx="1.5"
        stroke="#10b981"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Glasses bridge */}
      <path
        d="M39.5 38 Q41 36.5 42.5 38"
        stroke="#10b981"
        strokeWidth="1"
        fill="none"
      />
      {/* Glasses arm (right) */}
      <path
        d="M50.5 37 L54 36.5"
        stroke="#10b981"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Glasses green glow / reflection */}
      <rect
        x="32"
        y="36"
        width="3"
        height="2"
        rx="0.5"
        fill="#34d399"
        opacity="0.15"
      />
      <rect
        x="44"
        y="36"
        width="3"
        height="2"
        rx="0.5"
        fill="#34d399"
        opacity="0.15"
      />

      {/* Pocket square — emerald accent */}
      <path d="M22 66 L22 70 L26 70 L25 66 Z" fill="#10b981" opacity="0.8" />

      {/* Subtle shoulder lines */}
      <path
        d="M20 64 Q22 62 26 60"
        stroke="#334155"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M60 64 Q58 62 54 60"
        stroke="#334155"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}
