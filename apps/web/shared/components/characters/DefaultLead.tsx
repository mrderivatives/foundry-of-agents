export default function DefaultLead({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <circle cx="40" cy="40" r="38" fill="#0c1218" />

      {/* Subtle cyan ambient */}
      <circle cx="40" cy="38" r="20" fill="#06b6d4" opacity="0.04" />

      {/* Neck */}
      <rect x="35" y="48" width="12" height="8" rx="3" fill="#c8a080" />

      {/* Smart-casual top - clean collared shirt */}
      <path
        d="M16 80 L21 58 C22 53 28 50 34 50 L48 50 C54 50 60 53 61 58 L66 80"
        fill="#162028"
      />
      {/* Shirt front */}
      <path
        d="M34 50 L33 66 C33 68 36 70 41 70 C46 70 49 68 49 66 L48 50"
        fill="#1a2832"
      />

      {/* Clean collar */}
      <path
        d="M34 50 L31 52 L35 56 L41 53 L47 56 L51 52 L48 50"
        fill="#e8e0d4"
      />
      {/* Collar shadow */}
      <path
        d="M35 54 L41 52 L47 54"
        stroke="#d0c8bc"
        strokeWidth="0.5"
        fill="none"
      />

      {/* Headset band - over head */}
      <path
        d="M24 34 C24 20 32 14 41 14 C50 14 58 20 58 34"
        stroke="#3d3d4a"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Headset band highlight */}
      <path
        d="M28 24 C30 18 36 15 41 15 C46 15 52 18 54 24"
        stroke="#4a4a58"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left ear cup */}
      <rect x="22" y="32" width="5" height="8" rx="2.5" fill="#3d3d4a" />
      <rect x="23" y="33.5" width="3" height="5" rx="1.5" fill="#06b6d4" opacity="0.3" />
      {/* Right ear cup */}
      <rect x="55" y="32" width="5" height="8" rx="2.5" fill="#3d3d4a" />
      <rect x="56" y="33.5" width="3" height="5" rx="1.5" fill="#06b6d4" opacity="0.3" />
      {/* Boom microphone */}
      <path
        d="M23 38 C20 40 18 44 17 46"
        stroke="#3d3d4a"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Mic tip */}
      <ellipse cx="16.5" cy="46.5" rx="2" ry="1.5" fill="#2d2d3a" />
      <ellipse cx="16.5" cy="46.5" rx="1.2" ry="0.8" fill="#06b6d4" opacity="0.4" />

      {/* Head - 3/4 view, gender-neutral */}
      <ellipse cx="41" cy="35" rx="14.5" ry="15.5" fill="#c8a080" />
      {/* Ear left (partially behind headset) */}
      <ellipse cx="27.5" cy="36" rx="2" ry="3" fill="#b89070" />

      {/* Clean, versatile hair - medium length, neat */}
      <path
        d="M27 28 C26 19 33 14.5 41 14 C49 13.5 56 18 57 27 L57 30 C56 23 50 18 41 17.5 C32 17 28 22 27 30 Z"
        fill="#3a2a1e"
      />
      {/* Hair top volume */}
      <path
        d="M28 22 C30 16 36 13 42 13 C48 13 54 16 56 22 C54 18 48 15.5 42 15.5 C36 15.5 30 18 28 22 Z"
        fill="#4a3a2e"
      />
      {/* Side hair */}
      <path
        d="M27 28 C27 30 27 33 27.5 35"
        stroke="#3a2a1e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Some texture */}
      <path
        d="M34 14 C33 12.5 35 12 36 13.5"
        stroke="#4a3a2e"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M46 14 C47 12.5 49 13 48 15"
        stroke="#4a3a2e"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Eyes - open, approachable, warm */}
      <ellipse cx="35" cy="35" rx="3.2" ry="3" fill="white" />
      <ellipse cx="47" cy="35" rx="2.8" ry="3" fill="white" />
      {/* Irises - warm brown */}
      <circle cx="36" cy="35" r="1.8" fill="#4a3020" />
      <circle cx="47.8" cy="35" r="1.6" fill="#4a3020" />
      {/* Pupils */}
      <circle cx="36.2" cy="34.8" r="0.9" fill="#1a1010" />
      <circle cx="48" cy="34.8" r="0.8" fill="#1a1010" />
      {/* Warm highlights */}
      <circle cx="36.8" cy="34" r="0.6" fill="white" />
      <circle cx="48.4" cy="34" r="0.5" fill="white" />
      <circle cx="35.2" cy="35.5" r="0.3" fill="white" opacity="0.5" />

      {/* Eyebrows - friendly, slightly raised */}
      <path
        d="M31 31 C33 29.5 37 29.5 39 31"
        stroke="#3a2a1e"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M43 31 C45 29.5 49 29.5 51 31"
        stroke="#3a2a1e"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Nose */}
      <path
        d="M42 37 C42 39 41 41 39.5 41.5 C40.5 42 42 41 42.5 39.5"
        stroke="#b89070"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth - warm, approachable smile */}
      <path
        d="M35 44 C38 46.5 44 46.5 47 44"
        stroke="#a07050"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Slight smile upturn */}
      <path
        d="M36 44.5 C38 46 44 46 46 44.5"
        fill="#c8a080"
        opacity="0.3"
      />

      {/* Cyan accent on collar/shirt */}
      <line x1="41" y1="53" x2="41" y2="58" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5" />

      {/* Headset LED indicator */}
      <circle cx="24" cy="34" r="0.8" fill="#06b6d4" opacity="0.8" />
    </svg>
  );
}
