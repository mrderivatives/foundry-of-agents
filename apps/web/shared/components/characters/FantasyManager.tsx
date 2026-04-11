export default function FantasyManager({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background shadow */}
      <ellipse cx="40" cy="72" rx="22" ry="4" fill="#1a1a1a" opacity="0.3" />

      {/* Neck */}
      <path d="M35 46 L35 50 L45 50 L45 46" fill="#dbb896" />

      {/* Body — hoodie, slightly hunched */}
      <path
        d="M18 56 C18 52 26 47 35 47 L45 47 C54 47 62 52 62 56 L64 80 L16 80 L18 56Z"
        fill="#374151"
      />
      {/* Hoodie front pouch pocket */}
      <path
        d="M28 64 C28 62 33 61 40 61 C47 61 52 62 52 64 L52 72 L28 72 Z"
        fill="#2d3748"
        opacity="0.6"
      />
      {/* Hoodie pocket line */}
      <path
        d="M28 64 C33 62.5 47 62.5 52 64"
        stroke="#4b5563"
        strokeWidth="0.8"
        fill="none"
      />
      {/* Hoodie center string area */}
      <line x1="38" y1="50" x2="37" y2="62" stroke="#6b7280" strokeWidth="0.7" />
      <line x1="42" y1="50" x2="43" y2="62" stroke="#6b7280" strokeWidth="0.7" />
      {/* String tips */}
      <circle cx="37" cy="62.5" r="0.8" fill="#9ca3af" />
      <circle cx="43" cy="62.5" r="0.8" fill="#9ca3af" />

      {/* Hood — up slightly behind head */}
      <path
        d="M22 44 C20 38 22 28 26 22 C30 17 35 14 40 13 C45 14 50 17 54 22 C58 28 60 38 58 44 C56 46 54 48 50 49 L45 47 L35 47 L30 49 C26 48 24 46 22 44Z"
        fill="#4b5563"
      />
      {/* Hood inner shadow */}
      <path
        d="M24 42 C23 36 24 28 28 23 C31 19 35 16 40 15 C45 16 49 19 52 23 C56 28 57 36 56 42 C54 44 52 46 49 47 L31 47 C28 46 26 44 24 42Z"
        fill="#374151"
      />

      {/* Head — 3/4 view facing right, inside hood */}
      <ellipse cx="40" cy="33" rx="14" ry="15" fill="#dbb896" />
      {/* Left ear */}
      <ellipse cx="26.5" cy="34" rx="2" ry="3" fill="#c9a57e" />
      <ellipse cx="27" cy="34" rx="1.2" ry="2" fill="#dbb896" />

      {/* Messy tousled hair sticking out of hood */}
      <path
        d="M27 26 C26 20 30 16 36 15 C38 15 42 14.5 44 15 C48 16 52 19 53 24 C53 26 52 27 51 26 C50 23 47 19 42 18 C37 18 32 20 30 24 C29 26 27.5 27 27 26Z"
        fill="#6b4423"
      />
      {/* Messy strands poking out */}
      <path d="M28 22 C27 19 29 16 32 15" stroke="#6b4423" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M34 17 C33 14 35 12 38 13" stroke="#6b4423" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M42 16 C43 13 46 12 47 14" stroke="#6b4423" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M49 19 C51 17 53 17 52 20" stroke="#6b4423" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Fringe/bangs messy */}
      <path
        d="M28 26 C30 23 32 24 33 22 C34 24 36 22 37 24 C38 22 40 23 41 22 C42 24 43 22 44 24 C45 22 47 23 48 22 C49 24 51 23 52 25"
        stroke="#6b4423"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Screen glow effect on face — subtle blue tint */}
      <ellipse cx="42" cy="34" rx="10" ry="8" fill="#93c5fd" opacity="0.08" />
      <ellipse cx="44" cy="32" rx="6" ry="5" fill="#60a5fa" opacity="0.06" />

      {/* Eyes — excited, wide */}
      {/* Left eye */}
      <ellipse cx="34" cy="32" rx="3.2" ry="2.8" fill="white" />
      <circle cx="35.2" cy="32" r="1.8" fill="#5b3a1f" />
      <circle cx="35.8" cy="31.3" r="0.6" fill="white" />
      <circle cx="34.5" cy="32.5" r="0.3" fill="white" />
      {/* Right eye */}
      <ellipse cx="46" cy="32" rx="3" ry="2.8" fill="white" />
      <circle cx="47" cy="32" r="1.8" fill="#5b3a1f" />
      <circle cx="47.5" cy="31.3" r="0.6" fill="white" />
      <circle cx="46.3" cy="32.5" r="0.3" fill="white" />
      {/* Eyebrows — raised, excited */}
      <path
        d="M30 28 C32 26.5 36 26.5 38 27.5"
        stroke="#5b3a1f"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43 27.5 C45 26.5 48 26.8 50 28.2"
        stroke="#5b3a1f"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M41 34 C42 36 42.5 37.5 41.5 38.2 C40.5 38.5 39 38.3 38.5 37.8"
        stroke="#c9a57e"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth — excited grin */}
      <path
        d="M34 41 C36 43.5 44 43.5 46 41"
        stroke="#a07050"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Open mouth / teeth hint */}
      <path
        d="M35.5 41.5 C37 43 43 43 44.5 41.5"
        fill="#8b5e3c"
      />
      <path
        d="M36.5 41.5 C38 42 42 42 43.5 41.5"
        fill="#f5f0e8"
      />

      {/* Coffee cup — held near face, right side */}
      {/* Right arm coming up */}
      <path
        d="M54 56 C56 52 58 48 56 44 C55 42 53 41 52 42"
        stroke="#374151"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hand */}
      <ellipse cx="53" cy="42" rx="2.5" ry="2" fill="#dbb896" />
      {/* Cup body */}
      <path
        d="M50 36 L50 46 C50 47.5 52 48 54 48 C56 48 58 47.5 58 46 L58 36 Z"
        fill="#f59e0b"
      />
      {/* Cup rim */}
      <ellipse cx="54" cy="36" rx="4" ry="1.5" fill="#fbbf24" />
      {/* Cup handle */}
      <path
        d="M58 39 C60 39 61 41 61 43 C61 45 60 46 58 46"
        stroke="#d97706"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Steam wisps */}
      <path d="M52 34 C51.5 32 52.5 30 52 28" stroke="#9ca3af" strokeWidth="0.6" opacity="0.5" strokeLinecap="round" fill="none" />
      <path d="M54 33 C54.5 31 53.5 29 54 27" stroke="#9ca3af" strokeWidth="0.6" opacity="0.4" strokeLinecap="round" fill="none" />
      <path d="M56 34 C55.5 32 56.5 30 56 28.5" stroke="#9ca3af" strokeWidth="0.6" opacity="0.3" strokeLinecap="round" fill="none" />

      {/* Amber accent — hoodie logo/patch */}
      <circle cx="32" cy="56" r="2.5" fill="#f59e0b" opacity="0.8" />
      <path d="M31 56 L32 54.5 L33 56 L32.5 56 L32.5 57.5 L31.5 57.5 L31.5 56 Z" fill="#92400e" />
    </svg>
  );
}
