'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Variable {
  name: string;
  type: string;
  label: string;
  suggestions?: string[];
  placeholder?: string;
}

interface Props {
  actionName: string;
  actionIcon: LucideIcon;
  variables: Variable[];
  promptTemplate: string;
  onSubmit: (composedPrompt: string) => void;
  onClose: () => void;
}

export function VariablePicker({ actionName, actionIcon: ActionIcon, variables, promptTemplate, onSubmit, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initial: Record<string, string> = {};
    variables.forEach(v => {
      initial[v.name] = v.suggestions?.[0] || '';
    });
    setValues(initial);
  }, [variables]);

  const handleSubmit = () => {
    setSubmitting(true);
    let prompt = promptTemplate;
    Object.entries(values).forEach(([key, val]) => {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), val || key);
    });
    onSubmit(prompt);
  };

  const allFilled = variables.every(v => values[v.name]?.trim());

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-background p-6 shadow-xl"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ActionIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{actionName}</h3>
          </div>

          <div className="space-y-4">
            {variables.map((variable, idx) => (
              <div key={variable.name}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{variable.label}</label>
                <input
                  type="text"
                  value={values[variable.name] || ''}
                  onChange={e => setValues(prev => ({ ...prev, [variable.name]: e.target.value }))}
                  placeholder={variable.placeholder}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  autoFocus={idx === 0}
                  onKeyDown={e => { if (e.key === 'Enter' && allFilled) handleSubmit(); }}
                />
                {variable.suggestions && variable.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {variable.suggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setValues(prev => ({ ...prev, [variable.name]: suggestion }))}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-all duration-150 ${
                          values[variable.name] === suggestion
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!allFilled || submitting}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
