'use client';

import { PromptAction } from './prompt-action-data';
import { motion } from 'framer-motion';

interface Props {
  actions: PromptAction[];
  onSelect: (promptText: string) => void;
}

export function PromptActionGrid({ actions, onSelect }: Props) {
  const trending = actions.filter(a => a.category === 'trending');
  const quick = actions.filter(a => a.category === 'quick');

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto w-full">
      {trending.length > 0 && (
        <div className="w-full mb-8">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <span className="text-base">🔥</span> Trending Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trending.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => onSelect(action.promptText)}
                className="group text-left p-4 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-primary/30 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{action.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {action.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {quick.length > 0 && (
        <div className="w-full">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <span className="text-base">⚡</span> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quick.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (trending.length + i) * 0.05, duration: 0.3 }}
                onClick={() => onSelect(action.promptText)}
                className="group text-left p-3 rounded-lg border border-border bg-card hover:bg-card-hover hover:border-primary/30 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{action.icon}</span>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {action.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">
                    {action.description}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
