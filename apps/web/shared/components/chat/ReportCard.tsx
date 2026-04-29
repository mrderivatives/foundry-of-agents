'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  content: string;
  title?: string;
  timestamp: string;
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  if (match) return match[1].trim();
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length < 80) return firstLine.replace(/^[#*]+\s*/, '');
  return 'Report';
}

function getPreview(content: string): string {
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  return lines.slice(0, 3).join('\n');
}

function isReport(content: string): boolean {
  if (content.length < 500) return false;
  const hasHeaders = /^#{1,3}\s/m.test(content);
  const hasBullets = /^[-*]\s/m.test(content);
  const hasSections = (content.match(/^#{1,3}\s/gm) || []).length >= 2;
  return hasHeaders && (hasBullets || hasSections);
}

export { isReport };

export function ReportCard({ content, title, timestamp }: Props) {
  const [expanded, setExpanded] = useState(false);
  const resolvedTitle = title || extractTitle(content);
  const preview = getPreview(content);
  const date = new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden max-w-2xl">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{resolvedTitle}</div>
            <div className="text-xs text-muted-foreground">Generated {date}</div>
          </div>
        </div>
      </div>

      {/* Preview or Full Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:bg-background [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_table]:text-xs"
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground leading-relaxed line-clamp-3"
            >
              {preview}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-card-hover text-foreground transition-all duration-200"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Read Full Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
