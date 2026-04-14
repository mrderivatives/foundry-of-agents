import { Trophy, TrendingUp, Briefcase, Rocket, Zap, Bitcoin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TEAM_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  'crypto': { icon: Bitcoin, color: '#f59e0b' },
  'markets-finance': { icon: TrendingUp, color: '#10b981' },
  'market-research': { icon: TrendingUp, color: '#10b981' }, // legacy
  'predictions-sports': { icon: Trophy, color: '#f59e0b' },
  'sports': { icon: Trophy, color: '#f59e0b' }, // legacy
  'career-pro': { icon: Briefcase, color: '#3b82f6' },
  'career-bro': { icon: Briefcase, color: '#3b82f6' }, // legacy
  'product-business': { icon: Rocket, color: '#8b5cf6' },
  'custom': { icon: Zap, color: '#ec4899' },
};

export function TeamIcon({ teamId, size = 'md' }: { teamId: string; size?: 'sm' | 'md' | 'lg' }) {
  const config = TEAM_ICONS[teamId] || TEAM_ICONS['custom'];
  const Icon = config.icon;
  const sizeMap = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  const iconSize = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className={`${sizeMap[size]} rounded-lg flex items-center justify-center`}
         style={{ background: config.color + '15', border: `1px solid ${config.color}30` }}>
      <Icon className={iconSize[size]} style={{ color: config.color }} />
    </div>
  );
}
