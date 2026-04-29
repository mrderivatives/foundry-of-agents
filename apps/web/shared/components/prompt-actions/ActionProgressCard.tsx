'use client';

import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  step: number;
  total: number;
  label: string;
}

export function ActionProgressCard({ step, total, label }: Props) {
  const progress = (step / total) * 100;
  const isComplete = step >= total;

  return (
    <div className="rounded-xl border border-border bg-card p-4 max-w-md mb-2">
      <div className="flex items-center gap-3 mb-3">
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        )}
        <span className="text-sm font-medium text-foreground">
          Step {step} of {total}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
