"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { api } from "@/shared/api/client";
import { MemoryBrowser } from "@/features/memory/components/memory-browser";
import { ChatPage } from "@/features/chat/components/chat-page";
import {
  MessageSquare,
  Brain,
  Puzzle,
  Clock,
  Plus,
} from "lucide-react";
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

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  last_run_at?: string;
  next_run_at?: string;
}

type Tab = "chat" | "memory" | "skills" | "schedule";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "skills", label: "Skills", icon: Puzzle },
  { id: "schedule", label: "Schedule", icon: Clock },
];

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const agentId = params.id as string;
  const tabParam = searchParams.get("tab") as Tab | null;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>(tabParam && TABS.some(t => t.id === tabParam) ? tabParam : "chat");
  const [agentSkills, setAgentSkills] = useState<AgentSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [assigningSkill, setAssigningSkill] = useState(false);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Agent>(`/api/agents/${agentId}`),
      api.get<AgentSkill[]>(`/api/agents/${agentId}/skills`),
      api.get<Skill[]>(`/api/skills`),
      api.get<CronJob[]>(`/api/agents/${agentId}/cron-jobs`).catch(() => []),
    ])
      .then(([a, as2, sk, cj]) => {
        setAgent(a);
        setAgentSkills(as2);
        setAllSkills(sk);
        setCronJobs(cj as CronJob[]);
      })
      .catch(() => router.replace("/dashboard"))
      .finally(() => setLoading(false));
  }, [agentId, router]);

  const ensureChatSession = useCallback(async () => {
    if (chatSessionId) return;
    try {
      // Try to get existing sessions first
      const sessions = await api.get<ChatSession[]>(`/api/agents/${agentId}/sessions`);
      if (sessions.length > 0) {
        setChatSessionId(sessions[0].id);
      } else {
        const session = await api.post<ChatSession>(`/api/agents/${agentId}/sessions`);
        setChatSessionId(session.id);
      }
    } catch {
      // ignore
    }
  }, [agentId, chatSessionId]);

  useEffect(() => {
    if (tab === "chat") {
      ensureChatSession();
    }
  }, [tab, ensureChatSession]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    window.history.replaceState({}, "", url.toString());
  };

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
    try {
      const session = await api.post<ChatSession>(`/api/agents/${agentId}/sessions`);
      setChatSessionId(session.id);
    } catch {
      // ignore
    }
  };

  if (loading || !agent) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Agent Header */}
      <div className="border-b border-border px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold">{agent.name}</h1>
              {agent.description && (
                <p className="text-xs text-muted-foreground">{agent.description}</p>
              )}
            </div>
            <span
              className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                agent.status === "idle"
                  ? "bg-green-500/10 text-green-400"
                  : agent.status === "working"
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-zinc-500/10 text-zinc-400"
              }`}
            >
              {agent.status}
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {agent.model || "claude-sonnet-4-6"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "chat" && (
          chatSessionId ? (
            <ChatPage
              agentId={agentId}
              sessionId={chatSessionId}
              agentName={agent.name}
              agentModel={agent.model}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-1">No chat sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a conversation with {agent.name}
              </p>
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
          )
        )}

        {tab === "memory" && (
          <div className="p-6 overflow-y-auto h-full">
            <MemoryBrowser agentId={agentId} />
          </div>
        )}

        {tab === "skills" && (
          <div className="p-6 overflow-y-auto h-full space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Assigned Skills</h3>
              {agentSkills.length === 0 ? (
                <div className="rounded-xl border border-border bg-card/50 p-6 text-center">
                  <Puzzle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No skills assigned. Add skills below.
                  </p>
                </div>
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
              <h3 className="text-sm font-semibold mb-3">Available Skills</h3>
              <div className="space-y-2">
                {allSkills
                  .filter((s) => !agentSkills.some((as2) => as2.skill_id === s.id))
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                    >
                      <div>
                        <span className="text-sm font-medium">{s.name}</span>
                        {s.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {s.description}
                          </span>
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

        {tab === "schedule" && (
          <div className="p-6 overflow-y-auto h-full">
            {cronJobs.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No scheduled tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Cron jobs for this agent will appear here. Coming soon.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cronJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{job.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {job.schedule}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          job.enabled
                            ? "bg-green-500/10 text-green-400"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {job.enabled ? "Active" : "Paused"}
                      </span>
                    </div>
                    {job.next_run_at && (
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Next run: {new Date(job.next_run_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
