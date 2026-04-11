export default function Quant({ size = 48 }: { size?: number }) {
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

      {/* Floating math symbols — subtle, decorative */}
      <text x="16" y="22" fill="#10b981" opacity="0.4" fontSize="7" fontFamily="serif">&#x03A3;</text>
      <text x="60" y="18" fill="#34d399" opacity="0.3" fontSize="6" fontFamily="serif">&#x03C0;</text>
      <text x="10" y="38" fill="#059669" opacity="0.25" fontSize="5" fontFamily="monospace">&#123;&#125;</text>
      <text x="64" y="30" fill="#10b981" opacity="0.3" fontSize="5" fontFamily="monospace">01</text>
      <text x="14" y="52" fill="#34d399" opacity="0.2" fontSize="6" fontFamily="serif">&#x222B;</text>
      <text x="66" y="44" fill="#059669" opacity="0.25" fontSize="5" fontFamily="monospace">fn</text>
      <text x="8" y="30" fill="#10b981" opacity="0.2" fontSize="5" fontFamily="serif">&#x0394;</text>

      {/* Neck */}
      <path
        d="M35 52 L35 58 Q35 60 37 60 L43 60 Q45 60 45 58 L45 52"
        fill="#c8a07e"
      />

      {/* Black turtleneck */}
      <path
        d="M20 80 L20 64 Q20 58 28 56 L34 54 L40 56 L46 54 L52 56 Q60 58 60 64 L60 80 Z"
        fill="#1a1a2e"
      />
      {/* Turtleneck fold / collar — high, covers neck */}
      <path
        d="M33 54 Q33 50 36 50 L44 50 Q47 50 47 54 L46 54 L40 56 L34 54 Z"
        fill="#16162a"
      />
      {/* Turtleneck collar line details */}
      <path
        d="M34 51 Q40 49.5 46 51"
        stroke="#2a2a44"
        strokeWidth="0.6"
        fill="none"
      />
      <path
        d="M34 52.5 Q40 51 46 52.5"
        stroke="#2a2a44"
        strokeWidth="0.5"
        fill="none"
      />

      {/* Subtle shoulder seams */}
      <path
        d="M28 57 L20 64"
        stroke="#2a2a44"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M52 57 L60 64"
        stroke="#2a2a44"
        strokeWidth="0.5"
        fill="none"
      />

      {/* Head — 3/4 view */}
      <ellipse cx="40" cy="36" rx="14" ry="16" fill="#d4a574" />
      {/* Jaw */}
      <path
        d="M28 40 Q30 51 40 52 Q50 51 52 40"
        fill="#d4a574"
      />
      {/* Subtle cheek shadow */}
      <path
        d="M28 40 Q30 48 36 50"
        fill="#c8996a"
        opacity="0.2"
      />

      {/* Ear */}
      <ellipse cx="53" cy="38" rx="2.5" ry="3.5" fill="#c8996a" />

      {/* Earpiece in right ear */}
      <ellipse cx="54" cy="37" rx="2" ry="2.5" fill="#1a1a2e" />
      <ellipse cx="54" cy="37" rx="1.2" ry="1.5" fill="#10b981" opacity="0.4" />
      <circle cx="54" cy="37" r="0.5" fill="#34d399" opacity="0.8" />

      {/* Clean short hair — tight, minimal */}
      <path
        d="M26 32 Q25 22 34 18 Q40 16 46 18 Q55 22 54 32 L52 28 Q50 22 42 20 Q32 21 28 28 Z"
        fill="#1a1a2e"
      />
      {/* Hair is very short on sides — skin shows through */}
      <path
        d="M26 34 Q25 30 26 26 L27 30 Z"
        fill="#2a1f14"
        opacity="0.5"
      />
      <path
        d="M54 34 Q55 30 54 26 L53 30 Z"
        fill="#2a1f14"
        opacity="0.5"
      />
      {/* Top hair texture — very clean */}
      <path
        d="M30 20 Q36 16 46 18 Q42 16 34 17 Z"
        fill="#0f0f1e"
        opacity="0.6"
      />

      {/* Eyes — calm, analytical */}
      {/* Left eye */}
      <ellipse cx="35" cy="37" rx="3.5" ry="2.8" fill="white" />
      <circle cx="36" cy="37" r="2" fill="#1e293b" />
      <circle cx="36.5" cy="36.5" r="0.6" fill="white" />
      {/* Right eye */}
      <ellipse cx="46" cy="37" rx="3" ry="2.8" fill="white" />
      <circle cx="47" cy="37" r="2" fill="#1e293b" />
      <circle cx="47.5" cy="36.5" r="0.6" fill="white" />

      {/* Eyebrows — level, calm, analytical */}
      <path
        d="M31 33 Q35 31.5 39 33"
        stroke="#1a1a2e"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M43 33 Q46 31.5 50 33"
        stroke="#1a1a2e"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <path
        d="M40 38.5 L41 43 L39 44 Q38.5 43.5 39 43"
        stroke="#b8885a"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth — calm, neutral, slight knowing expression */}
      <path
        d="M36 47.5 Q40 49 44 47.5"
        stroke="#a0644a"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Very slight smile hint */}
      <path
        d="M44 47.5 Q44.5 48 44 48.5"
        stroke="#a0644a"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
}
