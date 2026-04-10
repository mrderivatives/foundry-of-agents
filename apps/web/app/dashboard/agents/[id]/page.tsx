"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/shared/api/client";
import { MemoryBrowser } from "@/features/memory/components/memory-browser";
import type { Agent, ChatSession } from "@/shared/types";

interface AgentSkill {
  agent_id: string;
  skill_id: string;
  enabled: boolean;
  priority: number;
  name: string;
  description: string | null;
  category: string | null;
  is_builtin: boolean;
}

interface Skill {
  id: string;
  name: string;
  description: string | null;
  is_builtin: boolean;
  category: string | null;
}

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"chat" | "memory" | "skills">("chat");
  const [agentSkills, setAgentSkills] = useState<AgentSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [assigningSkill, setAssigningSkill] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/auth/login");
      return;
    }

    Promise.all([
      api.get<Agent>(`/api/agents/${agentId}`),
      api.get<ChatSession[]>(`/api/agents/${agentId}/sessions`),
      api.get<AgentSkill[]>(`/api/agents/${agentId}/skills`),
      api.get<Skill[]>(`/api/skills`),
    ])
      .then(([a, s, as, sk]) => {
        setAgent(a);
        setSessions(s);
        setAgentSkills(as);
        setAllSkills(sk);
      })
      .catch(() => router.replace("/dashboard"))
      .finally(() => setLoading(false));
  }, [agentId, router]);

  const handleAssignSkill = async (skillId: string) => {
    setAssigningSkill(true);
    try {
      await api.post(`/api/agents/${agentId}/skills`, { skill_id: skillId });
      const updated = await api.get<AgentSkill[]>(`/api/agents/${agentId}/skills`);
      setAgentSkills(updated);
    } catch {
      // ignore
    } finally {
      setAssigningSkill(false);
    }
  };

  const handleUnassignSkill = async (skillId: string) => {
    try {
      await api.delete(`/api/agents/${agentId}/skills/${skillId}`);
      setAgentSkills((prev) => prev.filter((s) => s.skill_id !== skillId));
    } catch {
      // ignore
    }
  };

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
          <button
            onClick={() => setTab("skills")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "skills"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Skills
          </button>
        </div>

        {tab === "memory" && <MemoryBrowser agentId={agentId} />}

        {tab === "skills" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Assigned Skills</h3>
              {agentSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills assigned.</p>
              ) : (
                <div className="space-y-2">
                  {agentSkills.map((s) => (
                    <div
                      key={s.skill_id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{s.name}</span>
                        {s.is_builtin && (
                          <span className="rounded-full bg-violet-500/10 text-violet-400 px-2 py-0.5 text-xs">
                            built-in
                          </span>
                        )}
                        {s.category && (
                          <span className="rounded-full bg-gray-500/10 text-gray-400 px-2 py-0.5 text-xs">
                            {s.category}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnassignSkill(s.skill_id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Available Skills</h3>
              <div className="space-y-2">
                {allSkills
                  .filter((s) => !agentSkills.some((as) => as.skill_id === s.id))
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                    >
                      <div>
                        <span className="text-sm font-medium">{s.name}</span>
                        {s.description && (
                          <span className="text-xs text-muted-foreground ml-2">{s.description}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAssignSkill(s.id)}
                        disabled={assigningSkill}
                        className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

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
