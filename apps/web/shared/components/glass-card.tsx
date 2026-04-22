import { CSSProperties, ReactNode } from "react";

export function GlassCard({ children, className = "", hover = true, style }: { children: ReactNode; className?: string; hover?: boolean; style?: CSSProperties }) {
  return (
    <div className={`rounded-xl border border-border bg-card backdrop-blur-xl ${hover ? 'hover:bg-accent hover:border-accent-foreground/10 hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}
