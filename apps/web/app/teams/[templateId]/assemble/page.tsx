"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Pencil, Check, Zap, Plus, X } from "lucide-react";
import Link from "next/link";
import { TEAMS, ALL_SPECIALISTS, type Specialist } from "@/shared/data/teams";
import { CharacterAvatar } from "@/shared/components/characters";
import { api } from "@/shared/api/client";
import { GlassCard } from "@/shared/components/glass-card";
import { TeamIcon } from "@/shared/components/team-icon";

const ease = [0.16, 1, 0.3, 1] as const;

const AVAILABLE_AVATARS = [
  'analyst', 'quant', 'trader', 'oracle', 'gambling-guru', 'journalist',
  'planner', 'networker', 'cto', 'growth-hacker', 'cfo', 'commander',
  'coach', 'director', 'chief',
];

function EditableName({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange(draft);
              setEditing(false);
            }
            if (e.key === "Escape") setEditing(false);
          }}
          className="bg-transparent text-foreground text-sm font-medium text-center border-b border-border outline-none focus:border-violet-500/50 w-24 transition-all duration-200 py-0.5"
        />
        <button
          onClick={() => {
            onChange(draft);
            setEditing(false);
          }}
          className="text-[#22c55e] hover:text-[#16a34a] transition-colors duration-200"
        >
          <Check className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="flex items-center justify-center gap-1 group mx-auto"
    >
      <span className="font-medium text-sm text-foreground">{value}</span>
      <Pencil className="w-3 h-3 text-muted-foreground group-hover:text-muted-foreground transition-colors duration-200" />
    </button>
  );
}

function AgentCard({
  characterId,
  name,
  role,
  tagline,
  description,
  accentColor,
  size,
  onNameChange,
  delay,
  isLead,
}: {
  characterId: string;
  name: string;
  role: string;
  tagline: string;
  description?: string;
  accentColor: string;
  size: number;
  onNameChange: (v: string) => void;
  delay: number;
  isLead?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: isLead ? -16 : 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease,
      }}
    >
      <div className="group relative">
        <div
          className={`relative p-5 text-center rounded-xl border bg-card backdrop-blur-xl ${isLead ? 'w-[180px] border-border' : 'w-[160px] border-border'}`}
        >
          {isLead && (
            <div
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: accentColor, color: 'var(--color-background)' }}
            >
              LEAD
            </div>
          )}
          <div className="flex justify-center mb-3 mt-1">
            <CharacterAvatar
              characterId={characterId}
              size={size}
              accentColor={accentColor}
            />
          </div>
          <EditableName value={name} onChange={onNameChange} />
          <p className="text-xs text-muted-foreground mt-1">{role}</p>
          <p className="text-[10px] text-muted-foreground italic mt-1.5 leading-tight opacity-60">
            &ldquo;{tagline}&rdquo;
          </p>
        </div>

        {/* Tooltip */}
        {description && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-lg text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
            style={{ background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}
          >
            {description}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OrgChartLines({ specCount }: { specCount: number }) {
  const positions = specCount >= 3 ? [-1, 0, 1] : specCount === 4 ? [-1.5, -0.5, 0.5, 1.5] : [0];
  const spacing = 170;

  return (
    <svg
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top: 0, width: spacing * 4, height: 48 }}
      viewBox={`${-spacing * 2} 0 ${spacing * 4} 48`}
    >
      {positions.map((pos, i) => (
        <motion.line
          key={i}
          x1={0}
          y1={0}
          x2={pos * spacing}
          y2={48}
          stroke="var(--color-border)"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 1.0 + i * 0.2 }}
        />
      ))}
    </svg>
  );
}

function AddSpecialistModal({
  accentColor,
  onAdd,
  onClose,
}: {
  accentColor: string;
  onAdd: (spec: Specialist) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("commander");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      id: `custom-${Date.now()}`,
      role: "Specialist",
      name: name.trim(),
      characterId: selectedAvatar,
      tagline: "Ready to assist.",
      description: description.trim() || `Custom specialist — ${name.trim()}`,
      teamId: "custom",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-foreground">Add Specialist</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Scout"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monitors whale wallets and alerts on moves"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_AVATARS.map((avatarId) => (
                <button
                  key={avatarId}
                  onClick={() => setSelectedAvatar(avatarId)}
                  className="rounded-full transition-all duration-150"
                  style={{
                    outline: selectedAvatar === avatarId ? `2px solid ${accentColor}` : '2px solid transparent',
                    outlineOffset: 2,
                  }}
                >
                  <CharacterAvatar characterId={avatarId} size={36} accentColor={accentColor} />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="w-full mt-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
            style={{ background: '#7c3aed' }}
          >
            Add to Team
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecialistPicker({
  selected,
  onToggle,
  accentColor,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  accentColor: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-light text-foreground tracking-[-0.02em]">Pick 3 Specialists</h3>
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{
            color: accentColor,
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          {selected.length}/3
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ALL_SPECIALISTS.map((spec) => {
          const isSelected = selected.includes(spec.id);

          return (
            <button
              key={spec.id}
              onClick={() => {
                if (!isSelected && selected.length >= 3) return;
                onToggle(spec.id);
              }}
              className="relative rounded-xl p-3 text-center transition-all duration-200 hover:bg-accent active:scale-[0.98]"
              style={{
                background: isSelected ? `${accentColor}08` : "transparent",
                border: isSelected
                  ? `2px solid ${accentColor}`
                  : "1px solid var(--color-border)",
              }}
            >
              {isSelected && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: accentColor }}
                >
                  <Check className="w-3 h-3" style={{ color: 'var(--color-background)' }} />
                </div>
              )}
              <div className="flex justify-center mb-1">
                <CharacterAvatar
                  characterId={spec.characterId}
                  size={48}
                  accentColor={accentColor}
                />
              </div>
              <p className="text-xs font-medium text-foreground truncate">
                {spec.role}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                {spec.teamId && <TeamIcon teamId={spec.teamId} size="sm" />}
                {spec.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AssemblePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const router = useRouter();
  const team = TEAMS.find((t) => t.id === templateId);

  const [leadName, setLeadName] = useState(team?.lead.name ?? "Commander");
  const [specialistNames, setSpecialistNames] = useState<Record<string, string>>({});
  const [customSelected, setCustomSelected] = useState<string[]>([]);
  const [activating, setActivating] = useState(false);
  const [showOrgChart, setShowOrgChart] = useState(templateId !== "custom");
  const [addedSpecialist, setAddedSpecialist] = useState<Specialist | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    document.title = "Foundry — Assemble Your Team";
  }, []);

  const isCustom = templateId === "custom";
  const accentColor = team?.accentColor ?? "#ec4899";

  const baseSpecialists = isCustom
    ? customSelected.map(
        (id) => ALL_SPECIALISTS.find((s) => s.id === id)!
      ).filter(Boolean)
    : (team?.specialists ?? []);

  const specialists = addedSpecialist
    ? [...baseSpecialists, addedSpecialist]
    : baseSpecialists;

  const getSpecName = (spec: Specialist) =>
    specialistNames[spec.id] ?? spec.name;

  const handleToggleCustom = (id: string) => {
    setCustomSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (isCustom && customSelected.length === 3 && !showOrgChart) {
      setShowOrgChart(true);
    }
  }, [customSelected, isCustom, showOrgChart]);

  const handleActivate = async () => {
    setActivating(true);
    try {
      const result = await api.post<{
        id: string;
        lead_agent_id: string;
        members: { agent_id: string; role: string }[];
      }>("/api/teams", {
        template_id: templateId,
        lead_name: leadName,
        lead_role: team?.lead.role ?? "Chief of Staff",
        lead_character_id: team?.lead.characterId ?? "default-lead",
        specialists: specialists.map((s) => ({
          name: getSpecName(s),
          role: s.role,
          character_id: s.characterId,
          description: s.description,
        })),
        accent_color: accentColor,
      });

      const teamData = {
        templateId,
        teamName: team?.name ?? "Custom Team",
        emoji: team?.emoji ?? "⚡",
        accentColor,
        leadAgentId: result.lead_agent_id,
        lead: {
          name: leadName,
          role: team?.lead.role ?? "Chief of Staff",
          characterId: team?.lead.characterId ?? "default-lead",
          tagline: team?.lead.tagline ?? "Your mission, my team.",
        },
        specialists: specialists.map((s) => ({
          id: s.id,
          name: getSpecName(s),
          role: s.role,
          characterId: s.characterId,
          tagline: s.tagline,
          description: s.description,
        })),
      };
      localStorage.setItem("foundry_team", JSON.stringify(teamData));

      if (result.lead_agent_id) {
        router.push(`/dashboard/canvas?agent=${result.lead_agent_id}`);
      } else {
        router.push("/dashboard/canvas");
      }
    } catch {
      const teamData = {
        templateId,
        teamName: team?.name ?? "Custom Team",
        emoji: team?.emoji ?? "⚡",
        accentColor,
        lead: { name: leadName, role: team?.lead.role ?? "Chief of Staff", characterId: team?.lead.characterId ?? "default-lead", tagline: team?.lead.tagline ?? "Your mission, my team." },
        specialists: specialists.map((s) => ({ id: s.id, name: getSpecName(s), role: s.role, characterId: s.characterId, tagline: s.tagline, description: s.description })),
      };
      localStorage.setItem("foundry_team", JSON.stringify(teamData));
      router.push("/dashboard/canvas");
    } finally {
      setActivating(false);
    }
  };

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <p className="text-muted-foreground">Team not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="max-w-[640px] mx-auto px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/teams"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-muted-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-xs text-muted-foreground font-mono">
            Step {isCustom && !showOrgChart ? "2/3" : "3/3"}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <h1
            className="text-[clamp(24px,3vw,32px)] font-light tracking-[-0.02em] mb-2"
            style={{
              background: "linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {showOrgChart ? "Your Team" : "Build Your Custom Team"}
          </h1>
          <p className="text-muted-foreground">
            {showOrgChart
              ? "Rename your agents. Make them yours."
              : "Pick any 3 specialists from across all teams."}
          </p>
        </motion.div>
      </div>

      <div className="max-w-[640px] mx-auto px-6 pb-24">
        {/* Custom team picker */}
        {isCustom && !showOrgChart && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="mb-8 p-6" hover={false}>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
                Your Lead
              </p>
              <div className="flex items-center gap-4">
                <CharacterAvatar
                  characterId={team.lead.characterId}
                  size={64}
                  accentColor={accentColor}
                />
                <div>
                  <EditableName value={leadName} onChange={setLeadName} />
                  <p className="text-xs text-muted-foreground">{team.lead.role}</p>
                  <p className="text-[10px] text-muted-foreground italic mt-1 opacity-60">
                    &ldquo;{team.lead.tagline}&rdquo;
                  </p>
                </div>
              </div>
            </GlassCard>

            <SpecialistPicker
              selected={customSelected}
              onToggle={handleToggleCustom}
              accentColor={accentColor}
            />

            {customSelected.length === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={() => setShowOrgChart(true)}
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium text-foreground border border-border bg-card hover:bg-accent transition-all duration-200 active:scale-[0.98]"
                >
                  Assemble Team
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Org Chart */}
        <AnimatePresence>
          {showOrgChart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Lead */}
              <div className="flex justify-center mb-2">
                <AgentCard
                  characterId={team.lead.characterId}
                  name={leadName}
                  role={team.lead.role}
                  tagline={team.lead.tagline}
                  accentColor={accentColor}
                  size={80}
                  onNameChange={setLeadName}
                  delay={0.3}
                  isLead
                />
              </div>

              {/* Connection lines — 64px gap */}
              <div className="relative h-16 flex justify-center">
                <OrgChartLines specCount={specialists.length} />
              </div>

              {/* Specialists */}
              <div className="flex justify-center gap-4 flex-wrap">
                {specialists.map((spec, i) => (
                  <AgentCard
                    key={spec.id}
                    characterId={spec.characterId}
                    name={getSpecName(spec)}
                    role={spec.role}
                    tagline={spec.tagline}
                    description={spec.description}
                    accentColor={accentColor}
                    size={64}
                    onNameChange={(v) =>
                      setSpecialistNames((prev) => ({
                        ...prev,
                        [spec.id]: v,
                      }))
                    }
                    delay={0.8 + i * 0.15}
                  />
                ))}

                {/* Add 4th specialist slot */}
                {!addedSpecialist && !isCustom && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.25, ease }}
                  >
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-[160px] p-5 text-center rounded-xl border-2 border-dashed border-border bg-transparent hover:border-border hover:bg-card transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-center gap-2"
                      style={{ minHeight: 160 }}
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">Add Specialist</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Activate button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="mt-16 text-center"
              >
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg font-medium text-white border border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/20 hover:border-violet-500/70 transition-all duration-200 disabled:opacity-70 active:scale-[0.98]"
                >
                  <Zap className="w-5 h-5" />
                  {activating ? "Activating..." : "Activate Team"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Specialist Modal */}
      {showAddModal && (
        <AddSpecialistModal
          accentColor={accentColor}
          onAdd={(spec) => setAddedSpecialist(spec)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
