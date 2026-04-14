"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { TEAMS } from "@/shared/data/teams";
import { CharacterAvatar } from "@/shared/components/characters";
import { GlassCard } from "@/shared/components/glass-card";
import { TeamIcon } from "@/shared/components/team-icon";

const ease = [0.16, 1, 0.3, 1] as const;

const PRIMARY_IDS = ['crypto', 'markets-finance', 'predictions-sports'];
const primaryTeams = TEAMS.filter(t => PRIMARY_IDS.includes(t.id));
const secondaryTeams = TEAMS.filter(t => !PRIMARY_IDS.includes(t.id));

function TeamCard({
  team,
  index,
}: {
  team: (typeof TEAMS)[number];
  index: number;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
      onClick={() => router.push(`/teams/${team.id}/assemble`)}
      className="group cursor-pointer"
    >
      <GlassCard
        className="p-5 transition-all duration-200 group-hover:translate-y-[-2px] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        style={{ border: `1px solid ${team.accentColor}20` }}
      >
        <div className="flex items-center gap-4">
          {/* Lead avatar */}
          <div className="shrink-0">
            <CharacterAvatar
              characterId={team.lead.characterId}
              size={48}
              accentColor={team.accentColor}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TeamIcon teamId={team.id} size="sm" />
              <h3 className="text-base font-medium text-[#fafafa] tracking-[-0.02em]">{team.name}</h3>
            </div>
            <p className="text-sm text-[#a1a1aa] truncate">
              {team.description}
            </p>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#a1a1aa] border border-white/10 transition-all duration-200 group-hover:border-white/20 group-hover:text-white active:scale-[0.98]">
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
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    document.title = "Foundry — Choose Your Squad";
  }, []);

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

      {/* Primary team cards — 3 columns on desktop */}
      <div className="max-w-3xl mx-auto px-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {primaryTeams.map((team, i) => (
            <TeamCard key={team.id} team={team} index={i} />
          ))}
        </div>
      </div>

      {/* More team types toggle */}
      <div className="max-w-3xl mx-auto px-6 pb-4">
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 text-sm text-[#71717a] hover:text-[#a1a1aa] transition-colors duration-200 mx-auto"
        >
          {showMore ? "Less team types" : "More team types"}
          {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Secondary team cards */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="max-w-3xl mx-auto px-6 pb-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {secondaryTeams.map((team, i) => (
                  <TeamCard key={team.id} team={team} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showMore && <div className="pb-24" />}
    </div>
  );
}
