const AVATAR_MAP: Record<string, string> = {
  '🔄': '#8b5cf6', '🌅': '#f59e0b', '🔍': '#3b82f6',
  '📊': '#10b981', '🌾': '#84cc16', '⚡': '#ec4899', '🤖': '#6366f1',
};

export function AgentAvatar({ emoji, size = 40 }: { emoji?: string; size?: number }) {
  const e = emoji || '🤖';
  const bg = AVATAR_MAP[e] || '#6366f1';
  return (
    <div style={{ width: size, height: size, background: bg + '20', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, flexShrink: 0 }}>
      {e}
    </div>
  );
}
