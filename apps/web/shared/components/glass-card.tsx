import { ReactNode } from "react";

export function GlassCard({ children, className = "", hover = true }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl ${hover ? 'hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
}
