export default function CTO({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <circle cx="40" cy="40" r="38" fill="#0f0a1a" />

      {/* Subtle code-glow ambient behind head */}
      <circle cx="40" cy="36" r="20" fill="#8b5cf6" opacity="0.04" />

      {/* Neck */}
      <rect x="35" y="48" width="12" height="8" rx="3" fill="#c8946a" />

      {/* Hoodie body */}
      <path
        d="M16 80 L21 58 C22 53 27 50 33 50 L49 50 C55 50 60 53 61 58 L66 80"
        fill="#1e1040"
      />
      {/* Hoodie hood behind head */}
      <path
        d="M28 50 C26 44 26 38 28 34 L54 34 C56 38 56 44 54 50"
        fill="#2a1650"
        opacity="0.5"
      />
      {/* Hoodie front V/collar */}
      <path
        d="M33 50 C35 54 38 56 41 56 C44 56 47 54 49 50"
        fill="#2a1650"
      />
      {/* Hoodie kangaroo pocket */}
      <path
        d="M30 68 C30 66 35 65 41 65 C47 65 52 66 52 68 L52 74 C52 76 47 77 41 77 C35 77 30 76 30 74 Z"
        fill="#251448"
        opacity="0.6"
      />
      {/* Drawstrings */}
      <line x1="39" y1="50" x2="37" y2="60" stroke="#7c3aed" strokeWidth="0.7" />
      <line x1="43" y1="50" x2="45" y2="60" stroke="#7c3aed" strokeWidth="0.7" />
      {/* Drawstring tips */}
      <rect x="36" y="59" width="2" height="3" rx="0.5" fill="#a78bfa" opacity="0.6" />
      <rect x="44" y="59" width="2" height="3" rx="0.5" fill="#a78bfa" opacity="0.6" />

      {/* Head - 3/4 view */}
      <ellipse cx="41" cy="35" rx="14.5" ry="15.5" fill="#c8946a" />
      {/* Ear left */}
      <ellipse cx="27.5" cy="36" rx="2.5" ry="3.5" fill="#b8845e" />

      {/* Short practical hair */}
      <path
        d="M27 28 C27 20 33 16 41 15.5 C49 15 55 19 56 27 L56 30 C55 26 50 20 41 19.5 C32 19 28 24 27 30 Z"
        fill="#1a1a2e"
      />
      {/* Hair top - short, neat texture */}
      <path
        d="M29 24 C31 19 36 17 42 16.5 C48 16 53 18 55 23 C53 20 48 18 42 18 C36 18 31 20 29 24 Z"
        fill="#252540"
      />
      {/* Side fade */}
      <path
        d="M27 30 C27 28 27 26 28 24"
        stroke="#1a1a2e"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Glasses frame */}
      <rect x="30" y="32" width="10" height="8" rx="3" stroke="#a78bfa" strokeWidth="1.5" fill="none" />
      <rect x="43" y="32" width="9" height="8" rx="3" stroke="#a78bfa" strokeWidth="1.5" fill="none" />
      {/* Bridge */}
      <path d="M40 35 C41 34 42 34 43 35" stroke="#a78bfa" strokeWidth="1.2" fill="none" />
      {/* Temple arm left */}
      <line x1="30" y1="34" x2="27" y2="35" stroke="#a78bfa" strokeWidth="1.2" />

      {/* Code reflection in lenses */}
      <rect x="30" y="32" width="10" height="8" rx="3" fill="#8b5cf6" opacity="0.08" />
      <rect x="43" y="32" width="9" height="8" rx="3" fill="#8b5cf6" opacity="0.08" />
      {/* Terminal text reflections - left lens */}
      <text x="32" y="37" fill="#a78bfa" opacity="0.35" fontSize="3" fontFamily="monospace">{"{ }"}</text>
      {/* Terminal text reflections - right lens */}
      <text x="44.5" y="37" fill="#7c3aed" opacity="0.35" fontSize="3" fontFamily="monospace">{"/>"}</text>

      {/* Eyes behind glasses - focused intensity */}
      <ellipse cx="35" cy="36" rx="2.8" ry="2.5" fill="white" />
      <ellipse cx="47.5" cy="36" rx="2.5" ry="2.5" fill="white" />
      <circle cx="36" cy="36" r="1.6" fill="#1a1a2e" />
      <circle cx="48" cy="36" r="1.4" fill="#1a1a2e" />
      {/* Sharp highlights */}
      <circle cx="36.5" cy="35.2" r="0.5" fill="white" />
      <circle cx="48.5" cy="35.2" r="0.4" fill="white" />

      {/* Eyebrows - focused, slightly furrowed */}
      <path
        d="M30 30 C32 28.5 36 28.5 39 30"
        stroke="#1a1a2e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M43 30 C45 28.5 48 28.5 51 30"
        stroke="#1a1a2e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Nose */}
      <path
        d="M42 38 C42 40 41 42 39 42.5 C40 43 42 42 42.5 40.5"
        stroke="#b8845e"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mouth - slight concentration, closed */}
      <path
        d="M37 46 C39 46.8 43 46.8 45 46"
        stroke="#a07050"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mechanical keyboard suggestion at bottom */}
      <rect x="20" y="76" width="42" height="4" rx="1" fill="#1a1a2e" opacity="0.5" />
      <rect x="22" y="76.5" width="3" height="2.5" rx="0.5" fill="#8b5cf6" opacity="0.3" />
      <rect x="26" y="76.5" width="3" height="2.5" rx="0.5" fill="#5b21b6" opacity="0.3" />
      <rect x="30" y="76.5" width="3" height="2.5" rx="0.5" fill="#7c3aed" opacity="0.3" />
      <rect x="34" y="76.5" width="3" height="2.5" rx="0.5" fill="#8b5cf6" opacity="0.3" />
      <rect x="38" y="76.5" width="3" height="2.5" rx="0.5" fill="#5b21b6" opacity="0.3" />
      <rect x="42" y="76.5" width="3" height="2.5" rx="0.5" fill="#7c3aed" opacity="0.3" />
      <rect x="46" y="76.5" width="3" height="2.5" rx="0.5" fill="#8b5cf6" opacity="0.3" />
      <rect x="50" y="76.5" width="3" height="2.5" rx="0.5" fill="#5b21b6" opacity="0.3" />
      <rect x="54" y="76.5" width="3" height="2.5" rx="0.5" fill="#7c3aed" opacity="0.3" />

      {/* Subtle glow from screen on face bottom */}
      <ellipse cx="41" cy="50" rx="12" ry="5" fill="#8b5cf6" opacity="0.05" />
    </svg>
  );
}
