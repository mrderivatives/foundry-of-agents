export default function GrowthHacker({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <circle cx="40" cy="40" r="38" fill="#150d20" />

      {/* Energy accent glow */}
      <circle cx="40" cy="38" r="22" fill="#8b5cf6" opacity="0.04" />

      {/* Neck - slightly tilted for energy */}
      <path d="M34 48 L35 55 L48 55 L48 48" fill="#d4a070" />

      {/* Open shirt */}
      <path
        d="M16 80 L22 58 C23 53 28 50 34 50 L48 50 C54 50 59 53 60 58 L66 80"
        fill="#2a2040"
      />
      {/* Shirt collar left */}
      <path
        d="M34 50 L30 54 L33 60 L38 56"
        fill="#352a52"
      />
      {/* Shirt collar right */}
      <path
        d="M48 50 L52 54 L49 60 L44 56"
        fill="#352a52"
      />

      {/* Graphic tee underneath */}
      <path
        d="M35 52 C37 56 39 58 41 58 C43 58 45 56 47 52"
        fill="#7c3aed"
      />
      {/* Graphic on tee - lightning bolt */}
      <path
        d="M40 54 L42 56 L41 56 L42 58.5 L39 56 L40 56 Z"
        fill="#a78bfa"
      />

      {/* Headphones around neck */}
      <path
        d="M26 52 C26 48 28 46 30 46 L30 50 C28 50 27 51 26 52"
        fill="#3d3d3d"
      />
      <path
        d="M56 52 C56 48 54 46 52 46 L52 50 C54 50 55 51 56 52"
        fill="#3d3d3d"
      />
      {/* Headband across neck */}
      <path
        d="M30 48 C34 52 38 54 41 54 C44 54 48 52 52 48"
        stroke="#4a4a4a"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ear cups */}
      <ellipse cx="28" cy="50" rx="3.5" ry="4" fill="#3d3d3d" />
      <ellipse cx="28" cy="50" rx="2.5" ry="3" fill="#8b5cf6" opacity="0.4" />
      <ellipse cx="54" cy="50" rx="3.5" ry="4" fill="#3d3d3d" />
      <ellipse cx="54" cy="50" rx="2.5" ry="3" fill="#8b5cf6" opacity="0.4" />

      {/* Head - 3/4 view, slightly energetic tilt */}
      <ellipse cx="41" cy="34" rx="14.5" ry="15" fill="#d4a070" />
      {/* Ear left */}
      <ellipse cx="27.5" cy="35" rx="2.5" ry="3.5" fill="#c49060" />

      {/* Expressive hair - voluminous, creative */}
      <path
        d="M25 28 C23 18 31 12 41 11 C51 10 58 16 58 26 C58 28 57 30 56 32 L56 26 C56 18 50 14 41 14 C32 14 26 18 25 26 Z"
        fill="#2a1a0a"
      />
      {/* Hair volume and texture - curly/wavy creative */}
      <path
        d="M26 20 C24 15 27 12 31 13 C29 16 27 18 26 22"
        fill="#3d2a14"
      />
      <path
        d="M34 13 C34 10 38 9 40 11 C38 12 35 13 34 15"
        fill="#3d2a14"
      />
      <path
        d="M48 12 C50 9 54 10 54 14 C52 12 50 12 48 13"
        fill="#3d2a14"
      />
      <path
        d="M56 20 C58 16 60 18 58 24"
        stroke="#3d2a14"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Colorful streak in hair */}
      <path
        d="M32 14 C30 18 29 22 28 26"
        stroke="#8b5cf6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Eyes - bright, expressive, big */}
      <ellipse cx="35" cy="34" rx="4" ry="3.5" fill="white" />
      <ellipse cx="47" cy="34" rx="3.5" ry="3.5" fill="white" />
      {/* Irises - bright colored */}
      <circle cx="36.5" cy="34" r="2.2" fill="#5b21b6" />
      <circle cx="48" cy="34" r="2" fill="#5b21b6" />
      {/* Pupils */}
      <circle cx="37" cy="33.8" r="1" fill="#0a0a0a" />
      <circle cx="48.3" cy="33.8" r="0.9" fill="#0a0a0a" />
      {/* Bright highlights */}
      <circle cx="37.5" cy="33" r="0.7" fill="white" />
      <circle cx="35" cy="34.5" r="0.4" fill="white" />
      <circle cx="48.8" cy="33" r="0.6" fill="white" />

      {/* Eyebrows - raised, energetic */}
      <path
        d="M30 29 C33 27 37 27 39 28.5"
        stroke="#2a1a0a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M43 28.5 C45 27 49 27 52 29"
        stroke="#2a1a0a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Nose */}
      <path
        d="M42 36 C42 38 41 40 39.5 40.5 C40.5 41 42 40 42.5 38.5"
        stroke="#c49060"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth - big enthusiastic grin */}
      <path
        d="M34 43 C37 46 44 46 48 43"
        stroke="#a07050"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Teeth hint */}
      <path
        d="M36 43.5 C38 45 43 45 46 43.5"
        fill="white"
        opacity="0.8"
      />

      {/* Phone in hand suggestion at bottom right */}
      <rect x="56" y="64" width="6" height="10" rx="1.5" fill="#2a2a3a" />
      <rect x="57" y="65" width="4" height="7" rx="0.5" fill="#8b5cf6" opacity="0.3" />

      {/* Energy sparkles */}
      <circle cx="18" cy="28" r="1" fill="#a78bfa" opacity="0.6" />
      <circle cx="62" cy="22" r="0.8" fill="#8b5cf6" opacity="0.5" />
      <circle cx="16" cy="42" r="0.6" fill="#7c3aed" opacity="0.4" />
    </svg>
  );
}
