export default function ChiefOfStaff({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle for framing */}
      <circle cx="40" cy="40" r="38" fill="#1a1a2e" />

      {/* Neck */}
      <path d="M35 52 L35 58 L45 58 L45 52" fill="#d4a574" />

      {/* Blazer — smart casual, open front */}
      <path
        d="M20 80 L22 60 C22 56 28 53 35 52 L35 58 L27 62 L25 80 Z"
        fill="#2563eb"
      />
      <path
        d="M60 80 L58 60 C58 56 52 53 45 52 L45 58 L53 62 L55 80 Z"
        fill="#2563eb"
      />
      {/* Blazer lapels */}
      <path d="M35 58 L30 64 L33 66 L37 60 Z" fill="#1e40af" />
      <path d="M45 58 L50 64 L47 66 L43 60 Z" fill="#1e40af" />
      {/* Blazer collar shadow */}
      <path d="M35 52 L32 55 L35 58 Z" fill="#1e40af" />
      <path d="M45 52 L48 55 L45 58 Z" fill="#1e40af" />

      {/* T-shirt visible under blazer */}
      <path
        d="M35 55 L35 80 L45 80 L45 55 C43 54 37 54 35 55 Z"
        fill="#374151"
      />
      {/* T-shirt neckline */}
      <path
        d="M35 53 C37 56 43 56 45 53"
        stroke="#4b5563"
        strokeWidth="0.8"
        fill="none"
      />

      {/* Head — 3/4 view, slightly right */}
      <ellipse cx="40" cy="36" rx="14" ry="16" fill="#d4a574" />
      {/* Ear (left side, visible in 3/4) */}
      <ellipse cx="26.5" cy="37" rx="2.5" ry="3.5" fill="#c4956a" />
      <ellipse cx="27" cy="37" rx="1.5" ry="2.5" fill="#d4a574" />

      {/* Earpiece in right ear */}
      <circle cx="54" cy="36" r="1.8" fill="#3b82f6" />
      <path
        d="M54 34.2 C56 33 56 31 55 30"
        stroke="#3b82f6"
        strokeWidth="1"
        fill="none"
      />
      {/* Earpiece wire */}
      <path
        d="M53 37.8 L52 42 L50 48"
        stroke="#60a5fa"
        strokeWidth="0.6"
        fill="none"
      />

      {/* Hair — medium-length, neat, swept to side */}
      <path
        d="M26 30 C26 18 34 14 42 14 C50 14 56 20 55 30 C55 26 52 22 42 20 C34 19 28 24 26 30 Z"
        fill="#2c1810"
      />
      {/* Hair top volume */}
      <path
        d="M28 28 C28 18 36 12 43 13 C50 14 55 18 54 28 C53 22 48 17 42 17 C36 17 30 22 28 28 Z"
        fill="#3d2317"
      />
      {/* Side hair detail */}
      <path
        d="M26 30 C25 34 25 36 26 38 C26 34 27 30 28 28"
        fill="#2c1810"
      />

      {/* Eyes — friendly expression, looking slightly right */}
      {/* Left eye */}
      <ellipse cx="34" cy="36" rx="3" ry="2.5" fill="white" />
      <circle cx="35" cy="36" r="1.5" fill="#1a1a2e" />
      <circle cx="35.5" cy="35.5" r="0.5" fill="white" />
      {/* Right eye */}
      <ellipse cx="46" cy="35.5" rx="2.8" ry="2.3" fill="white" />
      <circle cx="47" cy="35.5" r="1.4" fill="#1a1a2e" />
      <circle cx="47.4" cy="35" r="0.5" fill="white" />

      {/* Eyebrows — friendly, slightly raised */}
      <path
        d="M31 32.5 C33 31 36 31.2 37.5 32"
        stroke="#2c1810"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43.5 31.5 C45 31 48 31.5 49 32.5"
        stroke="#2c1810"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M40 36 L41 41 L39 42"
        stroke="#c4956a"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth — friendly smile */}
      <path
        d="M36 45 C38 47.5 43 47.5 45 45"
        stroke="#a0644a"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Lanyard */}
      <path
        d="M37 52 L37 68"
        stroke="#3b82f6"
        strokeWidth="1.8"
        fill="none"
      />
      {/* Badge */}
      <rect x="34" y="68" width="7" height="9" rx="1" fill="#60a5fa" />
      <rect x="35.5" y="70" width="4" height="2" rx="0.5" fill="white" opacity="0.6" />
      <rect x="35.5" y="73" width="4" height="1" rx="0.5" fill="white" opacity="0.4" />
      {/* Lanyard clip */}
      <rect x="36.5" y="66.5" width="3" height="2" rx="0.5" fill="#93c5fd" />

      {/* Tablet/clipboard in left hand */}
      <g transform="rotate(-12, 18, 68)">
        <rect x="12" y="58" width="12" height="16" rx="1.5" fill="#1e293b" />
        <rect x="13" y="59.5" width="10" height="12" rx="0.5" fill="#3b82f6" opacity="0.3" />
        {/* Screen content lines */}
        <rect x="14" y="61" width="6" height="0.8" rx="0.4" fill="#60a5fa" opacity="0.5" />
        <rect x="14" y="63" width="7" height="0.8" rx="0.4" fill="#60a5fa" opacity="0.4" />
        <rect x="14" y="65" width="5" height="0.8" rx="0.4" fill="#60a5fa" opacity="0.3" />
        <rect x="14" y="67" width="7" height="0.8" rx="0.4" fill="#60a5fa" opacity="0.3" />
      </g>
      {/* Hand holding tablet */}
      <path
        d="M22 62 C20 63 18 64 17 66 C16 67 18 68 20 67 L23 65"
        fill="#d4a574"
      />

      {/* Subtle shoulder details */}
      <path
        d="M22 60 C20 58 20 56 22 54"
        stroke="#1e40af"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M58 60 C60 58 60 56 58 54"
        stroke="#1e40af"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}
