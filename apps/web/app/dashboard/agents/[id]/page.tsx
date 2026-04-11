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
  Wallet,
  Copy,
  Snowflake,
  Play,
  Coins,
  RefreshCw,
  ClipboardCopy,
} from "lucide-react";
import type { Agent, ChatSession, WalletInfo, WalletPolicy, WalletTransaction } from "@/shared/types";
import { AgentAvatar } from "@/shared/components/agent-avatar";

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
  name: string | null;
  description: string | null;
  cron_expression: string;
  prompt: string;
  output_channel: string | null;
  output_target: string | null;
  enabled: boolean;
  last_run_at?: string;
  last_run_status?: string;
  next_run_at?: string;
  created_at: string;
}

type Tab = "chat" | "memory" | "skills" | "schedule" | "wallet";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "skills", label: "Skills", icon: Puzzle },
  { id: "schedule", label: "Schedule", icon: Clock },
  { id: "wallet", label: "Wallet", icon: Wallet },
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
  const [showCreateCron, setShowCreateCron] = useState(false);
  const [cronForm, setCronForm] = useState({ name: "", cron_expression: "0 9 * * *", prompt: "", output_channel: "none", output_target: "" });
  const [creatingCron, setCreatingCron] = useState(false);
  const [walletData, setWalletData] = useState<{ wallet: WalletInfo; policy: WalletPolicy } | null>(null);
  const [walletBalance, setWalletBalance] = useState<{ sol: { amount: string; usd_value: string }; usdc: { amount: string; usd_value: string }; total_usd: string } | null>(null);
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const data = await api.get<{ wallet: WalletInfo; policy: WalletPolicy }>(`/api/agents/${agentId}/wallet`);
      setWalletData(data);
      const txs = await api.get<WalletTransaction[]>(`/api/agents/${agentId}/wallet/transactions`);
      setWalletTxs(txs);
      // Fetch real on-chain balances
      try {
        const bal = await api.get<{ sol: { amount: string; usd_value: string }; usdc: { amount: string; usd_value: string }; total_usd: string }>(`/api/agents/${agentId}/wallet/balance`);
        setWalletBalance(bal);
      } catch { setWalletBalance(null); }
    } catch {
      setWalletData(null);
      setWalletTxs([]);
      setWalletBalance(null);
    } finally {
      setWalletLoading(false);
    }
  }, [agentId]);

  // Load wallet on mount (for banner) and when wallet tab is selected
  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const [walletError, setWalletError] = useState<string | null>(null);
  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    setWalletError(null);
    try {
      await api.post(`/api/agents/${agentId}/wallet`);
      await loadWallet();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create wallet";
      setWalletError(msg);
    } finally {
      setCreatingWallet(false);
    }
  };

  const handleFreezeWallet = async () => {
    try {
      await api.post(`/api/agents/${agentId}/wallet/freeze`);
      await loadWallet();
    } catch { /* ignore */ }
  };

  const handleUnfreezeWallet = async () => {
    try {
      await api.post(`/api/agents/${agentId}/wallet/unfreeze`);
      await loadWallet();
    } catch { /* ignore */ }
  };

  const handleCopyAddress = () => {
    if (walletData?.wallet.public_key) {
      navigator.clipboard.writeText(walletData.wallet.public_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const handleCreateCron = async () => {
    setCreatingCron(true);
    try {
      const cj = await api.post<CronJob>(`/api/agents/${agentId}/cron-jobs`, {
        name: cronForm.name || undefined,
        cron_expression: cronForm.cron_expression,
        prompt: cronForm.prompt,
        output_channel: cronForm.output_channel === "none" ? undefined : cronForm.output_channel,
        output_target: cronForm.output_target || undefined,
      });
      setCronJobs((prev) => [cj, ...prev]);
      setShowCreateCron(false);
      setCronForm({ name: "", cron_expression: "0 9 * * *", prompt: "", output_channel: "none", output_target: "" });
    } catch { /* ignore */ } finally {
      setCreatingCron(false);
    }
  };

  const handleToggleCron = async (cronId: string, enabled: boolean) => {
    try {
      const updated = await api.patch<CronJob>(`/api/cron-jobs/${cronId}`, { enabled });
      setCronJobs((prev) => prev.map((j) => j.id === cronId ? updated : j));
    } catch { /* ignore */ }
  };

  const handleDeleteCron = async (cronId: string) => {
    try {
      await api.delete(`/api/cron-jobs/${cronId}`);
      setCronJobs((prev) => prev.filter((j) => j.id !== cronId));
    } catch { /* ignore */ }
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
            <AgentAvatar emoji={agent.avatar_url} size={40} />
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

        {/* Wallet Banner */}
        {walletData ? (
          <div className="rounded-lg border border-border bg-card/50 p-3 sm:p-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <code className="text-xs font-mono text-muted-foreground">
                  {walletData.wallet.public_key.slice(0, 6)}...{walletData.wallet.public_key.slice(-4)}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(walletData.wallet.public_key); }}
                  className="text-muted-foreground hover:text-foreground text-xs"
                  title="Copy address"
                ><ClipboardCopy className="w-3 h-3" /></button>
                <a
                  href={`https://solscan.io/account/${walletData.wallet.public_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary text-xs"
                >↗ Solscan</a>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">SOL: <span className="text-foreground font-medium">{walletBalance?.sol.amount ?? '...'}</span></span>
                <span className="text-muted-foreground">USDC: <span className="text-foreground font-medium">{walletBalance?.usdc.amount ?? '...'}</span></span>
                {walletBalance && <span className="text-muted-foreground">≈ ${walletBalance.total_usd}</span>}
                <button onClick={loadWallet} className="text-muted-foreground hover:text-primary" title="Refresh"><RefreshCw className="w-3 h-3" /></button>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  walletData.wallet.status === 'active' ? 'bg-green-500/10 text-green-400' :
                  walletData.wallet.status === 'frozen' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-500/10 text-zinc-400'
                }`}>{walletData.wallet.status}</span>
              </div>
            </div>
            {walletData.policy && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Daily: $0 / ${walletData.policy.daily_limit_usd}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full max-w-[120px]">
                  <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            )}
          </div>
        ) : !walletLoading ? (
          <div className="mb-4 space-y-2">
            <button
              onClick={handleCreateWallet}
              disabled={creatingWallet}
              className="rounded-lg border border-dashed border-border px-4 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {creatingWallet ? 'Creating...' : 'Enable Wallet for this Agent'}
            </button>
            {walletError && (
              <p className="text-xs text-red-400">{walletError}</p>
            )}
          </div>
        ) : null}

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
                  agentEmoji={agent.avatar_url}
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
          <div className="p-4 sm:p-6 overflow-y-auto h-full space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Scheduled Tasks</h3>
              <button
                onClick={() => setShowCreateCron(!showCreateCron)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Create Cron Job
              </button>
            </div>

            {showCreateCron && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <input
                  value={cronForm.name}
                  onChange={(e) => setCronForm({ ...cronForm, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Job name (optional)"
                />
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Cron Expression</label>
                  <select
                    value={cronForm.cron_expression}
                    onChange={(e) => setCronForm({ ...cronForm, cron_expression: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="0 9 * * *">Every day at 9:00 UTC</option>
                    <option value="30 11 * * *">Every day at 11:30 UTC</option>
                    <option value="0 */6 * * *">Every 6 hours</option>
                    <option value="0 * * * *">Every hour</option>
                    <option value="*/30 * * * *">Every 30 minutes</option>
                    <option value="0 9 * * 1">Every Monday at 9:00 UTC</option>
                  </select>
                </div>
                <textarea
                  value={cronForm.prompt}
                  onChange={(e) => setCronForm({ ...cronForm, prompt: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Prompt for the agent to execute..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Output Channel</label>
                    <select
                      value={cronForm.output_channel}
                      onChange={(e) => setCronForm({ ...cronForm, output_channel: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="none">None</option>
                      <option value="telegram">Telegram</option>
                    </select>
                  </div>
                  {cronForm.output_channel === "telegram" && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Chat ID</label>
                      <input
                        value={cronForm.output_target}
                        onChange={(e) => setCronForm({ ...cronForm, output_target: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Telegram chat ID"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowCreateCron(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCron}
                    disabled={creatingCron || !cronForm.prompt.trim() || !cronForm.cron_expression}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {creatingCron ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            )}

            {cronJobs.length === 0 && !showCreateCron ? (
              <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No scheduled tasks yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create one to automate your agent.
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
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium">{job.name || "Untitled Job"}</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {job.cron_expression}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleCron(job.id, !job.enabled)}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                            job.enabled
                              ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              : "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20"
                          }`}
                        >
                          {job.enabled ? "Active" : "Paused"}
                        </button>
                        <button
                          onClick={() => handleDeleteCron(job.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {job.last_run_at && (
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-[10px] text-muted-foreground">
                          Last run: {new Date(job.last_run_at).toLocaleString()}
                        </p>
                        {job.last_run_status && (
                          <span className={`text-[10px] ${job.last_run_status === "completed" ? "text-green-400" : "text-red-400"}`}>
                            ({job.last_run_status})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "wallet" && (
          <div className="p-4 sm:p-6 overflow-y-auto h-full space-y-6">
            {walletLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !walletData ? (
              <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
                <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-1">No wallet yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a custodial Solana wallet for this agent to enable on-chain actions.
                </p>
                <button
                  onClick={handleCreateWallet}
                  disabled={creatingWallet}
                  className="flex items-center gap-2 mx-auto rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {creatingWallet ? "Creating..." : "Create Wallet"}
                </button>
              </div>
            ) : (
              <>
                {/* Wallet Info */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Wallet</h3>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        walletData.wallet.status === "active"
                          ? "bg-green-500/10 text-green-400"
                          : walletData.wallet.status === "frozen"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-red-500/10 text-red-400"
                      }`}>
                        {walletData.wallet.status}
                      </span>
                      {walletData.wallet.status === "active" ? (
                        <button
                          onClick={handleFreezeWallet}
                          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
                        >
                          <Snowflake className="w-3 h-3" />
                          Freeze
                        </button>
                      ) : walletData.wallet.status === "frozen" ? (
                        <button
                          onClick={handleUnfreezeWallet}
                          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-green-400 hover:bg-accent/50 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          Unfreeze
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Public Key</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-secondary rounded px-2 py-1 break-all flex-1">
                        {walletData.wallet.public_key}
                      </code>
                      <button
                        onClick={handleCopyAddress}
                        className="shrink-0 rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy address"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copied && <span className="text-xs text-green-400">Copied!</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Chain</p>
                      <p className="font-medium capitalize">{walletData.wallet.chain}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{walletData.wallet.wallet_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(walletData.wallet.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Policy */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Policy</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Daily Limit</p>
                      <p className="font-medium">${walletData.policy.daily_limit_usd}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Per-TX Limit</p>
                      <p className="font-medium">${walletData.policy.per_tx_limit_usd}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max TX/Hour</p>
                      <p className="font-medium">{walletData.policy.anomaly_max_tx_per_hour}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Allowed Tokens</p>
                      <p className="font-medium">{walletData.policy.allowed_tokens?.join(", ") || "Any"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Auto-Freeze</p>
                      <p className="font-medium">{walletData.policy.auto_freeze_on_anomaly ? "Enabled" : "Disabled"}</p>
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Transaction History</h3>
                  {walletTxs.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No transactions yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left py-2 pr-3">Time</th>
                            <th className="text-left py-2 pr-3">Action</th>
                            <th className="text-left py-2 pr-3">Input</th>
                            <th className="text-left py-2 pr-3">Output</th>
                            <th className="text-left py-2 pr-3">Status</th>
                            <th className="text-left py-2">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {walletTxs.map((tx) => (
                            <tr key={tx.id} className="border-b border-border/50">
                              <td className="py-2 pr-3 whitespace-nowrap">
                                {new Date(tx.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </td>
                              <td className="py-2 pr-3 capitalize">{tx.action}</td>
                              <td className="py-2 pr-3">
                                {tx.input_amount && tx.input_token ? `${tx.input_amount} ${tx.input_token}` : "-"}
                              </td>
                              <td className="py-2 pr-3">
                                {tx.output_amount && tx.output_token ? `${tx.output_amount} ${tx.output_token}` : "-"}
                              </td>
                              <td className="py-2 pr-3">
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                  tx.status === "approved" || tx.status === "executed"
                                    ? "bg-green-500/10 text-green-400"
                                    : tx.status === "blocked"
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-yellow-500/10 text-yellow-400"
                                }`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="py-2 text-muted-foreground truncate max-w-[200px]">
                                {tx.blocked_reason || (tx.input_value_usd ? `$${tx.input_value_usd}` : "-")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
