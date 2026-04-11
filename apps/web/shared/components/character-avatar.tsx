"use client";
import Image from "next/image";

const CHARACTER_IMAGES: Record<string, string> = {
  // Specific characters
  'coach': '/characters/char-coach.png',
  'gambling-guru': '/characters/char-gambling-guru.png',
  'fantasy-manager': '/characters/char-planner.png',
  'sports-journalist': '/characters/char-analyst.png',
  'managing-director': '/characters/char-commander.png',
  'analyst': '/characters/char-analyst.png',
  'quant': '/characters/char-quant.png',
  'trader': '/characters/char-trader.png',
  'chief-of-staff': '/characters/char-commander.png',
  'planner': '/characters/char-planner.png',
  'career-analyst': '/characters/char-analyst.png',
  'networking-growth': '/characters/char-growth-hacker.png',
  'product-chief': '/characters/char-commander.png',
  'cto': '/characters/char-cto.png',
  'growth-hacker': '/characters/char-growth-hacker.png',
  'cfo': '/characters/char-cfo.png',
  'default-lead': '/characters/char-commander.png',
};

interface Props {
  characterId: string;
  size?: number;
  accentColor?: string;
  className?: string;
}

export function CharacterAvatar({ characterId, size = 48, accentColor = '#7c3aed', className = '' }: Props) {
  const src = CHARACTER_IMAGES[characterId] || CHARACTER_IMAGES['default-lead'];
  const glowColor = accentColor + '40'; // 25% opacity
  const hoverGlow = accentColor + '60'; // 37% opacity

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 transition-all duration-200 hover:scale-105 ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 ${size / 4}px ${glowColor}`,
        border: '2px solid rgba(255,255,255,0.1)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 ${size / 3}px ${hoverGlow}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 ${size / 4}px ${glowColor}`; }}
    >
      <Image
        src={src}
        alt={characterId}
        width={size}
        height={size}
        className="rounded-full object-cover"
        priority={size >= 64}
      />
    </div>
  );
}
