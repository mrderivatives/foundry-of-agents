export default function CareerAnalyst({ size = 48 }: { size?: number }) {
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
      <path d="M35 52 L35 58 L45 58 L45 52" fill="#dbb896" />

      {/* Sweater vest over collared shirt */}
      {/* Shirt sleeves visible */}
      <path
        d="M20 80 L23 61 C23 57 28 54 33 53 L28 58 L20 66 Z"
        fill="#e2e8f0"
      />
      <path
        d="M60 80 L57 61 C57 57 52 54 47 53 L52 58 L60 66 Z"
        fill="#e2e8f0"
      />
      {/* Sweater vest body */}
      <path
        d="M28 58 L28 80 L52 80 L52 58 C50 55 46 53 40 52 C34 53 30 55 28 58 Z"
        fill="#1e40af"
      />
      {/* V-neck of sweater */}
      <path d="M35 53 L40 62 L45 53" fill="#e2e8f0" />
      {/* Vest ribbing at bottom */}
      <path
        d="M28 76 L52 76"
        stroke="#2563eb"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M28 77.5 L52 77.5"
        stroke="#2563eb"
        strokeWidth="0.5"
        fill="none"
      />
      {/* Collar points visible */}
      <path d="M36 53 L33 57 L36 56 Z" fill="#cbd5e1" />
      <path d="M44 53 L47 57 L44 56 Z" fill="#cbd5e1" />
      {/* Tie hint in V */}
      <rect x="39" y="55" width="2" height="7" rx="0.5" fill="#3b82f6" />
      <path d="M39 55 L40 53.5 L41 55 Z" fill="#3b82f6" />

      {/* Head — slightly narrower, neat appearance */}
      <ellipse cx="40" cy="35" rx="13.5" ry="16" fill="#dbb896" />
      {/* Ear left */}
      <ellipse cx="27" cy="36" rx="2.5" ry="3.5" fill="#cca882" />
      <ellipse cx="27.5" cy="36" rx="1.5" ry="2.5" fill="#dbb896" />

      {/* Hair — very neat, short and tidy, slightly receding */}
      <path
        d="M27.5 29 C28 18 36 14 42 14 C49 14 54 19 54 29 C53 24 49 20 42 19 C36 19 29 23 27.5 29 Z"
        fill="#1a1a1a"
      />
      {/* Hair top — very clean shape */}
      <path
        d="M30 26 C31 18 37 14 42 14 C48 14 53 17.5 53 26 C51 20 47 17 42 17 C37 17 32 20 30 26 Z"
        fill="#2a2a2a"
      />
      {/* Very neat side part */}
      <path
        d="M27.5 29 C27 32 27 35 27.5 37 C27.5 33 28 29 29 27"
        fill="#1a1a1a"
      />

      {/* Rectangular glasses — key silhouette element */}
      {/* Left lens */}
      <rect x="29.5" y="32.5" rx="1.5" ry="1.5" width="9" height="7" stroke="#60a5fa" strokeWidth="1.2" fill="none" />
      {/* Right lens */}
      <rect x="41.5" y="32" rx="1.5" ry="1.5" width="8.5" height="6.8" stroke="#60a5fa" strokeWidth="1.2" fill="none" />
      {/* Bridge */}
      <path
        d="M38.5 35.5 C39 34.5 41 34.5 41.5 35.5"
        stroke="#60a5fa"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Left temple arm */}
      <path
        d="M29.5 34 L27 34.5 L25.5 36"
        stroke="#60a5fa"
        strokeWidth="1"
        fill="none"
      />
      {/* Right temple arm (mostly hidden) */}
      <path
        d="M50 33.5 L52 34"
        stroke="#60a5fa"
        strokeWidth="1"
        fill="none"
      />
      {/* Lens glare */}
      <path
        d="M31 33.5 L33 34"
        stroke="white"
        strokeWidth="0.4"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M43 33 L45 33.5"
        stroke="white"
        strokeWidth="0.4"
        opacity="0.3"
        fill="none"
      />

      {/* Eyes behind glasses — slightly nervous, sharp */}
      {/* Left eye */}
      <ellipse cx="34" cy="36" rx="2.8" ry="2.2" fill="white" />
      <circle cx="35" cy="36" r="1.3" fill="#1a1a2e" />
      <circle cx="35.3" cy="35.5" r="0.5" fill="white" />
      {/* Right eye — slightly smaller from 3/4 view */}
      <ellipse cx="46" cy="35.5" rx="2.6" ry="2.1" fill="white" />
      <circle cx="46.8" cy="35.5" r="1.2" fill="#1a1a2e" />
      <circle cx="47.1" cy="35" r="0.5" fill="white" />

      {/* Eyebrows — slightly worried angle, sharp */}
      <path
        d="M30 31 C32 30 36 30.5 38 31.5"
        stroke="#1a1a1a"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M42 30.5 C44 29.5 48 30 50 31.5"
        stroke="#1a1a1a"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose — refined */}
      <path
        d="M40.5 36 L41.5 41 L39.5 42"
        stroke="#cca882"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth — slightly tight, focused/nervous */}
      <path
        d="M37 45 C38.5 46 42 46 44 45"
        stroke="#a0724e"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Slight downturn hint */}
      <path
        d="M36.5 45.2 C36.2 45.5 36 45.3 36.2 45"
        stroke="#a0724e"
        strokeWidth="0.5"
        fill="none"
      />

      {/* Laptop/tablet suggestion in lower right */}
      <g transform="rotate(-5, 56, 68)">
        {/* Laptop base */}
        <rect x="50" y="66" width="16" height="10" rx="1" fill="#1e293b" />
        {/* Screen */}
        <rect x="51" y="67" width="14" height="7" rx="0.5" fill="#0f172a" />
        {/* Screen glow */}
        <rect x="52" y="68" width="12" height="5" rx="0.3" fill="#3b82f6" opacity="0.15" />
        {/* Data lines on screen */}
        <rect x="53" y="69" width="4" height="0.5" rx="0.2" fill="#60a5fa" opacity="0.4" />
        <rect x="53" y="70.5" width="6" height="0.5" rx="0.2" fill="#60a5fa" opacity="0.3" />
        <rect x="53" y="72" width="3" height="0.5" rx="0.2" fill="#60a5fa" opacity="0.3" />
        {/* Chart bar suggestion */}
        <rect x="60" y="70" width="1" height="2.5" rx="0.2" fill="#3b82f6" opacity="0.4" />
        <rect x="62" y="69" width="1" height="3.5" rx="0.2" fill="#60a5fa" opacity="0.4" />
      </g>
      {/* Hand near laptop */}
      <path
        d="M52 68 C53 67 55 66.5 56 67 C57 67.5 55 69 53 69.5"
        fill="#dbb896"
      />

      {/* Vest pattern — subtle argyle hint */}
      <path
        d="M34 64 L37 60 L40 64 L37 68 Z"
        stroke="#2563eb"
        strokeWidth="0.3"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M40 64 L43 60 L46 64 L43 68 Z"
        stroke="#2563eb"
        strokeWidth="0.3"
        opacity="0.3"
        fill="none"
      />
    </svg>
  );
}
