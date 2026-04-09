"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/shared/api/client";

interface Memory {
  id: string;
  content: string;
  memory_type: string;
  importance_score: number;
  source_type?: string;
  tags?: string[];
  created_at: string;
}

interface Props {
  agentId: string;
}

const TYPE_COLORS: Record<string, string> = {
  semantic: "bg-blue-500/10 text-blue-400",
  episodic: "bg-green-500/10 text-green-400",
  entity: "bg-purple-500/10 text-purple-400",
  identity: "bg-amber-500/10 text-amber-400",
  user_context: "bg-pink-500/10 text-pink-400",
};

export function MemoryBrowser({ agentId }: Props) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("semantic");
  const [adding, setAdding] = useState(false);

  const fetchMemories = useCallback(async () => {
    try {
      const url = filter
        ? `/api/agents/${agentId}/memory?type=${filter}`
        : `/api/agents/${agentId}/memory`;
      const data = await api.get<Memory[]>(url);
      setMemories(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [agentId, filter]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    setAdding(true);
    try {
      await api.post(`/api/agents/${agentId}/memory`, {
        content: newContent,
        memory_type: newType,
      });
      setNewContent("");
      setShowAdd(false);
      fetchMemories();
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (memId: string) => {
    try {
      await api.delete(`/api/agents/${agentId}/memory/${memId}`);
      setMemories((prev) => prev.filter((m) => m.id !== memId));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["", "semantic", "episodic", "entity", "user_context"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t || "All"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + Add Memory
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            placeholder="Enter a fact to remember..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex items-center justify-between">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="semantic">Semantic</option>
              <option value="identity">Identity</option>
              <option value="user_context">User Context</option>
              <option value="entity">Entity</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent/50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || !newContent.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {adding ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {memories.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No memories yet. Chat with the agent or add memories manually.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="group rounded-lg border border-border bg-card p-3 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        TYPE_COLORS[mem.memory_type] || "bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {mem.memory_type}
                    </span>
                    {mem.source_type && (
                      <span className="text-[10px] text-muted-foreground">
                        via {mem.source_type}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{mem.content}</p>
                  {mem.tags && mem.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {mem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all text-xs"
                  title="Delete memory"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
