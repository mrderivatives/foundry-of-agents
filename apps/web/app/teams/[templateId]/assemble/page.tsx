"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Pencil, Check, Zap, X } from "lucide-react";
import Link from "next/link";
import { TEAMS, ALL_SPECIALISTS, type Specialist } from "@/shared/data/teams";
import { getCharacter } from "@/shared/components/characters";

function EditableName({
  value,
  onChange,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex items-center gap-1">
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
          className="bg-white/10 text-white text-sm font-bold px-2 py-0.5 rounded w-24 outline-none"
          style={{ borderColor: accentColor, borderWidth: 1 }}
        />
        <button
          onClick={() => {
            onChange(draft);
            setEditing(false);
          }}
          className="text-green-400 hover:text-green-300"
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
      className="flex items-center gap-1 group"
    >
      <span className="font-bold text-sm text-white">{value}</span>
      <Pencil className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
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
      initial={{ opacity: 0, y: isLead ? -40 : 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      className="relative rounded-2xl p-4 text-center"
      style={{
        background: "#141420",
        border: `1px solid ${accentColor}30`,
        boxShadow: `0 4px 16px ${accentColor}15`,
        width: isLead ? 180 : 160,
      }}
    >
      {isLead && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: accentColor, color: "#000" }}
        >
          LEAD
        </div>
      )}
      <div className="flex justify-center mb-2 mt-1">
        {Character && <Character size={size} />}
      </div>
      <EditableName
        value={name}
        onChange={onNameChange}
        accentColor={accentColor}
      />
      <p className="text-xs text-white/40 mt-0.5">{role}</p>
      <p className="text-[10px] text-white/25 italic mt-1 leading-tight">
        &ldquo;{tagline}&rdquo;
      </p>
    </motion.div>
  );
}

function OrgChartLines({
  leadWidth,
  specCount,
}: {
  leadWidth: number;
  specCount: number;
}) {
  const positions = specCount === 3 ? [-1, 0, 1] : [0];
  const spacing = 170;

  return (
    <svg
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top: 0, width: spacing * 3, height: 60 }}
      viewBox={`${-spacing * 1.5} 0 ${spacing * 3} 60`}
    >
      {positions.map((pos, i) => (
        <motion.line
          key={i}
          x1={0}
          y1={0}
          x2={pos * spacing}
          y2={60}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 1.0 + i * 0.2 }}
        />
      ))}
      <motion.circle
        cx={0}
        cy={0}
        r={3}
        fill="rgba(255,255,255,0.2)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      />
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
        <h3 className="text-lg font-bold text-white">PICK 3 SPECIALISTS</h3>
        <span
          className="text-sm font-bold px-3 py-1 rounded-full"
          style={{
            color: accentColor,
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          Selected: {selected.length}/3
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ALL_SPECIALISTS.map((spec) => {
          const isSelected = selected.includes(spec.id);
          const team = TEAMS.find((t) => t.id === spec.teamId);
          const Character = getCharacter(spec.characterId);

          return (
            <motion.button
              key={spec.id}
              onClick={() => {
                if (!isSelected && selected.length >= 3) return;
                onToggle(spec.id);
              }}
              className="relative rounded-xl p-3 text-center transition-all"
              style={{
                background: isSelected ? `${accentColor}10` : "#141420",
                border: isSelected
                  ? `2px solid ${accentColor}`
                  : "1px solid rgba(255,255,255,0.06)",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: accentColor }}
                >
                  <Check className="w-3 h-3 text-black" />
                </motion.div>
              )}
              <div className="flex justify-center mb-1">
                {Character && <Character size={48} />}
              </div>
              <p className="text-xs font-semibold text-white truncate">
                {spec.role}
              </p>
              <p className="text-[10px] text-white/30">{team?.emoji} {spec.name}</p>
            </motion.button>
          );
        })}
      </div>

      {selected.length >= 3 && (
        <p className="text-xs text-white/30 text-center mt-3">
          Tap a selected specialist to remove it
        </p>
      )}
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
    // Simulate activation delay
    await new Promise((r) => setTimeout(r, 1500));

    // Store team in localStorage for dashboard
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0a0f" }}
      >
        <p className="text-white/40">Team not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/teams"
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-xs text-white/30 font-mono">
            Step {isCustom && !showOrgChart ? "2/3" : "3/3"}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {showOrgChart ? "YOUR TEAM IS ASSEMBLING..." : "BUILD YOUR CUSTOM TEAM"}
          </h1>
          <p className="text-white/40 mt-1">
            {showOrgChart
              ? "Rename your agents. Make them yours."
              : "Pick any 3 specialists from across all teams."}
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {/* Custom team picker (before org chart) */}
        {isCustom && !showOrgChart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Custom lead */}
            <div className="mb-8 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-white/30 font-bold uppercase tracking-wider mb-3">
                YOUR LEAD
              </p>
              <div className="flex items-center gap-4">
                {(() => {
                  const LeadChar = getCharacter(team.lead.characterId);
                  return LeadChar ? <LeadChar size={64} /> : null;
                })()}
                <div>
                  <EditableName
                    value={leadName}
                    onChange={setLeadName}
                    accentColor={accentColor}
                  />
                  <p className="text-xs text-white/40">{team.lead.role}</p>
                  <p className="text-[10px] text-white/25 italic mt-1">
                    &ldquo;{team.lead.tagline}&rdquo;
                  </p>
                </div>
              </div>
            </div>

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
                  className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  }}
                >
                  ASSEMBLE TEAM
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
                  delay={0.5}
                  isLead
                />
              </div>

              {/* Connection lines */}
              <div className="relative h-[60px] flex justify-center">
                <OrgChartLines
                  leadWidth={180}
                  specCount={specialists.length}
                />
              </div>

              {/* Specialists */}
              <div className="flex justify-center gap-3 flex-wrap">
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
                    delay={1.2 + i * 0.2}
                  />
                ))}
              </div>

              {/* Activate button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="mt-12 text-center"
              >
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="group relative inline-flex items-center gap-2 rounded-xl px-10 py-4 text-base font-bold text-white transition-all disabled:opacity-70"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow:
                      "0 0 40px -5px rgba(34,197,94,0.4), 0 0 80px -10px rgba(34,197,94,0.2)",
                  }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-xl"
                    animate={
                      !activating
                        ? {
                            boxShadow: [
                              "0 0 20px 0px rgba(34,197,94,0.3)",
                              "0 0 40px 5px rgba(34,197,94,0.5)",
                              "0 0 20px 0px rgba(34,197,94,0.3)",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {activating ? "ACTIVATING..." : "ACTIVATE TEAM"}
                  </span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
