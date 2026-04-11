"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronRight } from "lucide-react";
import { getCharacter } from "@/shared/components/characters";
import { TEAMS } from "@/shared/data/teams";
import { useAgentStore } from "@/features/agents/store";
import { AgentList } from "@/features/agents/components/agent-list";
import { CreateAgentDialog } from "@/features/agents/components/create-agent-dialog";
import { Plus } from "lucide-react";

interface TeamData {
  templateId: string;
  teamName: string;
  emoji: string;
  accentColor: string;
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

type AgentStatus = "idle" | "working" | "waiting" | "error" | "offline";

interface FeedEvent {
  id: string;
  timestamp: string;
  type:
    | "dispatch"
    | "working"
    | "complete"
    | "alert"
    | "system"
    | "user"
    | "lead";
  agentName?: string;
  agentCharacterId?: string;
  targetName?: string;
  text: string;
  color?: string;
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: "#22c55e",
  working: "#3b82f6",
  waiting: "#eab308",
  error: "#ef4444",
  offline: "#6b7280",
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "Idle",
  working: "Working",
  waiting: "Waiting",
  error: "Error",
  offline: "Offline",
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function OrgChartSidebar({
  team,
  statuses,
  accentColor,
}: {
  team: TeamData;
  statuses: Record<string, AgentStatus>;
  accentColor: string;
}) {
  const LeadChar = getCharacter(team.lead.characterId);

  return (
    <div className="w-[240px] shrink-0 border-r border-white/[0.06] bg-[#0c0c14] flex flex-col h-full overflow-y-auto">
      {/* Team header */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-lg">{team.emoji}</span>
          <span className="text-sm font-bold text-white">{team.teamName}</span>
        </div>
      </div>

      {/* Lead card */}
      <div className="px-3 pt-4">
        <div
          className="rounded-xl p-3 transition-all hover:bg-white/[0.03] cursor-pointer"
          style={{ border: `1px solid ${accentColor}30` }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {LeadChar && <LeadChar size={48} />}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c0c14]"
                style={{
                  backgroundColor:
                    STATUS_COLORS[statuses["lead"] ?? "idle"],
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${accentColor}20`, color: accentColor }}
                >
                  LEAD
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate mt-0.5">
                {team.lead.name}
              </p>
              <p className="text-[10px] text-white/30">{team.lead.role}</p>
            </div>
          </div>
        </div>

        {/* Connection line */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-white/10" />
        </div>

        {/* Specialists */}
        <div className="space-y-1">
          {team.specialists.map((spec) => {
            const SpecChar = getCharacter(spec.characterId);
            const status = statuses[spec.id] ?? "idle";

            return (
              <div
                key={spec.id}
                className="rounded-xl p-2.5 transition-all hover:bg-white/[0.03] cursor-pointer border border-white/[0.04]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    {SpecChar && <SpecChar size={36} />}
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0c0c14]"
                      style={{
                        backgroundColor: STATUS_COLORS[status],
                      }}
                      animate={
                        status === "working"
                          ? { scale: [1, 1.3, 1] }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {spec.name}
                    </p>
                    <p className="text-[10px] text-white/30">{spec.role}</p>
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      color: STATUS_COLORS[status],
                      background: `${STATUS_COLORS[status]}15`,
                    }}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team stats */}
      <div className="mt-auto px-4 py-4 border-t border-white/[0.06]">
        <p className="text-[10px] text-white/20 uppercase tracking-wider font-bold mb-2">
          Status Legend
        </p>
        <div className="grid grid-cols-2 gap-1">
          {(["idle", "working", "waiting", "error"] as AgentStatus[]).map(
            (s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[s] }}
                />
                <span className="text-[10px] text-white/30 capitalize">
                  {s}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function FeedItem({ event, accentColor }: { event: FeedEvent; accentColor: string }) {
  const AgentChar = event.agentCharacterId
    ? getCharacter(event.agentCharacterId)
    : null;

  const icon =
    event.type === "dispatch"
      ? "📋"
      : event.type === "working"
        ? "⏳"
        : event.type === "complete"
          ? "✅"
          : event.type === "alert"
            ? "⚠️"
            : event.type === "system"
              ? "⚙️"
              : event.type === "user"
                ? "💬"
                : "🤖";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
    >
      <span className="text-[10px] text-white/20 font-mono shrink-0 pt-1 w-10">
        {event.timestamp}
      </span>
      <div className="shrink-0 pt-0.5">
        {AgentChar ? <AgentChar size={24} /> : <span className="text-sm">{icon}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/70 leading-relaxed">
          {event.agentName && (
            <span
              className="font-bold"
              style={{ color: event.color ?? accentColor }}
            >
              {event.agentName}
            </span>
          )}
          {event.targetName && (
            <>
              {" "}
              <span className="text-white/30">→</span>{" "}
              <span className="font-semibold text-white/60">
                {event.targetName}
              </span>
            </>
          )}
          {event.agentName ? ": " : ""}
          {event.text}
        </p>
      </div>
    </motion.div>
  );
}

function CommandCenter({ team }: { team: TeamData }) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const accentColor = team.accentColor;

  const addEvent = useCallback((event: Omit<FeedEvent, "id" | "timestamp">) => {
    const newEvent: FeedEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: formatTime(new Date()),
    };
    setEvents((prev) => [newEvent, ...prev]);
  }, []);

  // Activation sequence on mount
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        setStatuses((s) => ({ ...s, lead: "idle" }));
        addEvent({
          type: "system",
          text: `${team.lead.name} activated`,
        });
      }, 500)
    );

    team.specialists.forEach((spec, i) => {
      timers.push(
        setTimeout(() => {
          setStatuses((s) => ({ ...s, [spec.id]: "idle" }));
          addEvent({
            type: "system",
            text: `${spec.name} online`,
          });
        }, 1000 + i * 300)
      );
    });

    timers.push(
      setTimeout(() => {
        addEvent({
          type: "system",
          text: "All agents operational",
        });
      }, 2000)
    );

    timers.push(
      setTimeout(() => {
        addEvent({
          type: "lead",
          agentName: team.lead.name,
          agentCharacterId: team.lead.characterId,
          text: "Team's online. Ready for your first command.",
          color: accentColor,
        });
      }, 2500)
    );

    return () => timers.forEach(clearTimeout);
  }, [team, accentColor, addEvent]);

  const simulateTeamWork = useCallback(
    (userMessage: string) => {
      const spec =
        team.specialists[Math.floor(Math.random() * team.specialists.length)];

      // Lead dispatches
      setTimeout(() => {
        setStatuses((s) => ({ ...s, [spec.id]: "working" }));
        addEvent({
          type: "dispatch",
          agentName: team.lead.name,
          agentCharacterId: team.lead.characterId,
          targetName: spec.name,
          text: `"${userMessage.slice(0, 60)}${userMessage.length > 60 ? "..." : ""}"`,
          color: accentColor,
        });
      }, 800);

      // Specialist working
      setTimeout(() => {
        addEvent({
          type: "working",
          agentName: spec.name,
          agentCharacterId: spec.characterId,
          text: "Processing request...",
          color: accentColor,
        });
      }, 2000);

      // Specialist complete
      setTimeout(() => {
        setStatuses((s) => ({ ...s, [spec.id]: "idle" }));
        addEvent({
          type: "complete",
          agentName: spec.name,
          agentCharacterId: spec.characterId,
          text: "Analysis complete",
          color: accentColor,
        });
      }, 4000);

      // Lead synthesizes response
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Based on ${spec.name}'s analysis, here's what I found regarding "${userMessage.slice(0, 40)}..."\n\nI've dispatched ${spec.name} to look into this further. The initial results look promising — I'll have a full report shortly.`,
          },
        ]);
      }, 4500);
    },
    [team, accentColor, addEvent]
  );

  const handleSend = () => {
    if (!chatInput.trim()) return;

    const message = chatInput.trim();
    setChatInput("");

    setChatMessages((prev) => [...prev, { role: "user", content: message }]);

    addEvent({
      type: "user",
      text: `"${message}"`,
    });

    simulateTeamWork(message);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="flex h-full" style={{ background: "#0a0a0f" }}>
      {/* Left sidebar: Org chart */}
      <div className="hidden lg:block">
        <OrgChartSidebar
          team={team}
          statuses={statuses}
          accentColor={accentColor}
        />
      </div>

      {/* Center: Activity feed + chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile org strip */}
        <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] overflow-x-auto">
          <span className="text-sm">{team.emoji}</span>
          {[team.lead, ...team.specialists.map((s) => ({ ...s }))].map(
            (member, i) => {
              const Char = getCharacter(
                "characterId" in member
                  ? member.characterId
                  : team.lead.characterId
              );
              const memberId = i === 0 ? "lead" : team.specialists[i - 1]?.id;
              const status = statuses[memberId ?? "lead"] ?? "offline";

              return (
                <div key={i} className="relative shrink-0">
                  {Char && <Char size={32} />}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0a0a0f]"
                    style={{
                      backgroundColor: STATUS_COLORS[status],
                    }}
                  />
                </div>
              );
            }
          )}
        </div>

        {/* Activity feed header */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
            LIVE ACTIVITY
          </span>
        </div>

        {/* Activity feed */}
        <div
          ref={feedRef}
          className="flex-1 overflow-y-auto min-h-0"
          style={{ maxHeight: "calc(100vh - 360px)" }}
        >
          <AnimatePresence>
            {events.map((event) => (
              <FeedItem key={event.id} event={event} accentColor={accentColor} />
            ))}
          </AnimatePresence>
          {events.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-white/20">
              Waiting for activity...
            </div>
          )}
        </div>

        {/* Chat section */}
        <div className="border-t border-white/[0.06]">
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
                {msg.role === "assistant" && (() => {
                  const LeadChar = getCharacter(team.lead.characterId);
                  return LeadChar ? <LeadChar size={24} /> : null;
                })()}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-white/10 text-white"
                      : "bg-white/[0.03] text-white/70"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span
                      className="text-xs font-bold block mb-1"
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
                placeholder={`Chat with ${team.lead.name}...`}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!chatInput.trim()}
                className="shrink-0 rounded-xl p-2.5 transition-all disabled:opacity-30"
                style={{
                  background: chatInput.trim()
                    ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                    : "rgba(255,255,255,0.05)",
                }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback: original dashboard if no team is set
function LegacyDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const { agents } = useAgentStore();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Your Agents</h2>
          <p className="text-sm text-muted-foreground">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} deployed
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
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

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (team) {
    return <CommandCenter team={team} />;
  }

  return <LegacyDashboard />;
}
