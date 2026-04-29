'use client';

import { motion } from 'framer-motion';
import { Loader2, Search, Brain, FileText } from 'lucide-react';

interface Props {
  toolStatus: { tool: string; query: string; done: boolean } | null;
  actionProgress: { step: number; total: number; label: string } | null;
  actionSlug: string | null;
  elapsedSeconds: number;
}

export function WorkingCard({ toolStatus, actionProgress, actionSlug, elapsedSeconds }: Props) {
  const getStatusText = () => {
    if (toolStatus && !toolStatus.done) {
      if (toolStatus.tool === 'web_search') return `Searching: "${toolStatus.query}"`;
      if (toolStatus.tool === 'dispatch_specialist') return `Dispatching specialist...`;
      return `Using ${toolStatus.tool}...`;
    }
    if (toolStatus?.done) return `Search complete`;
    if (actionProgress) return actionProgress.label;
    if (elapsedSeconds < 3) return 'Thinking...';
    if (elapsedSeconds < 10) return 'Analyzing your request...';
    if (elapsedSeconds < 30) return 'Researching and gathering data...';
    return 'Working on a detailed response...';
  };

  const getActionLabel = () => {
    if (!actionSlug) return 'Processing';
    const labels: Record<string, string> = {
      'crypto-deep-dive': 'Deep Dive Report',
      'crypto-daily-briefing': 'Daily Briefing',
      'crypto-compare': 'Token Comparison',
      'crypto-swap': 'Swap',
      'crypto-portfolio': 'Portfolio Check',
      'crypto-market-pulse': 'Market Pulse',
      'crypto-price-alert': 'Price Alert',
      'research-company': 'Company Brief',
      'research-person': 'Person Brief',
      'research-competitive': 'Competitive Analysis',
      'research-news': 'News Digest',
    };
    return labels[actionSlug] || 'Processing';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4 max-w-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {toolStatus && !toolStatus.done ? (
            <Search className="w-4 h-4 text-primary animate-pulse" />
          ) : actionProgress ? (
            <FileText className="w-4 h-4 text-primary" />
          ) : (
            <Brain className="w-4 h-4 text-primary animate-pulse" />
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{getActionLabel()}</div>
          <div className="text-xs text-muted-foreground">{Math.floor(elapsedSeconds)}s elapsed</div>
        </div>
      </div>

      {/* Progress bar */}
      {actionProgress && (
        <div className="mb-2">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(actionProgress.step / actionProgress.total) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">Step {actionProgress.step}/{actionProgress.total}</div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>{getStatusText()}</span>
      </div>
    </motion.div>
  );
}
