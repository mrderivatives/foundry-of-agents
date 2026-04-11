import { CSSProperties, ReactNode } from "react";

export function GlassCard({ children, className = "", hover = true, style }: { children: ReactNode; className?: string; hover?: boolean; style?: CSSProperties }) {
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl ${hover ? 'hover:bg-white/[0.05] hover:border-white/[0.1] hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}
