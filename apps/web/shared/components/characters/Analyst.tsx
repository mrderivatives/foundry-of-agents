export default function Analyst({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background subtle glow */}
      <circle cx="40" cy="40" r="38" fill="#065f46" opacity="0.06" />

      {/* Neck */}
      <path
        d="M35 52 L35 57 Q35 59 37 59 L43 59 Q45 59 45 57 L45 52"
        fill="#c8a07e"
      />

      {/* Button-down shirt */}
      <path
        d="M18 80 L18 66 Q18 58 28 56 L34 54 L40 60 L46 54 L52 56 Q62 58 62 66 L62 80 Z"
        fill="#e2e8f0"
      />
      {/* Shirt collar */}
      <path d="M34 54 L37 58 L40 60 L36 56 Z" fill="#cbd5e1" />
      <path d="M46 54 L43 58 L40 60 L44 56 Z" fill="#cbd5e1" />

      {/* Button line */}
      <circle cx="40" cy="63" r="0.8" fill="#94a3b8" />
      <circle cx="40" cy="67" r="0.8" fill="#94a3b8" />
      <circle cx="40" cy="71" r="0.8" fill="#94a3b8" />

      {/* Rolled-up sleeves — left */}
      <path
        d="M18 66 L22 64 L22 68 L18 70 Z"
        fill="#cbd5e1"
      />
      <path
        d="M18 68 L22 66"
        stroke="#94a3b8"
        strokeWidth="0.8"
      />
      {/* Exposed forearm left */}
      <path
        d="M18 70 L18 76 L22 76 L22 68 Z"
        fill="#c8a07e"
      />

      {/* Rolled-up sleeves — right */}
      <path
        d="M62 66 L58 64 L58 68 L62 70 Z"
        fill="#cbd5e1"
      />
      <path
        d="M62 68 L58 66"
        stroke="#94a3b8"
        strokeWidth="0.8"
      />
      {/* Exposed forearm right */}
      <path
        d="M62 70 L62 76 L58 76 L58 68 Z"
        fill="#c8a07e"
      />

      {/* Paper stack near right shoulder */}
      <rect x="56" y="50" width="10" height="1.5" rx="0.3" fill="#e2e8f0" transform="rotate(-8 56 50)" />
      <rect x="55" y="52" width="11" height="1.5" rx="0.3" fill="#f1f5f9" transform="rotate(-5 55 52)" />
      <rect x="55.5" y="54" width="10.5" height="1.5" rx="0.3" fill="#e2e8f0" transform="rotate(-3 55.5 54)" />
      {/* Emerald highlight lines on papers */}
      <line x1="57" y1="50.5" x2="63" y2="50" stroke="#10b981" strokeWidth="0.5" opacity="0.6" />
      <line x1="56" y1="52.5" x2="63" y2="52" stroke="#10b981" strokeWidth="0.5" opacity="0.4" />
      <line x1="57" y1="54.5" x2="62" y2="54.2" stroke="#34d399" strokeWidth="0.5" opacity="0.5" />

      {/* Head — 3/4 view */}
      <ellipse cx="40" cy="36" rx="14" ry="16" fill="#d4a574" />
      {/* Jaw — softer than MD */}
      <path
        d="M28 40 Q30 52 40 52 Q50 52 52 40"
        fill="#d4a574"
      />

      {/* Ear */}
      <ellipse cx="53" cy="38" rx="2.5" ry="3.5" fill="#c8996a" />

      {/* Slightly messy professional hair */}
      <path
        d="M25 32 Q24 20 34 16 Q40 14 48 17 Q56 22 54 32 L52 28 Q50 20 42 18 Q32 18 28 28 Z"
        fill="#3d2b1f"
      />
      {/* Messy tufts */}
      <path
        d="M30 18 Q28 14 32 14 Q34 14 33 17"
        fill="#3d2b1f"
      />
      <path
        d="M38 15 Q40 12 42 14 Q43 15 41 16"
        fill="#3d2b1f"
      />
      <path
        d="M46 17 Q49 14 50 17"
        fill="#3d2b1f"
      />
      {/* Hair side */}
      <path
        d="M25 32 Q24 28 26 24 L25 28 Q24 31 25 34 Z"
        fill="#2a1f14"
      />
      <path
        d="M54 32 Q55 28 53 24 L54 28 Q55 30 54 34 Z"
        fill="#2a1f14"
      />

      {/* Eyes — focused, slight squint */}
      {/* Left eye — squinted */}
      <ellipse cx="35" cy="37" rx="3.5" ry="2" fill="white" />
      <circle cx="36" cy="37" r="1.5" fill="#4a3728" />
      <circle cx="36.4" cy="36.6" r="0.5" fill="white" />
      {/* Squint lines top */}
      <path d="M31.5 35 Q35 34 38.5 35" stroke="#b8885a" strokeWidth="0.5" fill="none" />

      {/* Right eye — squinted */}
      <ellipse cx="46" cy="37" rx="3" ry="2" fill="white" />
      <circle cx="47" cy="37" r="1.5" fill="#4a3728" />
      <circle cx="47.4" cy="36.6" r="0.5" fill="white" />
      <path d="M43 35 Q46 34 49 35" stroke="#b8885a" strokeWidth="0.5" fill="none" />

      {/* Round glasses */}
      <circle
        cx="35"
        cy="37"
        r="5.5"
        stroke="#10b981"
        strokeWidth="1.2"
        fill="none"
      />
      <circle
        cx="46"
        cy="37"
        r="5"
        stroke="#10b981"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Bridge */}
      <path
        d="M40.5 36 Q41 34.5 41 36"
        stroke="#10b981"
        strokeWidth="1"
        fill="none"
      />
      {/* Arm */}
      <path
        d="M51 36 L54 35.5"
        stroke="#10b981"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Eyebrows — focused, slightly furrowed */}
      <path
        d="M30 32 Q34 30 38 32"
        stroke="#2a1f14"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43 32 Q46 30.5 50 32"
        stroke="#2a1f14"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M40 38 L41.5 43 L39 44 Q38 43.5 39 43"
        stroke="#b8885a"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth — focused, neutral-slight frown */}
      <path
        d="M36 47 Q40 48.5 44 47"
        stroke="#a0644a"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pen behind ear */}
      <line
        x1="53"
        y1="30"
        x2="56"
        y2="22"
        stroke="#059669"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="56" cy="21.5" r="1" fill="#10b981" />
    </svg>
  );
}
