"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TEAMS } from "@/shared/data/teams";
import { getCharacter } from "@/shared/components/characters";
import { GlassCard } from "@/shared/components/glass-card";

const ease = [0.16, 1, 0.3, 1] as const;

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
      onClick={() => router.push(`/teams/${team.id}/assemble`)}
      className="group cursor-pointer"
    >
      <GlassCard className="p-8 transition-all duration-200 group-hover:translate-y-[-2px] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Left: Team info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{team.emoji}</span>
              <h3 className="text-lg font-light text-[#fafafa] tracking-[-0.02em]">{team.name}</h3>
            </div>
            <p className="text-sm text-[#a1a1aa] mb-3">
              {team.vibe}
            </p>
            <p className="text-sm text-[#71717a] leading-relaxed">
              {team.description}
            </p>

            {/* Roles */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  color: team.accentColor,
                  background: `${team.accentColor}15`,
                  border: `1px solid ${team.accentColor}25`,
                }}
              >
                Lead: {team.lead.role}
              </span>
              {team.specialists.map((s) => (
                <span
                  key={s.id}
                  className="text-xs px-2.5 py-1 rounded-full text-[#a1a1aa] border border-white/[0.06] bg-white/[0.02]"
                >
                  {s.role}
                </span>
              ))}
            </div>
          </div>

          {/* Center: Character avatars */}
          <div className="flex items-center gap-3">
            {LeadChar && (
              <div
                className="rounded-xl p-1 transition-all duration-200 group-hover:scale-105"
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
                  className="rounded-xl p-1 border border-white/[0.06] transition-all duration-200 group-hover:scale-105"
                >
                  <SpecChar size={48} />
                </div>
              ) : null;
            })}
            {team.id === "custom" &&
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[48px] h-[48px] rounded-full border-2 border-dashed border-white/[0.1] flex items-center justify-center text-[#71717a] text-sm"
                >
                  ?
                </div>
              ))}
          </div>

          {/* Right: CTA */}
          <div className="sm:ml-4 shrink-0">
            <div className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-[#a1a1aa] border border-white/10 transition-all duration-200 group-hover:border-white/20 group-hover:text-white active:scale-[0.98]">
              {team.id === "custom" ? "BUILD" : "SELECT"}
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function TeamsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#71717a] hover:text-[#a1a1aa] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-xs text-[#71717a] font-mono">Step 1/3</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <h1
            className="text-3xl font-light tracking-tight mb-2"
            style={{
              background: "linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Choose Your Squad
          </h1>
          <p className="text-[#71717a]">
            Pick a pre-built team or build your own. You can always change later.
          </p>
        </motion.div>
      </div>

      {/* Team cards */}
      <div className="max-w-3xl mx-auto px-6 pb-24 space-y-6">
        {TEAMS.map((team, i) => (
          <TeamCard key={team.id} team={team} index={i} />
        ))}
      </div>
    </div>
  );
}
