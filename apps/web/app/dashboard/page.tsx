"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, MessageSquare } from "lucide-react";
import Image from "next/image";
import { CharacterAvatar } from "@/shared/components/characters";
import { TeamIcon } from "@/shared/components/team-icon";
import { useAgentStore } from "@/features/agents/store";
import { AgentList } from "@/features/agents/components/agent-list";
import { CreateAgentDialog } from "@/features/agents/components/create-agent-dialog";
import { api } from "@/shared/api/client";

interface TeamData {
  templateId: string;
  teamName: string;
  emoji: string;
  accentColor: string;
  leadAgentId?: string;
  lead: {
    name: string;
    role: string;
    characterId: string;
    tagline: string;
  };
  specialists: {
    id: string;
    name: string;
    role: string;
    characterId: string;
    tagline: string;
    description: string;
  }[];
}

type AgentStatus = "idle" | "working" | "offline";

interface ActivityEvent {
  id: string;
  type: string;
  agent_id: string;
  agent_name: string;
  avatar_url: string;
  content: string;
  created_at: string;
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: "#22c55e",
  working: "#3b82f6",
  offline: "#52525b",
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime() || now;
  const diff = Math.floor((now - then) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.04] rounded-lg ${className}`} />;
}

function OrgChartSidebar({
  team,
  statuses,
}: {
  team: TeamData;
  statuses: Record<string, AgentStatus>;
}) {
  return (
    <div className="w-60 shrink-0 border-r border-white/[0.04] flex flex-col h-full overflow-y-auto" style={{ background: "#09090b" }}>
      {/* Team header */}
      <div className="px-4 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <TeamIcon teamId={team.templateId} size="sm" />
          <span className="text-sm font-medium text-[#fafafa]">{team.teamName}</span>
        </div>
      </div>

      {/* Lead */}
      <div className="px-3 pt-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-all duration-200 cursor-pointer">
          <div className="relative">
            <CharacterAvatar
              characterId={team.lead.characterId}
              size={32}
              accentColor={team.accentColor}
            />
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2"
              style={{
                borderColor: "#09090b",
                backgroundColor: STATUS_COLORS[statuses["lead"] ?? "idle"],
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#fafafa] truncate">
              {team.lead.name}
            </p>
            <p className="text-xs text-[#71717a]">{team.lead.role}</p>
          </div>
        </div>

        {/* Connection line */}
        <div className="flex justify-center">
          <div className="w-px h-3 bg-white/[0.04]" />
        </div>

        {/* Specialists */}
        <div className="space-y-0.5">
          {team.specialists.map((spec) => {
            const status = statuses[spec.id] ?? "idle";

            return (
              <div
                key={spec.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-all duration-200 cursor-pointer"
              >
                <div className="relative">
                  <CharacterAvatar
                    characterId={spec.characterId}
                    size={32}
                    accentColor={team.accentColor}
                  />
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2"
                    style={{
                      borderColor: "#09090b",
                      backgroundColor: STATUS_COLORS[status],
                    }}
                    animate={
                      status === "working"
                        ? { opacity: [0.7, 1, 0.7] }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#fafafa] truncate">
                    {spec.name}
                  </p>
                  <p className="text-xs text-[#71717a]">{spec.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const borderColor =
    event.type === "memory" ? "#22c55e40" :
    event.type === "chat" ? "#3b82f640" :
    "#71717a40";

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]" style={{ borderLeftColor: borderColor, borderLeftWidth: 2 }}>
      {event.avatar_url ? (
        <Image src={event.avatar_url} width={24} height={24} alt="" className="rounded-full flex-shrink-0" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-white/[0.06] flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-300">{event.agent_name}</span>
          <span className="text-[10px] text-zinc-600">{formatRelativeTime(event.created_at)}</span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5 truncate">{event.content}</p>
      </div>
    </div>
  );
}

function CommandCenter({ team }: { team: TeamData }) {
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const accentColor = team.accentColor;

  // Fetch activity feed from API
  const fetchActivity = useCallback(async () => {
    if (!team.leadAgentId) return;
    try {
      const events = await api.get<ActivityEvent[]>(`/api/agents/${team.leadAgentId}/activity`);
      setActivityEvents(events);
    } catch {
      // silently fail
    }
  }, [team.leadAgentId]);

  // Initial load + auto-refresh every 30s
  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  // Quiet activation — just set statuses
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatuses((s) => ({ ...s, lead: "idle" }));
      team.specialists.forEach((spec) => {
        setStatuses((s) => ({ ...s, [spec.id]: "idle" }));
      });
    }, 500);

    // Single greeting from lead
    const greetTimer = setTimeout(() => {
      setChatMessages([{
        role: "assistant",
        content: "Team's online. Ready for your first command.",
      }]);
    }, 1000);

    return () => { clearTimeout(timer); clearTimeout(greetTimer); };
  }, [team]);

  const simulateTeamWork = useCallback(
    (userMessage: string) => {
      const spec =
        team.specialists[Math.floor(Math.random() * team.specialists.length)];

      // Lead dispatches
      setTimeout(() => {
        setStatuses((s) => ({ ...s, [spec.id]: "working" }));
      }, 800);

      // Specialist complete
      setTimeout(() => {
        setStatuses((s) => ({ ...s, [spec.id]: "idle" }));
      }, 4000);

      // Lead response
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Based on ${spec.name}'s analysis, here's what I found regarding "${userMessage.slice(0, 40)}..."\n\nI've dispatched ${spec.name} to look into this further. The initial results look promising — I'll have a full report shortly.`,
          },
        ]);
        // Refresh activity feed after response
        fetchActivity();
      }, 4500);
    },
    [team, fetchActivity]
  );

  const handleSend = () => {
    if (!chatInput.trim()) return;

    const message = chatInput.trim();
    setChatInput("");

    setChatMessages((prev) => [...prev, { role: "user", content: message }]);

    simulateTeamWork(message);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="flex h-full" style={{ background: "#09090b" }}>
      {/* Left sidebar */}
      <div className="hidden lg:block">
        <OrgChartSidebar team={team} statuses={statuses} />
      </div>

      {/* Center: Activity feed + chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile org strip */}
        <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-white/[0.04] overflow-x-auto">
          <TeamIcon teamId={team.templateId} size="sm" />
          {[team.lead, ...team.specialists].map((member, i) => {
            const memberId = i === 0 ? "lead" : team.specialists[i - 1]?.id;
            const status = statuses[memberId ?? "lead"] ?? "offline";

            return (
              <div key={i} className="relative shrink-0">
                <CharacterAvatar
                  characterId={member.characterId}
                  size={28}
                  accentColor={team.accentColor}
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border"
                  style={{
                    borderColor: "#09090b",
                    backgroundColor: STATUS_COLORS[status],
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Activity feed header */}
        <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          <span className="text-xs text-[#71717a] font-medium">
            Activity
          </span>
        </div>

        {/* Activity feed */}
        <div
          className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2"
          style={{ maxHeight: "calc(100vh - 360px)" }}
        >
          <AnimatePresence>
            {activityEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ActivityItem event={event} />
              </motion.div>
            ))}
          </AnimatePresence>
          {activityEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
              <MessageSquare className="w-8 h-8 text-[#27272a] mb-4" />
              <p className="text-sm text-[#71717a]">
                Your team is ready. Send a message to get started.
              </p>
            </div>
          )}
        </div>

        {/* Chat section */}
        <div className="border-t border-white/[0.04]">
          {/* Chat messages */}
          <div
            ref={chatRef}
            className="max-h-[200px] overflow-y-auto px-4 py-3 space-y-3"
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <CharacterAvatar
                    characterId={team.lead.characterId}
                    size={28}
                    accentColor={accentColor}
                  />
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-white/[0.06] text-[#fafafa]"
                      : "bg-white/[0.03] text-[#a1a1aa]"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span
                      className="text-xs font-medium block mb-1"
                      style={{ color: accentColor }}
                    >
                      {team.lead.name}
                    </span>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="px-4 py-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Talk to ${team.lead.name}...`}
                className="flex-1 h-14 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 text-sm text-[#fafafa] placeholder-[#52525b] outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/30 transition-all duration-200"
              />
              <button
                onClick={handleSend}
                disabled={!chatInput.trim()}
                className="shrink-0 rounded-xl p-3 bg-white/[0.03] border border-white/[0.06] transition-all duration-200 hover:bg-white/[0.06] hover:brightness-110 disabled:opacity-30 active:scale-[0.98]"
              >
                <Send className="w-4 h-4 text-[#a1a1aa]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegacyDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const { agents } = useAgentStore();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-light text-[#fafafa] tracking-[-0.02em]">Your Agents</h2>
          <p className="text-sm text-[#71717a]">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} deployed
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-[#fafafa] hover:bg-[#6d28d9] transition-all duration-200 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </div>
      <AgentList />
      {showCreate && (
        <CreateAgentDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("foundry_team");
    if (stored) {
      try {
        setTeam(JSON.parse(stored));
      } catch {
        // Invalid data
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    document.title = "Foundry — Command Center";
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-full" style={{ background: "#09090b" }}>
        <div className="hidden lg:block w-60 shrink-0 border-r border-white/[0.04] p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (team) {
    return <CommandCenter team={team} />;
  }

  return <LegacyDashboard />;
}
