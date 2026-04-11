import { RefreshCw, Sun, Search, BarChart3, Zap, Bot } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const AVATAR_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  'RefreshCw': { icon: RefreshCw, color: '#8b5cf6' },
  'Sun': { icon: Sun, color: '#f59e0b' },
  'Search': { icon: Search, color: '#3b82f6' },
  'BarChart3': { icon: BarChart3, color: '#10b981' },
  'Zap': { icon: Zap, color: '#ec4899' },
  'Bot': { icon: Bot, color: '#6366f1' },
};

export function AgentAvatar({ emoji, size = 40 }: { emoji?: string; size?: number }) {
  const config = AVATAR_MAP[emoji || ''] || AVATAR_MAP['Bot'];
  const Icon = config.icon;
  const iconSize = size * 0.45;
  return (
    <div style={{ width: size, height: size, background: config.color + '20', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${config.color}30` }}>
      <Icon style={{ width: iconSize, height: iconSize, color: config.color }} />
    </div>
  );
}
