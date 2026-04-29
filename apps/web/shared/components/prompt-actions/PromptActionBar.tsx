'use client';

import { useState } from 'react';
import { PromptAction } from './prompt-action-data';
import { VariablePicker } from './VariablePicker';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  actions: PromptAction[];
  onSelect: (promptText: string, slug?: string) => void;
}

export function PromptActionBar({ actions, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [pickerAction, setPickerAction] = useState<PromptAction | null>(null);
  const visible = expanded ? actions : actions.slice(0, 4);
  const hasMore = actions.length > 4;

  const handleClick = (action: PromptAction) => {
    if (action.variables.length > 0) {
      setPickerAction(action);
    } else {
      onSelect(action.promptTemplate, action.slug);
    }
  };

  return (
    <>
      <div className="px-4 py-2 border-t border-border">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-muted-foreground shrink-0">⚡</span>
          {visible.map(action => (
            <button
              key={action.id}
              onClick={() => handleClick(action)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-border bg-card hover:bg-card-hover hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <span>{action.icon}</span>
              <span>{action.name}</span>
            </button>
          ))}
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      </div>

      {pickerAction && (
        <VariablePicker
          actionName={pickerAction.name}
          actionIcon={pickerAction.icon}
          variables={pickerAction.variables}
          promptTemplate={pickerAction.promptTemplate}
          onSubmit={(composed) => {
            onSelect(composed, pickerAction.slug);
            setPickerAction(null);
          }}
          onClose={() => setPickerAction(null)}
        />
      )}
    </>
  );
}
