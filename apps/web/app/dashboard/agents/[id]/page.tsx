"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/shared/api/client";
import { MemoryBrowser } from "@/features/memory/components/memory-browser";
import type { Agent, ChatSession } from "@/shared/types";

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"chat" | "memory">("chat");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/auth/login");
      return;
    }

    Promise.all([
      api.get<Agent>(`/api/agents/${agentId}`),
      api.get<ChatSession[]>(`/api/agents/${agentId}/sessions`),
    ])
      .then(([a, s]) => {
        setAgent(a);
        setSessions(s);
      })
      .catch(() => router.replace("/dashboard"))
      .finally(() => setLoading(false));
  }, [agentId, router]);

  const handleNewChat = async () => {
    const session = await api.post<ChatSession>(
      `/api/agents/${agentId}/sessions`
    );
    router.push(`/dashboard/agents/${agentId}/chat/${session.id}`);
  };

  if (loading || !agent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back
          </button>
          <h1 className="text-xl font-bold">{agent.name}</h1>
        </div>
        <button
          onClick={handleNewChat}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New Chat
        </button>
      </header>
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-2">Details</h2>
          {agent.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {agent.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Model: {agent.model || "claude-sonnet-4-6"} | Status: {agent.status}
          </p>
        </div>

        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setTab("chat")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "chat"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Chat Sessions
          </button>
          <button
            onClick={() => setTab("memory")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "memory"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Memory
          </button>
        </div>

        {tab === "memory" && <MemoryBrowser agentId={agentId} />}

        {tab === "chat" && <div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sessions yet. Start a new chat!
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/agents/${agentId}/chat/${s.id}`
                    )
                  }
                  className="w-full text-left rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <p className="text-sm font-medium">
                    {s.title || `Session ${s.id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>}
      </main>
    </div>
  );
}
