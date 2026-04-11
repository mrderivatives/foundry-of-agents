"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Pencil, Check, Zap } from "lucide-react";
import Link from "next/link";
import { TEAMS, ALL_SPECIALISTS, type Specialist } from "@/shared/data/teams";
import { getCharacter } from "@/shared/components/characters";
import { GlassCard } from "@/shared/components/glass-card";

const ease = [0.16, 1, 0.3, 1] as const;

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
          className="bg-transparent text-[#fafafa] text-sm font-medium text-center border-b border-white/10 outline-none focus:border-violet-500/50 w-24 transition-all duration-200 py-0.5"
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
      <span className="font-medium text-sm text-[#fafafa]">{value}</span>
      <Pencil className="w-3 h-3 text-[#71717a] group-hover:text-[#a1a1aa] transition-colors duration-200" />
    </button>
  );
}

function AgentCard({
  characterId,
  name,
  role,
  tagline,
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
  accentColor: string;
  size: number;
  onNameChange: (v: string) => void;
  delay: number;
  isLead?: boolean;
}) {
  const Character = getCharacter(characterId);

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
      <div
        className={`relative p-5 text-center rounded-xl border bg-white/[0.03] backdrop-blur-xl ${isLead ? 'w-[180px] border-white/[0.06]' : 'w-[160px] border-white/[0.06]'}`}
      >
        {isLead && (
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-medium px-2.5 py-0.5 rounded-full"
            style={{ background: accentColor, color: "#09090b" }}
          >
            LEAD
          </div>
        )}
        <div className="flex justify-center mb-3 mt-1">
          {Character && <Character size={size} />}
        </div>
        <EditableName value={name} onChange={onNameChange} />
        <p className="text-xs text-[#71717a] mt-1">{role}</p>
        <p className="text-[10px] text-[#71717a] italic mt-1.5 leading-tight opacity-60">
          &ldquo;{tagline}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}

function OrgChartLines({ specCount }: { specCount: number }) {
  const positions = specCount === 3 ? [-1, 0, 1] : [0];
  const spacing = 170;

  return (
    <svg
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top: 0, width: spacing * 3, height: 48 }}
      viewBox={`${-spacing * 1.5} 0 ${spacing * 3} 48`}
    >
      {positions.map((pos, i) => (
        <motion.line
          key={i}
          x1={0}
          y1={0}
          x2={pos * spacing}
          y2={48}
          stroke="#27272a"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 1.0 + i * 0.2 }}
        />
      ))}
    </svg>
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
        <h3 className="text-lg font-light text-[#fafafa] tracking-[-0.02em]">Pick 3 Specialists</h3>
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
          const team = TEAMS.find((t) => t.id === spec.teamId);
          const Character = getCharacter(spec.characterId);

          return (
            <button
              key={spec.id}
              onClick={() => {
                if (!isSelected && selected.length >= 3) return;
                onToggle(spec.id);
              }}
              className="relative rounded-xl p-3 text-center transition-all duration-200 hover:bg-white/[0.04] active:scale-[0.98]"
              style={{
                background: isSelected ? `${accentColor}08` : "transparent",
                border: isSelected
                  ? `2px solid ${accentColor}`
                  : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {isSelected && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: accentColor }}
                >
                  <Check className="w-3 h-3 text-[#09090b]" />
                </div>
              )}
              <div className="flex justify-center mb-1">
                {Character && <Character size={48} />}
              </div>
              <p className="text-xs font-medium text-[#fafafa] truncate">
                {spec.role}
              </p>
              <p className="text-[10px] text-[#71717a]">{team?.emoji} {spec.name}</p>
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

  const isCustom = templateId === "custom";
  const accentColor = team?.accentColor ?? "#ec4899";

  const specialists = isCustom
    ? customSelected.map(
        (id) => ALL_SPECIALISTS.find((s) => s.id === id)!
      ).filter(Boolean)
    : (team?.specialists ?? []);

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
    await new Promise((r) => setTimeout(r, 1500));

    const teamData = {
      templateId,
      teamName: team?.name ?? "Custom Team",
      emoji: team?.emoji ?? "⚡",
      accentColor,
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
    router.push("/dashboard");
  };

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#09090b" }}>
        <p className="text-[#71717a]">Team not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* Header */}
      <div className="max-w-[640px] mx-auto px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/teams"
            className="flex items-center gap-2 text-sm text-[#71717a] hover:text-[#a1a1aa] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-xs text-[#71717a] font-mono">
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
          <p className="text-[#71717a]">
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
              <p className="text-xs text-[#71717a] font-medium uppercase tracking-wider mb-3">
                Your Lead
              </p>
              <div className="flex items-center gap-4">
                {(() => {
                  const LeadChar = getCharacter(team.lead.characterId);
                  return LeadChar ? <LeadChar size={64} /> : null;
                })()}
                <div>
                  <EditableName value={leadName} onChange={setLeadName} />
                  <p className="text-xs text-[#71717a]">{team.lead.role}</p>
                  <p className="text-[10px] text-[#71717a] italic mt-1 opacity-60">
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
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium text-[#fafafa] border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 active:scale-[0.98]"
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
                  className="inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg font-medium text-white bg-[#22c55e] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,197,94,0.35)] disabled:opacity-70 active:scale-[0.98]"
                  style={{
                    boxShadow: "0 0 24px rgba(34,197,94,0.25)",
                  }}
                >
                  <Zap className="w-5 h-5" />
                  {activating ? "Activating..." : "Activate Team"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
