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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showAddSkill, setShowAddSkill] = useState(false);

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

  const loadSessions = useCallback(async () => {
    try {
      const list = await api.get<ChatSession[]>(`/api/agents/${agentId}/sessions`);
      setSessions(list);
      if (list.length > 0 && !chatSessionId) {
        setChatSessionId(list[0].id);
      } else if (list.length === 0) {
        const session = await api.post<ChatSession>(`/api/agents/${agentId}/sessions`);
        setSessions([session]);
        setChatSessionId(session.id);
      }
    } catch {
      // ignore
    }
  }, [agentId, chatSessionId]);

  useEffect(() => {
    if (tab === "chat") {
      loadSessions();
    }
  }, [tab, loadSessions]);

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
      setSessions((prev) => [session, ...prev]);
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
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate">{agent.name}</h1>
              {agent.description && (
                <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
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
            <span className="hidden sm:inline rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {agent.model || "claude-sonnet-4-6"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
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
          <div className="flex h-full">
            {/* Sessions sidebar — hidden on mobile, shown on md+ */}
            {sessions.length > 0 && (
              <div className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card/50">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessions</span>
                  <button
                    onClick={handleNewChat}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    title="New Session"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-1">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setChatSessionId(s.id)}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        chatSessionId === s.id
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      <p className="font-medium truncate">
                        {s.title || `Session ${s.id.slice(0, 8)}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(s.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Chat area */}
            <div className="flex-1 min-w-0">
              {/* Mobile session selector */}
              {sessions.length > 1 && (
                <div className="md:hidden border-b border-border px-3 py-2 flex items-center gap-2">
                  <select
                    value={chatSessionId || ""}
                    onChange={(e) => setChatSessionId(e.target.value)}
                    className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title || `Session ${s.id.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleNewChat}
                    className="shrink-0 rounded-lg bg-primary p-1.5 text-primary-foreground"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {chatSessionId ? (
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
              )}
            </div>
          </div>
        )}

        {tab === "memory" && (
          <div className="p-6 overflow-y-auto h-full">
            <MemoryBrowser agentId={agentId} />
          </div>
        )}

        {tab === "skills" && (
          <div className="p-4 sm:p-6 overflow-y-auto h-full space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Assigned Skills</h3>
                <button
                  onClick={() => setShowAddSkill(!showAddSkill)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Skill
                </button>
              </div>
              {agentSkills.length === 0 ? (
                <div className="rounded-xl border border-border bg-card/50 p-6 text-center">
                  <Puzzle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No skills assigned yet. Click &quot;Add Skill&quot; to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agentSkills.map((s) => (
                    <div
                      key={s.skill_id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
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
                        className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showAddSkill && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Available Skills</h3>
                {allSkills.filter((s) => !agentSkills.some((as2) => as2.skill_id === s.id)).length === 0 ? (
                  <p className="text-sm text-muted-foreground">All skills are already assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {allSkills
                      .filter((s) => !agentSkills.some((as2) => as2.skill_id === s.id))
                      .map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                        >
                          <div className="min-w-0">
                            <span className="text-sm font-medium">{s.name}</span>
                            {s.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {s.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleAssignSkill(s.id)}
                            disabled={assigningSkill}
                            className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0 ml-3"
                          >
                            Assign
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
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
