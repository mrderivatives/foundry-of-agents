"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TEAMS } from "@/shared/data/teams";
import { getCharacter } from "@/shared/components/characters";

function TeamCard({
  team,
  index,
}: {
  team: (typeof TEAMS)[number];
  index: number;
}) {
  const router = useRouter();
  const LeadChar = getCharacter(team.lead.characterId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      onClick={() => router.push(`/teams/${team.id}/assemble`)}
      className="group relative w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:bg-white/[0.04]"
      style={{
        boxShadow: "0 0 0 1px transparent",
      }}
      whileHover={{
        boxShadow: `0 0 40px -8px ${team.accentColor}33, 0 0 0 1px ${team.accentColor}44`,
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Left: Team info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{team.emoji}</span>
            <h3 className="text-xl font-bold text-white">{team.name}</h3>
          </div>
          <p
            className="text-sm font-medium mb-3"
            style={{ color: team.accentColor }}
          >
            &ldquo;{team.vibe}&rdquo;
          </p>
          <p className="text-sm text-white/40 leading-relaxed">
            {team.description}
          </p>

          {/* Roles */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                color: team.accentColor,
                background: `${team.accentColor}15`,
                border: `1px solid ${team.accentColor}30`,
              }}
            >
              Lead: {team.lead.role}
            </span>
            {team.specialists.map((s) => (
              <span
                key={s.id}
                className="text-xs px-2.5 py-1 rounded-full text-white/50 border border-white/10 bg-white/[0.03]"
              >
                {s.role}
              </span>
            ))}
          </div>
        </div>

        {/* Center: Character avatars */}
        <div className="flex items-center gap-2">
          {LeadChar && (
            <div
              className="rounded-xl p-1 transition-transform group-hover:scale-105"
              style={{ border: `2px solid ${team.accentColor}` }}
            >
              <LeadChar size={48} />
            </div>
          )}
          {team.specialists.map((s) => {
            const SpecChar = getCharacter(s.characterId);
            return SpecChar ? (
              <div
                key={s.id}
                className="rounded-xl p-1 border border-white/10 transition-transform group-hover:scale-105"
              >
                <SpecChar size={48} />
              </div>
            ) : null;
          })}
          {team.id === "custom" &&
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[52px] h-[52px] rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center text-white/25 text-lg font-bold"
              >
                ?
              </div>
            ))}
        </div>

        {/* Right: CTA */}
        <div className="sm:ml-4 shrink-0">
          <div
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all opacity-70 group-hover:opacity-100"
            style={{
              background:
                team.id === "custom"
                  ? `linear-gradient(135deg, ${team.accentColor}, ${team.accentColor}cc)`
                  : `linear-gradient(135deg, ${team.accentColor}, ${team.accentColor}cc)`,
            }}
          >
            {team.id === "custom" ? "BUILD" : "SELECT"}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-xs text-white/30 font-mono">Step 1/3</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            CHOOSE YOUR SQUAD
          </h1>
          <p className="text-white/40">
            Pick a pre-built team or build your own. You can always change later.
          </p>
        </motion.div>
      </div>

      {/* Team cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-4">
        {TEAMS.map((team, i) => (
          <TeamCard key={team.id} team={team} index={i} />
        ))}
      </div>
    </div>
  );
}
