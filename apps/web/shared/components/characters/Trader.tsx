export default function Trader({ size = 48 }: { size?: number }) {
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

      {/* Screen glow on face — multiple colors to suggest monitors */}
      <ellipse cx="30" cy="42" rx="18" ry="14" fill="#10b981" opacity="0.04" />
      <ellipse cx="50" cy="38" rx="14" ry="12" fill="#34d399" opacity="0.03" />

      {/* Neck — slightly forward leaning */}
      <path
        d="M34 52 L33 58 Q33 60 35 60 L43 60 Q45 60 44 58 L45 52"
        fill="#c8a07e"
      />

      {/* Shirt with loosened collar */}
      <path
        d="M16 80 L18 64 Q18 58 26 55 L33 52 L40 58 L47 52 L54 55 Q62 58 62 64 L64 80 Z"
        fill="#e2e8f0"
      />

      {/* Loosened tie — askew, emerald */}
      <path
        d="M38 56 L37.5 54 L39 53 L40.5 53 L42 54 L41.5 56 L40 58 Z"
        fill="#10b981"
      />
      <path d="M38.5 58 L40 70 L41 58 Z" fill="#059669" />
      {/* Tie pulled to side — loosened */}
      <path d="M38.5 58 L37.5 62 L39.5 68 L40 70 Z" fill="#059669" />

      {/* Open collar — loosened */}
      <path d="M33 52 L36 56 L40 58 L34 54 Z" fill="#cbd5e1" />
      <path d="M47 52 L44 56 L40 58 L46 54 Z" fill="#cbd5e1" />
      {/* Collar spread open */}
      <path d="M34 54 L32 58 L36 56 Z" fill="#e2e8f0" />
      <path d="M46 54 L48 58 L44 56 Z" fill="#e2e8f0" />

      {/* Rolled-up sleeves — left */}
      <path d="M16 68 L20 65 L20 69 L16 72 Z" fill="#cbd5e1" />
      <path d="M16 72 L16 78 L20 78 L20 69 Z" fill="#c8a07e" />
      {/* Rolled-up sleeves — right */}
      <path d="M64 68 L60 65 L60 69 L64 72 Z" fill="#cbd5e1" />
      <path d="M64 72 L64 78 L60 78 L60 69 Z" fill="#c8a07e" />

      {/* Head — 3/4 view, slightly forward lean */}
      <ellipse cx="40" cy="36" rx="14" ry="15.5" fill="#d4a574" />
      {/* Jaw */}
      <path
        d="M28 40 Q30 51 40 52 Q50 51 52 40"
        fill="#d4a574"
      />

      {/* Screen glow reflections on face */}
      <path
        d="M30 36 Q36 34 38 40 Q34 42 30 38 Z"
        fill="#10b981"
        opacity="0.06"
      />
      <path
        d="M44 36 Q50 34 52 38 Q50 42 46 40 Z"
        fill="#34d399"
        opacity="0.05"
      />

      {/* Ear */}
      <ellipse cx="53" cy="38" rx="2.5" ry="3.5" fill="#c8996a" />

      {/* Hair — slightly disheveled professional */}
      <path
        d="M26 32 Q24 20 34 17 Q40 15 48 18 Q56 22 54 32 L52 27 Q49 20 41 19 Q33 20 29 27 Z"
        fill="#3d2b1f"
      />
      {/* Slightly mussed front */}
      <path
        d="M32 19 Q30 15 34 15 Q36 15.5 34 18"
        fill="#3d2b1f"
      />
      <path
        d="M40 16 Q42 13 44 16"
        fill="#3d2b1f"
      />

      {/* Headset band — over head */}
      <path
        d="M24 36 Q22 24 32 18 Q38 15 44 16 Q54 18 56 28 Q57 34 56 38"
        stroke="#374151"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Headset padding on top */}
      <path
        d="M34 17 Q40 14 46 17"
        stroke="#4b5563"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Headset ear cup — left */}
      <rect x="21" y="33" width="5" height="8" rx="2" fill="#374151" />
      <rect x="22" y="34.5" width="3" height="5" rx="1" fill="#1f2937" />
      {/* Emerald accent on ear cup */}
      <rect x="21.5" y="36" width="1" height="3" rx="0.5" fill="#10b981" opacity="0.6" />

      {/* Boom mic arm */}
      <path
        d="M23 41 Q22 46 26 49 Q30 52 32 50"
        stroke="#374151"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Mic head */}
      <ellipse cx="32.5" cy="49.5" rx="2.5" ry="1.8" fill="#374151" transform="rotate(-15 32.5 49.5)" />
      <ellipse cx="32.5" cy="49.5" rx="1.5" ry="1" fill="#1f2937" transform="rotate(-15 32.5 49.5)" />
      {/* Mic LED */}
      <circle cx="34" cy="49" r="0.6" fill="#10b981" opacity="0.8" />

      {/* Eyes — alert, aggressive, forward */}
      {/* Left eye */}
      <ellipse cx="35" cy="37" rx="3.5" ry="2.8" fill="white" />
      <circle cx="36.2" cy="37" r="2" fill="#3d2b1f" />
      <circle cx="36.8" cy="36.4" r="0.6" fill="white" />
      {/* Right eye */}
      <ellipse cx="46" cy="37" rx="3" ry="2.8" fill="white" />
      <circle cx="47.2" cy="37" r="2" fill="#3d2b1f" />
      <circle cx="47.8" cy="36.4" r="0.6" fill="white" />

      {/* Eyebrows — raised, intense */}
      <path
        d="M31 32.5 Q35 30 39 32"
        stroke="#2a1f14"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43 32 Q46 30 50 32.5"
        stroke="#2a1f14"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M40 38.5 L41.5 43 L39 44 Q38.5 43.5 39 43"
        stroke="#b8885a"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth — confident grin */}
      <path
        d="M35 47.5 Q40 50.5 45 47.5"
        stroke="#a0644a"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Grin — teeth hint */}
      <path
        d="M37 48 Q40 49.5 43 48"
        fill="white"
        opacity="0.6"
      />
      {/* Smirk upturn on right */}
      <path
        d="M44.5 47.5 Q45.5 47 45.5 46.5"
        stroke="#a0644a"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Forward lean indicator — shadow under chin suggesting posture */}
      <path
        d="M34 52 Q40 54 46 52"
        fill="#b8885a"
        opacity="0.15"
      />
    </svg>
  );
}
