"use client";

import { useAgentStore } from "../store";

export function AgentList() {
  const { agents, loading } = useAgentStore();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No agents yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first agent to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{agent.name}</h3>
            {agent.description && (
              <p className="text-sm text-muted-foreground">
                {agent.description}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              agent.status === "idle"
                ? "bg-green-500/10 text-green-400"
                : agent.status === "working"
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-zinc-500/10 text-zinc-400"
            }`}
          >
            {agent.status}
          </span>
        </div>
      ))}
    </div>
  );
}
