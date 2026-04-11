export default function Planner({ size = 48 }: { size?: number }) {
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

      {/* Neck */}
      <path d="M35 52 L35 58 L45 58 L45 52" fill="#c69c6d" />

      {/* Button-up shirt */}
      <path
        d="M20 80 L23 60 C23 56 29 53 35 52 L35 58 L20 66 Z"
        fill="#dbeafe"
      />
      <path
        d="M60 80 L57 60 C57 56 51 53 45 52 L45 58 L60 66 Z"
        fill="#dbeafe"
      />
      {/* Shirt center panel */}
      <path
        d="M35 55 L35 80 L45 80 L45 55 C43 54 37 54 35 55 Z"
        fill="#eff6ff"
      />
      {/* Collar */}
      <path d="M35 52 L31 56 L35 58 Z" fill="#bfdbfe" />
      <path d="M45 52 L49 56 L45 58 Z" fill="#bfdbfe" />
      {/* Collar inner shadow */}
      <path d="M35 53 L33 55 L35 56.5 Z" fill="#93c5fd" />
      <path d="M45 53 L47 55 L45 56.5 Z" fill="#93c5fd" />
      {/* Buttons */}
      <circle cx="40" cy="60" r="0.8" fill="#94a3b8" />
      <circle cx="40" cy="64" r="0.8" fill="#94a3b8" />
      <circle cx="40" cy="68" r="0.8" fill="#94a3b8" />

      {/* Head — slightly rounder, 3/4 view right */}
      <ellipse cx="40" cy="35" rx="14.5" ry="16.5" fill="#c69c6d" />
      {/* Ear left */}
      <ellipse cx="26" cy="36" rx="2.5" ry="3.5" fill="#b8895e" />
      <ellipse cx="26.5" cy="36" rx="1.5" ry="2.5" fill="#c69c6d" />

      {/* Pencil tucked behind right ear */}
      <g transform="rotate(25, 54, 28)">
        {/* Pencil body */}
        <rect x="51" y="22" width="2" height="14" rx="0.5" fill="#f59e0b" />
        {/* Pencil tip */}
        <path d="M51 36 L52 39 L53 36 Z" fill="#d4a574" />
        {/* Pencil top / eraser */}
        <rect x="51" y="20" width="2" height="2.5" rx="0.5" fill="#f87171" />
        {/* Metal band */}
        <rect x="50.8" y="22" width="2.4" height="1" fill="#a8a29e" />
      </g>

      {/* Hair — slightly shorter, neat, parted */}
      <path
        d="M26 29 C26 17 35 13 41 13 C48 13 55 18 55 29 C54 24 50 19 42 18 C35 17 28 22 26 29 Z"
        fill="#5c3a1e"
      />
      {/* Hair volume top */}
      <path
        d="M28 27 C29 17 37 12 42 12 C48 12 54 16 54 27 C52 20 47 16 42 16 C37 16 31 20 28 27 Z"
        fill="#6b4423"
      />
      {/* Part line */}
      <path
        d="M38 13 C38 16 37 20 36 25"
        stroke="#4a2e14"
        strokeWidth="0.6"
        fill="none"
      />
      {/* Side hair */}
      <path d="M26 29 C25 33 25 35 26 38 C26 34 27 29 28 27" fill="#5c3a1e" />

      {/* Eyes — eager, slightly wide */}
      {/* Left eye */}
      <ellipse cx="34" cy="35.5" rx="3.2" ry="2.8" fill="white" />
      <circle cx="35.2" cy="35.5" r="1.6" fill="#2c1810" />
      <circle cx="35.7" cy="35" r="0.6" fill="white" />
      {/* Right eye */}
      <ellipse cx="46" cy="35" rx="3" ry="2.6" fill="white" />
      <circle cx="47" cy="35" r="1.5" fill="#2c1810" />
      <circle cx="47.4" cy="34.5" r="0.6" fill="white" />

      {/* Eyebrows — slightly raised, eager */}
      <path
        d="M30.5 31.5 C32.5 30 36 30 37.5 31"
        stroke="#5c3a1e"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43.5 30.5 C45.5 29.5 48.5 30 49.5 31.5"
        stroke="#5c3a1e"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M40 36 L41.5 41 L39.5 42"
        stroke="#b8895e"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth — slightly eager, motivated smile */}
      <path
        d="M36 45.5 C38 47 42 47.5 44.5 46"
        stroke="#96643e"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Slight teeth showing */}
      <path
        d="M37 45.8 C38.5 46.8 41.5 47 43.5 46.2"
        fill="white"
        opacity="0.6"
      />

      {/* Clipboard in right hand area */}
      <g transform="rotate(8, 58, 62)">
        {/* Clipboard board */}
        <rect x="52" y="54" width="14" height="20" rx="1" fill="#1e40af" />
        {/* Paper */}
        <rect x="53.5" y="57" width="11" height="15.5" rx="0.5" fill="#eff6ff" />
        {/* Clip at top */}
        <rect x="56" y="52.5" width="6" height="3.5" rx="1" fill="#3b82f6" />
        <rect x="57" y="53.5" width="4" height="1.5" rx="0.5" fill="#60a5fa" />
        {/* Content lines — calendar/planning grid */}
        <rect x="54.5" y="58" width="9" height="0.6" rx="0.3" fill="#3b82f6" opacity="0.4" />
        <rect x="54.5" y="60" width="7" height="0.6" rx="0.3" fill="#3b82f6" opacity="0.3" />
        <rect x="54.5" y="62" width="8" height="0.6" rx="0.3" fill="#3b82f6" opacity="0.3" />
        {/* Checkboxes */}
        <rect x="54.5" y="64.5" width="1.5" height="1.5" rx="0.2" stroke="#3b82f6" strokeWidth="0.4" fill="none" />
        <rect x="54.5" y="67" width="1.5" height="1.5" rx="0.2" stroke="#3b82f6" strokeWidth="0.4" fill="none" />
        {/* Checkmarks */}
        <path d="M54.8 65.3 L55.2 65.8 L56 64.8" stroke="#3b82f6" strokeWidth="0.4" fill="none" />
        <path d="M54.8 67.8 L55.2 68.3 L56 67.3" stroke="#3b82f6" strokeWidth="0.4" fill="none" />
        {/* Text next to checks */}
        <rect x="57" y="64.8" width="5" height="0.6" rx="0.3" fill="#64748b" opacity="0.4" />
        <rect x="57" y="67.3" width="4" height="0.6" rx="0.3" fill="#64748b" opacity="0.4" />
      </g>
      {/* Hand holding clipboard */}
      <path
        d="M54 60 C55 58 57 57 58 58 C59 59 57 62 55 63 L53 62"
        fill="#c69c6d"
      />

      {/* Shirt cuff detail */}
      <path
        d="M54 61 L56 59"
        stroke="#bfdbfe"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Subtle shirt pocket with pen */}
      <rect x="30" y="60" width="4" height="5" rx="0.5" stroke="#bfdbfe" strokeWidth="0.5" fill="none" />
      <line x1="32" y1="58" x2="32" y2="61" stroke="#3b82f6" strokeWidth="0.6" />
    </svg>
  );
}
